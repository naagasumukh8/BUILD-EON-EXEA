-- ============================================================
-- AI Maritime Supply Decision Platform
-- Supabase PostgreSQL + PostGIS schema
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. reference_ports ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS reference_ports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT UNIQUE NOT NULL,  -- e.g. 'MUM', 'RAS'
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  lat         NUMERIC(9,6) NOT NULL,
  lon         NUMERIC(9,6) NOT NULL,
  geom        GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
                ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
              ) STORED,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. reference_data ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS reference_data (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key                TEXT UNIQUE NOT NULL,
  value              NUMERIC,
  text_value         TEXT,
  unit               TEXT,
  provenance_status  TEXT NOT NULL CHECK (provenance_status IN ('REAL_REFERENCE','SIMULATED','ESTIMATED','CONFIRMED')),
  source             TEXT,
  notes              TEXT,
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. scenarios ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product                     TEXT NOT NULL,
  volume_required             NUMERIC NOT NULL,
  volume_unit                 TEXT NOT NULL DEFAULT 'bbls',
  destination_port_id         UUID REFERENCES reference_ports(id),
  destination_port_name       TEXT,          -- denormalised for display
  deadline_days               INTEGER NOT NULL,
  origin_port_id              UUID REFERENCES reference_ports(id),
  origin_port_name            TEXT,
  supplier                    TEXT,
  purchase_price_usd_per_bbl  NUMERIC,
  purchase_price_provenance   TEXT DEFAULT 'ESTIMATED',
  freight_cost_usd_per_bbl    NUMERIC,
  insurance_cost_usd_per_bbl  NUMERIC,
  handling_cost_usd_per_bbl   NUMERIC,
  vessel_situation            TEXT CHECK (vessel_situation IN ('own','chartered','seeking')),
  vessel_type_required        TEXT,
  priority_cost_weight        NUMERIC DEFAULT 0.4,
  priority_time_weight        NUMERIC DEFAULT 0.35,
  priority_risk_weight        NUMERIC DEFAULT 0.25,
  raw_intake_text             TEXT,
  gemini_parsed               BOOLEAN DEFAULT false,
  status                      TEXT DEFAULT 'draft',  -- draft, active, optimized
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. vessel_candidates ───────────────────────────────────
CREATE TABLE IF NOT EXISTS vessel_candidates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id         UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  mmsi                TEXT,
  imo                 TEXT,
  name                TEXT NOT NULL,
  vessel_type         TEXT,
  flag                TEXT,
  dwt                 NUMERIC,
  current_lat         NUMERIC(9,6),
  current_lon         NUMERIC(9,6),
  geom                GEOGRAPHY(POINT, 4326),
  current_destination TEXT,
  eta_destination     TIMESTAMPTZ,
  speed_knots         NUMERIC,
  heading             NUMERIC,
  source              TEXT NOT NULL,   -- 'aisstream.io' or 'simulated'
  source_type         TEXT NOT NULL,   -- 'AIS_LIVE', 'AIS_CACHED', 'SIMULATED'
  provenance_status   TEXT NOT NULL DEFAULT 'CANDIDATE_UNVERIFIED',
  ais_timestamp       TIMESTAMPTZ,
  raw_ais_payload     JSONB,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. confirmed_deals ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS confirmed_deals (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id              UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  vessel_candidate_id      UUID REFERENCES vessel_candidates(id),
  deal_type                TEXT NOT NULL CHECK (deal_type IN ('vessel','pipeline','alternate_route','supplier')),
  counterparty             TEXT,
  product                  TEXT NOT NULL,
  capacity_pct             NUMERIC,          -- human-entered, 0–100
  capacity_volume          NUMERIC,          -- calculated: scenario.volume_required * capacity_pct/100
  quoted_price             NUMERIC NOT NULL, -- human-entered
  quoted_price_currency    TEXT DEFAULT 'USD',
  quoted_price_unit        TEXT DEFAULT 'lumpsum',  -- 'lumpsum' | 'per_bbl'
  quoted_price_usd         NUMERIC,          -- normalised to USD
  availability_date        DATE,
  contact_reference        TEXT,
  notes                    TEXT,
  provenance_status        TEXT NOT NULL DEFAULT 'CONFIRMED',
  confirmed_at             TIMESTAMPTZ DEFAULT now(),
  -- computed profitability (set by /api/evaluate)
  market_price_used_usd    NUMERIC,
  market_price_provenance  TEXT,
  freight_usd              NUMERIC,
  insurance_usd            NUMERIC,
  handling_usd             NUMERIC,
  landed_cost_usd          NUMERIC,
  landed_cost_per_bbl      NUMERIC,
  expected_revenue_usd     NUMERIC,
  expected_profit_usd      NUMERIC,
  expected_margin_pct      NUMERIC,
  max_acceptable_price_usd NUMERIC,
  deal_verdict             TEXT CHECK (deal_verdict IN ('GO','NEGOTIATE','REJECT')),
  verdict_reason           TEXT,
  profitability_provenance TEXT DEFAULT 'CALCULATED',
  evaluated_at             TIMESTAMPTZ,
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. pipelines ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipelines (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  from_port_id          UUID REFERENCES reference_ports(id),
  to_port_id            UUID REFERENCES reference_ports(id),
  from_name             TEXT,
  to_name               TEXT,
  capacity_mbbl_per_day NUMERIC,
  tariff_usd_per_bbl    NUMERIC,
  transit_days          INTEGER,
  availability          TEXT DEFAULT 'available',
  risk_score            NUMERIC DEFAULT 0.08,
  product_compatible    TEXT[],  -- e.g. '{crude,diesel}'
  provenance_status     TEXT NOT NULL DEFAULT 'REAL_REFERENCE',
  source                TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. alternate_routes ────────────────────────────────────
CREATE TABLE IF NOT EXISTS alternate_routes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  from_port_id        UUID REFERENCES reference_ports(id),
  to_port_id          UUID REFERENCES reference_ports(id),
  from_name           TEXT,
  to_name             TEXT,
  distance_km         NUMERIC,
  transit_days        INTEGER,
  freight_usd_per_bbl NUMERIC,
  risk_score          NUMERIC DEFAULT 0.15,
  product_compatible  TEXT[],
  provenance_status   TEXT NOT NULL DEFAULT 'SIMULATED',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. optimization_runs ───────────────────────────────────
CREATE TABLE IF NOT EXISTS optimization_runs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id  UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  solver       TEXT DEFAULT 'or_tools',
  weights_used JSONB,
  status       TEXT DEFAULT 'pending',  -- pending, running, done, failed
  error        TEXT,
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ─── 9. strategies ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS strategies (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  optimization_run_id   UUID REFERENCES optimization_runs(id) ON DELETE CASCADE,
  scenario_id           UUID REFERENCES scenarios(id),
  rank                  INTEGER NOT NULL,
  is_recommended        BOOLEAN DEFAULT false,
  is_baseline           BOOLEAN DEFAULT false,
  name                  TEXT,
  total_cost_usd        NUMERIC,
  cost_per_bbl          NUMERIC,
  expected_profit_usd   NUMERIC,
  expected_margin_pct   NUMERIC,
  eta_days              INTEGER,
  risk_score            NUMERIC,
  coverage_pct          NUMERIC,
  allocated_volume      NUMERIC,
  provenance_status     TEXT DEFAULT 'CALCULATED',
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── 10. strategy_allocations ───────────────────────────────
CREATE TABLE IF NOT EXISTS strategy_allocations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id      UUID REFERENCES strategies(id) ON DELETE CASCADE,
  option_type      TEXT NOT NULL,  -- 'vessel','pipeline','alternate_route','supplier'
  option_id        UUID,
  option_name      TEXT,
  allocated_volume NUMERIC,
  allocated_pct    NUMERIC,
  cost_usd         NUMERIC,
  eta_days         INTEGER,
  risk_score       NUMERIC,
  provenance_status TEXT DEFAULT 'CALCULATED',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── 11. decision_reports ───────────────────────────────────
CREATE TABLE IF NOT EXISTS decision_reports (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id          UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  optimization_run_id  UUID REFERENCES optimization_runs(id),
  report_text          TEXT,
  report_markdown      TEXT,
  generated_by         TEXT DEFAULT 'gemini',
  model_used           TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vessel_candidates_scenario ON vessel_candidates(scenario_id);
CREATE INDEX IF NOT EXISTS idx_vessel_candidates_geom ON vessel_candidates USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_confirmed_deals_scenario ON confirmed_deals(scenario_id);
CREATE INDEX IF NOT EXISTS idx_strategies_run ON strategies(optimization_run_id);
CREATE INDEX IF NOT EXISTS idx_strategy_allocs ON strategy_allocations(strategy_id);
CREATE INDEX IF NOT EXISTS idx_reports_scenario ON decision_reports(scenario_id);

-- ─── SEED: reference ports ───────────────────────────────────
INSERT INTO reference_ports (code, name, country, lat, lon) VALUES
  ('RAS', 'Ras Tanura',      'Saudi Arabia',   26.6400,  50.1600),
  ('AUH', 'Abu Dhabi (ADNOC)','UAE',           24.4539,  54.3773),
  ('FUJ', 'Fujairah',        'UAE',            25.1288,  56.3264),
  ('KHO', 'Kharg Island',    'Iran',           29.2325,  50.3285),
  ('MUS', 'Muscat',          'Oman',           23.5880,  58.3829),
  ('MUM', 'Mumbai (JNPT)',   'India',          18.9500,  72.8300),
  ('CHN', 'Chennai',         'India',          13.0827,  80.2707),
  ('SIN', 'Singapore',       'Singapore',       1.2897, 103.8501),
  ('SHG', 'Shanghai',        'China',          31.2304, 121.4737),
  ('RDM', 'Rotterdam',       'Netherlands',    51.9244,   4.4777),
  ('HPT', 'Houston',         'USA',            29.7604, -95.3698),
  ('YAN', 'Yanbu',           'Saudi Arabia',   24.0800,  38.0500),
  ('AKA', 'Aqaba',           'Jordan',         29.5267,  35.0060),
  ('DJI', 'Djibouti',        'Djibouti',       11.5720,  43.1450),
  ('SGH', 'Shuaiba',         'Kuwait',         29.0467,  48.1483),
  ('BSR', 'Basra',           'Iraq',           30.5085,  47.7804)
ON CONFLICT (code) DO NOTHING;

-- ─── SEED: pipelines ─────────────────────────────────────────
INSERT INTO pipelines (name, from_name, to_name, capacity_mbbl_per_day, tariff_usd_per_bbl, transit_days, availability, risk_score, product_compatible, provenance_status, source, notes) VALUES
  ('IPSA (Saudi-Red Sea)',      'Ras Tanura',  'Yanbu',       5000, 1.40, 3,  'available',   0.06, '{crude}',         'REAL_REFERENCE', 'IEA/UNCTAD',    'Habshan-Fujairah + IPSA bypass. Avoids Hormuz.'),
  ('Habshan-Fujairah (ADNOC)', 'Abu Dhabi',   'Fujairah',    1500, 1.20, 1,  'available',   0.05, '{crude}',         'REAL_REFERENCE', 'ADNOC official','Abu Dhabi strategic bypass.'),
  ('SUMED (Egypt)',             'Ain Sukhna',  'Sidi Kerir',  2500, 2.10, 1,  'available',   0.10, '{crude,refined}', 'REAL_REFERENCE', 'Suez Canal Auth','Red Sea → Mediterranean. Bypasses Suez Canal.'),
  ('Kirkuk-Ceyhan (Iraq-Turkey)','Kirkuk',     'Ceyhan',      600,  1.60, 7,  'available',   0.18, '{crude}',         'REAL_REFERENCE', 'IEA',           'Iraq-Turkey pipeline.'),
  ('Trans-Arabian (Tapline)',   'Qaisumah',    'Sidon',       800,  0.90, 5,  'limited',     0.25, '{crude}',         'SIMULATED',      'Historical',    'Partially operational. Capacity limited.')
ON CONFLICT DO NOTHING;

-- ─── SEED: reference_data ────────────────────────────────────
INSERT INTO reference_data (key, value, text_value, unit, provenance_status, source, notes) VALUES
  ('diesel_market_price_usd_per_bbl',   85.00, NULL,   'USD/bbl', 'SIMULATED', 'Demo default', 'Update with live price'),
  ('crude_market_price_usd_per_bbl',    82.00, NULL,   'USD/bbl', 'SIMULATED', 'Demo default', 'Update with live price'),
  ('gasoline_market_price_usd_per_bbl', 88.00, NULL,   'USD/bbl', 'SIMULATED', 'Demo default', 'Update with live price'),
  ('inr_usd_rate',                      83.50, NULL,   'INR/USD', 'SIMULATED', 'Demo default', 'Update with live rate'),
  ('standard_insurance_usd_per_bbl',     0.15, NULL,   'USD/bbl', 'SIMULATED', 'Industry est', NULL),
  ('standard_handling_usd_per_bbl',      0.10, NULL,   'USD/bbl', 'SIMULATED', 'Industry est', NULL),
  ('default_vlcc_freight_usd_per_bbl',   1.50, NULL,   'USD/bbl', 'SIMULATED', 'Industry est', 'Persian Gulf → India'),
  ('default_suezmax_freight_usd_per_bbl',1.80, NULL,   'USD/bbl', 'SIMULATED', 'Industry est', NULL),
  ('min_target_margin',                  0.08, NULL,   'ratio',   'SIMULATED', 'Demo default', '8% minimum margin threshold')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── RLS (disable for hackathon MVP, enable in production) ───
-- ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
-- (Add policies when Supabase Auth is integrated)
