// Maritime Decision Network — /api/solve
// Full pipeline: intake → candidates → optimize → AI explain

import { spawn } from "child_process";
import path from "path";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const scenario = body?.scenario || body || {};

  // Call Python optimizer via subprocess
  try {
    const result = await callPythonOptimizer(scenario, body?.weights);
    return res.status(200).json(result);
  } catch (err) {
    // JS-side fallback if Python not available
    console.error("[solve] Python call failed, using JS fallback:", err.message);
    const fallback = await jsFallbackOptimize(scenario);
    return res.status(200).json(fallback);
  }
}

async function callPythonOptimizer(scenario, weights) {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import sys, json, os
sys.path.insert(0, '${process.cwd().replace(/\\/g, "/")}')
from lib.optimizer import run_full_optimization
from lib.ai_service import explain_strategy

scenario = ${JSON.stringify(scenario)}
weights = ${weights ? JSON.stringify(weights) : "None"}

try:
    result = run_full_optimization(scenario, weights)
    if result.get("strategies"):
        exp = explain_strategy(result, scenario)
        result["ai_explanation"] = exp
    print(json.dumps(result, default=str))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

    const proc = spawn("python3", ["-c", pythonScript], {
      env: { ...process.env },
      timeout: 30000
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", d => stdout += d);
    proc.stderr.on("data", d => stderr += d);

    proc.on("close", code => {
      try {
        const data = JSON.parse(stdout.trim());
        if (data.error) reject(new Error(data.error));
        else resolve(data);
      } catch {
        reject(new Error(`Python parse error: ${stderr}`));
      }
    });

    proc.on("error", err => reject(err));
  });
}

// JS-side lightweight fallback (no OR-Tools, no AI)
async function jsFallbackOptimize(scenario) {
  const vessels = await fetchDevVessels();
  const pipelines = await fetchDevPipelines();
  const volumeMbbl = parseFloat(scenario.volume_mbbl || 500);
  const maxDays = parseFloat(scenario.max_days || 30);

  const candidates = [
    ...vessels.map(v => ({
      id: `vessel-${v.mmsi}`,
      type: "vessel",
      name: v.name,
      vessel_type: v.vessel_type,
      available_volume_mbbl: v.estimated_spare_mbbl || 100,
      max_volume_mbbl: v.estimated_spare_mbbl || 100,
      eta_days: v.eta_days || 10,
      freight_usd_per_bbl: 1.50,
      route_risk: 0.15,
      confidence: v.confidence || "low",
      data_source: v.data_source,
      note: v.note
    })),
    ...pipelines.map(p => ({
      id: `pipeline-${p.id}`,
      type: "pipeline",
      name: p.name,
      available_volume_mbbl: volumeMbbl,
      max_volume_mbbl: volumeMbbl,
      eta_days: p.transit_days,
      freight_usd_per_bbl: p.tariff_usd_per_barrel,
      route_risk: p.availability === "available" ? 0.08 : 0.35,
      confidence: p.confidence,
      data_source: "curated_scenario_data",
      note: p.notes || ""
    }))
  ].filter(c => c.eta_days <= maxDays && c.available_volume_mbbl > 0);

  const sorted = candidates.sort((a, b) => {
    const scoreA = 0.4 * a.freight_usd_per_bbl / 10 + 0.35 * a.eta_days / 30 + 0.25 * a.route_risk;
    const scoreB = 0.4 * b.freight_usd_per_bbl / 10 + 0.35 * b.eta_days / 30 + 0.25 * b.route_risk;
    return scoreA - scoreB;
  });

  const strategies = [];

  // Best single
  if (sorted[0]) {
    const c = sorted[0];
    const vol = Math.min(c.available_volume_mbbl, volumeMbbl);
    strategies.push({
      name: `Single: ${c.name}`,
      allocation: [{ ...c, allocated_mbbl: vol, allocation_pct: Math.round(vol / volumeMbbl * 100) }],
      total_allocated_mbbl: vol,
      coverage_pct: Math.min(vol / volumeMbbl * 100, 100).toFixed(1),
      weighted_freight_usd_per_bbl: c.freight_usd_per_bbl,
      estimated_total_cost_usd: Math.round(c.freight_usd_per_bbl * vol * 1000),
      eta_days: c.eta_days,
      weighted_risk: c.route_risk,
      is_hybrid: false, is_winner: true, confidence: c.confidence
    });
  }

  // Hybrid: top-2
  if (sorted.length >= 2) {
    const c1 = sorted[0], c2 = sorted[1];
    const v1 = Math.min(c1.available_volume_mbbl, volumeMbbl * 0.6);
    const v2 = Math.min(c2.available_volume_mbbl, volumeMbbl - v1);
    if (v1 + v2 >= volumeMbbl * 0.9) {
      strategies[0].is_winner = false;
      strategies.push({
        name: `Hybrid: ${c1.name} + ${c2.name}`,
        allocation: [
          { ...c1, allocated_mbbl: Math.round(v1), allocation_pct: Math.round(v1 / volumeMbbl * 100) },
          { ...c2, allocated_mbbl: Math.round(v2), allocation_pct: Math.round(v2 / volumeMbbl * 100) }
        ],
        total_allocated_mbbl: Math.round(v1 + v2),
        coverage_pct: Math.min((v1 + v2) / volumeMbbl * 100, 100).toFixed(1),
        weighted_freight_usd_per_bbl: ((c1.freight_usd_per_bbl * v1 + c2.freight_usd_per_bbl * v2) / (v1 + v2)).toFixed(2),
        estimated_total_cost_usd: Math.round((c1.freight_usd_per_bbl * v1 + c2.freight_usd_per_bbl * v2) * 1000),
        eta_days: Math.max(c1.eta_days, c2.eta_days),
        weighted_risk: ((c1.route_risk * v1 + c2.route_risk * v2) / (v1 + v2)).toFixed(3),
        is_hybrid: true, is_winner: true, confidence: "estimated"
      });
    }
  }

  return {
    strategies,
    volume_required_mbbl: volumeMbbl,
    solver: "js_greedy_fallback",
    warning: "Running JS fallback solver. Install Python + lib/optimizer.py for full OR-Tools optimization.",
    scenario,
    ai_explanation: {
      status: "no_api_key",
      text: "AI explanation unavailable — add GEMINI_API_KEY to .env",
      provider: null
    }
  };
}

async function fetchDevVessels() {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  try {
    const data = JSON.parse(readFileSync(join(process.cwd(), "lib/data/vessels_fallback.json"), "utf8"));
    return data.vessels || [];
  } catch { return []; }
}

async function fetchDevPipelines() {
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  try {
    const data = JSON.parse(readFileSync(join(process.cwd(), "lib/data/pipelines.json"), "utf8"));
    return data.pipelines || [];
  } catch { return []; }
}
