// EON EXEA — Maritime Decision Network
// script.js: Mostar-exact scroll animation engine + Maritime Command Center logic

// ═══════════════════════════════════════
// 1. MOSTAR ANIMATION ENGINE (exact math)
// ═══════════════════════════════════════

const section = document.querySelector(".cinema-scroll"); // may be null in new layout
const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const track = document.querySelector(".sights-track");
const sightsControls = document.getElementById("sights-controls");
const sightPrev = document.getElementById("sight-prev");
const sightNext = document.getElementById("sight-next");
const originalCards = track ? Array.from(document.querySelectorAll(".sights-track > .sight-card")) : [];

// State
let targetMouseX = 0, targetMouseY = 0;
let mouseX = 0, mouseY = 0;
let targetScroll = 0, smoothScroll = 0;
let initialized = false, rafPending = false;
let sightCards = [];
let originalSightCount = originalCards.length;
let activeSight = originalSightCount;

// Helpers (exact Mostar)
function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
function smoothstep(e0, e1, v) { const x = clamp((v - e0) / (e1 - e0)); return x * x * (3 - 2 * x); }
function lerp(a, b, t) { return a + (b - a) * t; }
function segmentInOut(s, a, b, c, d) {
  const enter = smoothstep(a, b, s), exit = smoothstep(c, d, s);
  return { enter, exit, active: enter * (1 - exit) };
}
function getScrollDistance() {
  if (!section) return 0;
  return clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);
}

function set(name, value) { root.style.setProperty(`--${name}`, value); }

function update() {
  rafPending = false;

  targetScroll = getScrollDistance();
  if (!initialized || reduceMotion.matches) { smoothScroll = targetScroll; initialized = true; }
  else { smoothScroll = lerp(smoothScroll, targetScroll, 0.14); }
  if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

  mouseX = lerp(mouseX, targetMouseX, 0.12);
  mouseY = lerp(mouseY, targetMouseY, 0.12);

  const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
  const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
  const progress = clamp(smoothScroll / 2700);
  const introExit = smoothstep(90, 650, smoothScroll);
  const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
  const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
  const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
  const blurActive = clamp(frame2.active + frame3.active);
  const frame2Opacity = frame2.active * (1 - frame3.enter);
  const splitDrift = Math.pow(frame2.enter, 1.5);
  const panel2Opacity = frame2.active * (1 - frame2.exit);
  const panel3Opacity = frame3.active * (1 - frame3.exit);
  const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
  const sharedHeroY = progress * -74;
  const sharedHeroScale = progress * 0.23;
  const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
  const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

  // Variable writes (verbatim from Mostar spec)
  set("mx", reduceMotion.matches ? "0" : mouseX.toFixed(4));
  set("my", reduceMotion.matches ? "0" : mouseY.toFixed(4));

  set("back-opacity", (1 - frame2.active * 0.06));
  set("back-x", `${mouseX * -12}px`);
  set("back-y", `${mouseY * -4}px`);
  set("back-scale", backScale);
  set("four-y", `${10 + progress * 10}vh`);
  set("four-scale", 0.78 + progress * 0.16);
  set("bazaar-y", `${20 - progress * 8}vh`);
  set("blur-px", `${blurActive * 14}px`);
  set("back-brightness", 1 - blurActive * 0.255);
  set("bazaar-blur-px", `${frame2.active * 14}px`);
  set("bazaar-brightness", 1 - frame2.active * 0.255 - frame3.active * 0.06);
  set("bazaar-saturation", 1 + frame3.active * 0.18);
  set("shade-opacity", "1");
  set("shade-z", frame2.active > 0.02 ? "2" : "0");
  set("shade-top-alpha", blurActive * 0.465);
  set("shade-mid-alpha", blurActive * 0.42);
  set("shade-bottom-alpha", blurActive * 0.51);

  set("title-y", `${introExit * -210}px`);
  set("title-scale", 1 - introExit * 0.08);
  set("title-opacity", 1 - introExit);

  set("bridge-x", `calc(-50% + ${mouseX * 18}px)`);
  set("bridge-y", `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
  set("bridge-bottom", `${5 - frame2.enter * 13}vh`);
  set("bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
  set("bridge-scale", 1.02 + sharedHeroScale + frame2.exit * 0.46);

  set("split-left-x", `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`);
  set("split-left-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
  set("split-left-scale", 1 + sharedHeroScale + frame2.enter * 0.74);
  set("split-right-x", `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`);
  set("split-right-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
  set("split-right-scale", 1 + sharedHeroScale + frame2.enter * 0.74);

  set("frame2-opacity", frame2Opacity);
  set("frame2-x", `calc(-50% + ${mouseX * 10}px)`);
  set("frame2-y", `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
  set("frame2-scale", 1.06 + frame2.enter * 0.08 + frame2.exit * 0.08);

  set("intro-copy-y", `${introExit * 90}px`);
  set("intro-copy-opacity", 1 - introExit);
  set("panel2-opacity", panel2Opacity);
  set("panel2-y", `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
  set("panel3-opacity", panel3Opacity);
  set("panel3-y", `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);

  set("sights-opacity", sightsEnter);
  set("sights-controls-opacity", sightsControlsEnter);
  sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
  set("sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
  set("sights-y", "0px");
  set("sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
  set("sights-scale", 1 / backScale);
  set("sights-top", `${sightsParentTop}px`);
  set("sights-screen-top", `${sightsScreenTop}px`);

  // Continue RAF while still animating
  if (
    Math.abs(smoothScroll - targetScroll) > 0.08 ||
    Math.abs(mouseX - targetMouseX) > 0.001 ||
    Math.abs(mouseY - targetMouseY) > 0.001
  ) {
    requestTick();
  }
}

function requestTick() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(update);
  }
}

// Event listeners
window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", () => { updateSightSlider(); requestTick(); });
window.addEventListener("pointermove", e => {
  targetMouseX = e.clientX / innerWidth - 0.5;
  targetMouseY = e.clientY / innerHeight - 0.5;
  requestTick();
}, { passive: true });

// ═══════════════════════════════════════
// 2. VESSEL OPPORTUNITY CARDS (= Mostar sight-cards)
//    Infinite slider: 3-set clone
// ═══════════════════════════════════════

// Default vessel card data (populated from API or dev fallback)
const DEFAULT_VESSEL_CARDS = [
  {
    kicker: "VLCC Tanker",
    name: "MV Atlantic Pioneer",
    desc: "Est. 150 Mbbl spare. Route: Persian Gulf → Indian Ocean → Singapore. ETA 12 days.",
    icon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
    confidence: "estimated"
  },
  {
    kicker: "Suezmax",
    name: "MT Gulf Meridian",
    desc: "Est. 150 Mbbl spare. Route: Persian Gulf → Suez Canal → Rotterdam. ETA 18 days.",
    icon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
    confidence: "estimated"
  },
  {
    kicker: "Aframax",
    name: "MT Horizon Star",
    desc: "Est. 170 Mbbl spare. Route: Fujairah → Arabian Sea → Mumbai. ETA 4 days.",
    icon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png",
    confidence: "estimated"
  },
  {
    kicker: "VLCC Tanker",
    name: "MV Pacific Fortune",
    desc: "Est. 220 Mbbl spare. Route: Abu Dhabi → Indian Ocean → China. ETA 16 days.",
    icon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
    confidence: "estimated"
  },
  {
    kicker: "MR Tanker",
    name: "MT Coral Sea",
    desc: "Est. 50 Mbbl spare. Route: Djibouti → Arabian Sea → Mumbai. ETA 6 days.",
    icon: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
    confidence: "estimated"
  }
];

function buildSightCard(data, index, setIndex) {
  const card = document.createElement("article");
  card.className = "sight-card";
  card.tabIndex = 0;
  card.role = "button";
  card.dataset.sightIndex = setIndex * DEFAULT_VESSEL_CARDS.length + index;
  card.setAttribute("aria-label", `Open ${data.name} vessel card`);

  card.innerHTML = `
    <span class="sight-kicker">${data.kicker}</span>
    <img class="sight-pin" src="${data.icon}" alt="" />
    <h3>${data.name}</h3>
    <p>${data.desc}</p>
    <span class="conf-badge">${data.confidence}</span>
  `;
  return card;
}

function setupSightSlider() {
  track.replaceChildren();
  const cards = DEFAULT_VESSEL_CARDS;
  originalSightCount = cards.length;

  for (let setIndex = 0; setIndex < 3; setIndex++) {
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
      const clone = buildSightCard(cards[cardIndex], cardIndex, setIndex);
      track.appendChild(clone);
    }
  }

  sightCards = Array.from(track.querySelectorAll(".sight-card"));
  activeSight = originalSightCount;

  sightCards.forEach(card => {
    card.addEventListener("click", () => selectSightCard(card));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSightCard(card); }
    });
  });

  track.addEventListener("transitionend", normalizeSightSlider);
  updateSightSlider();
}

function updateSightSlider() {
  if (!sightCards.length) return;
  const cardWidth = sightCards[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).columnGap || "0");
  set("sights-shift", `${-(cardWidth + gap) * activeSight}px`);
  sightCards.forEach(c => c.classList.toggle("is-active", Number(c.dataset.sightIndex) === activeSight));
}

function moveSightSlider(dir) { activeSight += dir; updateSightSlider(); }
function selectSightCard(card) {
  const i = Number(card.dataset.sightIndex);
  if (Number.isFinite(i)) { activeSight = i; updateSightSlider(); }
}

function jumpSightSlider(i) {
  track.classList.add("is-jumping");
  activeSight = i;
  updateSightSlider();
  requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("is-jumping")));
}

function normalizeSightSlider() {
  if (activeSight >= originalSightCount * 2) jumpSightSlider(activeSight - originalSightCount);
  else if (activeSight < originalSightCount) jumpSightSlider(activeSight + originalSightCount);
}

if (sightPrev) sightPrev.addEventListener("click", () => moveSightSlider(-1));
if (sightNext) sightNext.addEventListener("click", () => moveSightSlider(1));

// ═══════════════════════════════════════
// 3. COMMAND CENTER CONTROLLER
// ═══════════════════════════════════════

let mapInstance = null;
let mapInitialized = false;

const btnOpenCommand = document.getElementById("btn-open-command");
const btnOpenCommand2 = document.getElementById("btn-open-command-2");
const btnHeroStart = document.getElementById("btn-hero-start");
const navCommandLink = document.getElementById("nav-command-link");
const btnCloseCommand = document.getElementById("btn-close-command");

function openCommandCenter() {
  const cc = document.getElementById("command-center");
  if (cc) {
    cc.classList.remove("hidden");
    if (!mapInitialized) {
      setTimeout(() => {
        initMap();
        mapInitialized = true;
      }, 50);
    } else if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }
    cc.scrollIntoView({ behavior: "smooth" });
  }
}

function closeCommandCenter() {
  const cc = document.getElementById("command-center");
  if (cc) cc.classList.add("hidden");
  const hero = document.getElementById("hero");
  if (hero) hero.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

if (btnOpenCommand) btnOpenCommand.addEventListener("click", openCommandCenter);
if (btnOpenCommand2) btnOpenCommand2.addEventListener("click", openCommandCenter);
if (btnHeroStart) btnHeroStart.addEventListener("click", openCommandCenter);
if (navCommandLink) navCommandLink.addEventListener("click", (e) => { e.preventDefault(); openCommandCenter(); });
if (btnCloseCommand) btnCloseCommand.addEventListener("click", closeCommandCenter);

// Also allow #command-center anchor
if (window.location.hash === "#command-center") openCommandCenter();
document.querySelectorAll('a[href="#command-center"]').forEach(a => {
  a.addEventListener("click", e => { e.preventDefault(); openCommandCenter(); });
});

// ─── Map ───────────────────────────────
function initMap() {
  if (typeof L === "undefined") return;

  mapInstance = L.map("map", {
    center: [18, 58],
    zoom: 4,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 10
  }).addTo(mapInstance);

  // Disrupted route: Strait of Hormuz
  const disrupted = L.polyline([
    [26.35, 50.10],  // Ras Tanura
    [26.56, 56.25],  // Hormuz chokepoint
    [22.50, 60.20],  // Gulf of Oman
    [18.0, 68.0],    // Arabian Sea
    [12.5, 66.0],
    [8.0, 72.0],
    [18.95, 72.83]   // Mumbai
  ], {
    color: "#ef4444",
    weight: 2.5,
    dashArray: "6, 6",
    opacity: 0.85
  }).addTo(mapInstance);
  disrupted.bindTooltip("⚠ Disrupted: Strait of Hormuz", { permanent: false, direction: "top" });

  // Pipeline bypass: IPSA
  const pipeline = L.polyline([
    [26.35, 50.10],  // Eastern KSA
    [24.08, 38.05],  // Yanbu, Red Sea
  ], { color: "#f59e0b", weight: 3, opacity: 0.9 }).addTo(mapInstance);
  pipeline.bindTooltip("IPSA Pipeline Bypass", { permanent: false });

  // Alt route: Cape bypass (dashed green)
  const altRoute = L.polyline([
    [22.50, 60.20],
    [12.0, 55.0],
    [4.0, 48.0],
    [-12.0, 42.0],
    [-34.0, 25.0],  // Cape of Good Hope area
    [-6.0, 55.0],
    [8.0, 72.0],
    [18.95, 72.83]
  ], { color: "#10b981", weight: 2, dashArray: "4, 8", opacity: 0.7 }).addTo(mapInstance);
  altRoute.bindTooltip("Alternate: Cape of Good Hope route", { permanent: false });

  // Sample vessel markers
  const vesselIcon = L.divIcon({
    html: "🚢",
    className: "vessel-map-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  [
    [22.50, 60.20, "MV Atlantic Pioneer", "VLCC — Est. 150 Mbbl spare"],
    [15.80, 52.30, "MT Gulf Meridian", "Suezmax — Est. 150 Mbbl spare"],
    [18.20, 68.40, "MT Horizon Star", "Aframax — Est. 170 Mbbl spare"]
  ].forEach(([lat, lon, name, desc]) => {
    L.marker([lat, lon], { icon: vesselIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>${name}</b><br><small>${desc}</small><br><small style="color:#f59e0b">⚠ Estimated capacity — not confirmed</small>`);
  });

  // Port markers
  [
    [26.64, 50.16, "Ras Tanura (Origin)", "#3b82f6"],
    [18.95, 72.83, "Mumbai (Destination)", "#10b981"],
    [24.08, 38.05, "Yanbu (Pipeline end)", "#f59e0b"]
  ].forEach(([lat, lon, name, color]) => {
    L.circleMarker([lat, lon], { radius: 7, color, fillColor: color, fillOpacity: 0.9, weight: 2 })
      .addTo(mapInstance)
      .bindPopup(`<b>${name}</b>`);
  });
}

function updateMapForDisruption(disruptionId) {
  // Map is already initialized with Hormuz disruption.
  // In a full implementation, re-draw routes based on selected disruption.
  // For now, just update the banner.
  const scenarios = {
    "hormuz-blockage": {
      name: "Strait of Hormuz — Elevated Passage Risk",
      meta: "Risk score: 0.87 · ~21M bbl/day affected · Insurance premium +45%"
    },
    "suez-closure": {
      name: "Suez Canal — Closed",
      meta: "Risk score: 0.72 · ~9M bbl/day affected · Insurance premium +30%"
    },
    "malacca-restriction": {
      name: "Strait of Malacca — Restricted Access",
      meta: "Risk score: 0.58 · ~15M bbl/day affected · Insurance premium +22%"
    }
  };
  const s = scenarios[disruptionId];
  if (s) {
    document.getElementById("disruption-name").textContent = s.name;
    document.getElementById("disruption-meta").textContent = s.meta;
  }
}

document.getElementById("disruption-select").addEventListener("change", e => {
  updateMapForDisruption(e.target.value);
  document.getElementById("f-disruption").value = e.target.value;
});

// ─── API Health ───────────────────────
async function checkApiHealth() {
  const dot = document.getElementById("cc-status-dot");
  const text = document.getElementById("cc-status-text");
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      dot.classList.add("online");
      const aiLabel = data.providers?.ai !== "none" ? `AI: ${data.providers.ai}` : "AI: offline";
      text.textContent = `API Online · ${aiLabel}`;
    } else {
      text.textContent = "API: Limited";
    }
  } catch {
    text.textContent = "API: Offline (using fallback)";
  }
}

// ─── Vessel Opportunities ─────────────
async function loadVesselOpportunities() {
  const row = document.getElementById("vessel-cards-row");
  const badge = document.getElementById("vessel-data-badge");

  try {
    const res = await fetch("/api/vessels");
    const data = await res.json();
    
    if (data.warning) {
      badge.textContent = "⚠ " + (data.source === "dev_fallback" ? "Dev fallback — not real AIS data" : data.warning);
    } else if (data.source === "aisstream.io") {
      badge.textContent = "Live AIS data via aisstream.io";
      badge.style.background = "rgba(16, 185, 129, 0.12)";
      badge.style.color = "#10b981";
    }

    row.innerHTML = "";
    (data.vessels || []).forEach(v => {
      const card = document.createElement("div");
      card.className = "vessel-opp-card";
      card.innerHTML = `
        <div class="vcard-name">${v.name}</div>
        <div class="vcard-type">${v.vessel_type || "Tanker"}</div>
        <div class="vcard-row">
          <span class="vcard-label">Est. Spare Cap.</span>
          <span class="vcard-val">${v.estimated_spare_mbbl || "?"} Mbbl</span>
        </div>
        <div class="vcard-row">
          <span class="vcard-label">ETA to Dest.</span>
          <span class="vcard-val">${v.eta_days || "?"} days</span>
        </div>
        <div class="vcard-row">
          <span class="vcard-label">Route</span>
          <span class="vcard-val" style="font-size:10px;text-align:right;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.destination_port || v.route || "—"}</span>
        </div>
        <span class="vcard-conf">${v.confidence || "estimated"}</span>
      `;
      row.appendChild(card);
    });
  } catch (err) {
    row.innerHTML = `<div style="color:var(--cc-muted);font-size:13px;padding:10px">Unable to load vessel data. Start API server (python server.py) or add AISSTREAM_API_KEY.</div>`;
  }
}

// ─── Intake Multi-Step Form ────────────
let currentStep = 1;

function goToStep(step) {
  document.querySelectorAll(".intake-step").forEach(s => s.classList.remove("active"));
  document.getElementById(`step-${step}`).classList.add("active");

  document.querySelectorAll(".step-dot").forEach(d => {
    const n = Number(d.dataset.step);
    d.classList.remove("active", "done");
    if (n === step) d.classList.add("active");
    else if (n < step) d.classList.add("done");
  });

  currentStep = step;
}

function nextStep(current) {
  if (current === 3) {
    const mode = document.querySelector('input[name="vessel-mode"]:checked')?.value;
    document.getElementById("own-vessel-fields").style.display =
      (mode === "own" || mode === "chartered") ? "block" : "none";
  }
  goToStep(current + 1);
}

function prevStep(current) { goToStep(current - 1); }

// Update weight display
function updateWeights() {
  const cost = Number(document.getElementById("w-cost").value);
  const time = Number(document.getElementById("w-time").value);
  const risk = Number(document.getElementById("w-risk").value);
  const total = cost + time + risk || 1;
  document.getElementById("wv-cost").textContent = Math.round(cost / total * 100) + "%";
  document.getElementById("wv-time").textContent = Math.round(time / total * 100) + "%";
  document.getElementById("wv-risk").textContent = Math.round(risk / total * 100) + "%";
}

function updateWhatIfWeights() {
  const cost = Number(document.getElementById("wi-cost").value);
  const time = Number(document.getElementById("wi-time").value);
  const risk = Number(document.getElementById("wi-risk").value);
  const total = cost + time + risk || 1;
  document.getElementById("wiv-cost").textContent = Math.round(cost / total * 100) + "%";
  document.getElementById("wiv-time").textContent = Math.round(time / total * 100) + "%";
  document.getElementById("wiv-risk").textContent = Math.round(risk / total * 100) + "%";
}

function getWeights() {
  const cost = Number(document.getElementById("w-cost").value);
  const time = Number(document.getElementById("w-time").value);
  const risk = Number(document.getElementById("w-risk").value);
  const total = cost + time + risk || 1;
  return { cost: cost / total, time: time / total, risk: risk / total, emissions: 0 };
}

function getWhatIfWeights() {
  const cost = Number(document.getElementById("wi-cost").value);
  const time = Number(document.getElementById("wi-time").value);
  const risk = Number(document.getElementById("wi-risk").value);
  const total = cost + time + risk || 1;
  return { cost: cost / total, time: time / total, risk: risk / total, emissions: 0 };
}

function buildScenario() {
  return {
    product: document.getElementById("f-product").value,
    volume_mbbl: Number(document.getElementById("f-volume").value),
    destination_port_id: document.getElementById("f-dest").value,
    max_days: Number(document.getElementById("f-deadline").value),
    origin_port_id: document.getElementById("f-origin").value,
    disruption_id: document.getElementById("f-disruption").value,
    vessel_mode: document.querySelector('input[name="vessel-mode"]:checked')?.value || "seeking",
    purchase_price_usd: document.getElementById("f-price").value || null
  };
}

// ─── Run Analysis ──────────────────────
async function runAnalysis() {
  const btn = document.getElementById("btn-analyze");
  const spinner = document.getElementById("analyze-spinner");
  
  btn.disabled = true;
  spinner.classList.remove("hidden");

  const scenario = buildScenario();
  const weights = getWeights();
  lastScenario = scenario;

  try {
    const res = await fetch("/api/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario, weights })
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    lastOptResult = data;
    lastExplanation = data.ai_explanation;

    showResults(data, scenario);
  } catch (err) {
    showErrorToast(`Analysis failed: ${err.message}. Is the Python server running?`);
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
}

async function runWhatIf() {
  if (!lastScenario) return;
  const weights = getWhatIfWeights();
  const btn = document.getElementById("btn-whatif");
  btn.textContent = "Re-running...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: lastScenario, weights })
    });
    const data = await res.json();
    lastOptResult = data;
    lastExplanation = data.ai_explanation;
    renderStrategyBoard(data);
    renderAiExplanation(data.ai_explanation);
  } catch (err) {
    showErrorToast(`What-if failed: ${err.message}`);
  } finally {
    btn.textContent = "Re-run with new weights →";
    btn.disabled = false;
  }
}

function showResults(data, scenario) {
  document.getElementById("intake-section").classList.add("hidden");
  document.getElementById("results-section").classList.remove("hidden");

  // Sync what-if sliders with intake weights
  document.getElementById("wi-cost").value = document.getElementById("w-cost").value;
  document.getElementById("wi-time").value = document.getElementById("w-time").value;
  document.getElementById("wi-risk").value = document.getElementById("w-risk").value;
  updateWhatIfWeights();

  renderStrategyBoard(data);
  renderAiExplanation(data.ai_explanation);
}

function backToIntake() {
  document.getElementById("results-section").classList.add("hidden");
  document.getElementById("intake-section").classList.remove("hidden");
  goToStep(1);
}

// ─── Strategy Board ────────────────────
function renderStrategyBoard(data) {
  const board = document.getElementById("strategy-board");
  const strategies = data.strategies || [];

  if (!strategies.length) {
    board.innerHTML = `<div style="color:var(--cc-muted);padding:20px;text-align:center">No feasible strategies found. Adjust your parameters.</div>`;
    return;
  }

  board.innerHTML = "";

  strategies.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "strategy-card" + (s.is_winner ? " winner" : "");

    const riskClass = s.weighted_risk < 0.2 ? "risk-low" : s.weighted_risk < 0.5 ? "risk-med" : "risk-high";

    card.innerHTML = `
      <div class="strategy-header">
        ${s.is_winner ? '<span class="winner-badge">OPTIMAL</span>' : `<span style="font-size:11px;color:var(--cc-muted)">#${i + 1}</span>`}
        ${s.is_hybrid ? '<span class="hybrid-badge">HYBRID</span>' : ''}
        <span class="strategy-name">${s.name}</span>
      </div>
      <div class="strategy-metrics">
        <div class="metric-cell">
          <div class="metric-val cost">$${Number(s.weighted_freight_usd_per_bbl).toFixed(2)}</div>
          <div class="metric-label">Est. /bbl</div>
          <div class="metric-conf">${s.confidence}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-val eta">${s.eta_days}d</div>
          <div class="metric-label">ETA</div>
        </div>
        <div class="metric-cell">
          <div class="metric-val ${riskClass}">${(Number(s.weighted_risk) * 100).toFixed(0)}%</div>
          <div class="metric-label">Risk Score</div>
        </div>
      </div>
      ${s.is_hybrid ? renderAllocationBar(s) : ""}
    `;
    board.appendChild(card);
  });

  // Data confidence warning
  const hasLowConf = strategies.some(s => s.confidence === "low" || s.confidence === "estimated");
  if (hasLowConf) {
    document.getElementById("conf-text").textContent =
      `Confidence: estimated — cost and ETA figures are derived from vessel specs and scenario models. Not confirmed quotes or bookings. Solver: ${data.solver || "unknown"}`;
  }

  board.innerHTML += `<div style="font-size:10px;color:var(--cc-muted);padding:8px 4px">Estimated total cost (winner): $${Number(strategies[0]?.estimated_total_cost_usd || 0).toLocaleString()}</div>`;
}

function renderAllocationBar(strategy) {
  const alloc = strategy.allocation || [];
  const total = alloc.reduce((sum, a) => sum + a.allocated_mbbl, 0) || 1;
  const colorMap = { vessel: "alloc-vessel", pipeline: "alloc-pipeline", alternate_route: "alloc-altroute" };

  const segments = alloc.map(a => {
    const pct = a.allocated_mbbl / total * 100;
    const cls = colorMap[a.type] || "alloc-vessel";
    return `<div class="alloc-seg ${cls}" style="width:${pct}%"></div>`;
  }).join("");

  const legend = alloc.map(a => {
    const dotMap = { vessel: "#3b82f6", pipeline: "#f59e0b", alternate_route: "#10b981" };
    const color = dotMap[a.type] || "#3b82f6";
    return `<span class="alloc-leg-item"><span class="alloc-dot" style="background:${color}"></span>${a.allocation_pct}% ${a.name}</span>`;
  }).join("");

  return `<div class="allocation-bar">${segments}</div><div class="alloc-legend">${legend}</div>`;
}

// ─── AI Explanation ────────────────────
function renderAiExplanation(exp) {
  const aiText = document.getElementById("ai-text");
  const aiProviderBadge = document.getElementById("ai-provider-badge");

  if (!exp) {
    aiText.textContent = "AI explanation not available.";
    return;
  }

  if (exp.status === "no_api_key") {
    aiText.textContent = exp.text;
    aiProviderBadge.textContent = "Add GEMINI_API_KEY to enable";
    return;
  }

  if (exp.status === "error") {
    aiText.textContent = `AI Error: ${exp.text}`;
    return;
  }

  aiText.textContent = exp.text;
  aiText.classList.add("loaded");
  aiProviderBadge.textContent = `via ${exp.provider}`;
}

// ─── Report Generation ─────────────────
async function generateReport() {
  const btn = document.getElementById("btn-report");
  const reportText = document.getElementById("report-text");
  
  if (!lastOptResult) {
    reportText.innerHTML = `<span class="report-placeholder">Run analysis first.</span>`;
    return;
  }

  btn.textContent = "Generating...";
  btn.disabled = true;
  reportText.textContent = "Generating executive decision report...";

  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        optimization_result: lastOptResult,
        scenario: lastScenario,
        explanation: lastExplanation
      })
    });
    const data = await res.json();
    const report = data.report;

    if (report?.status === "no_api_key") {
      reportText.textContent = report.text;
    } else if (report?.status === "ok") {
      reportText.textContent = report.text;
      reportText.classList.add("loaded");
    } else if (report?.text) {
      reportText.textContent = report.text;
    } else {
      reportText.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    reportText.textContent = `Report generation failed: ${err.message}`;
  } finally {
    btn.textContent = "Regenerate Report →";
    btn.disabled = false;
  }
}

// ─── Utilities ─────────────────────────
function showErrorToast(msg) {
  const toast = document.createElement("div");
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:#ef4444;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;max-width:360px;box-shadow:0 8px 24px rgba(0,0,0,0.3)`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Make functions available globally (called from HTML onclick)
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updateWeights = updateWeights;
window.updateWhatIfWeights = updateWhatIfWeights;
window.runAnalysis = runAnalysis;
window.runWhatIf = runWhatIf;
window.backToIntake = backToIntake;
window.generateReport = generateReport;

// API Status Checker
async function checkApiStatus() {
  const dot = document.getElementById("cc-status-dot");
  const text = document.getElementById("cc-status-text");
  if (!dot || !text) return;

  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      dot.classList.add("online");
      text.textContent = "API: Online · Decision Engine Ready";
    } else {
      dot.classList.remove("online");
      text.textContent = "API: Standalone Simulated Mode";
    }
  } catch (err) {
    dot.classList.remove("online");
    text.textContent = "API: Standalone Mode (Simulated)";
  }
}

// ═══════════════════════════════════════
// 4. INIT
// ═══════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  if (track) setupSightSlider();
  checkApiStatus();
  if (section) requestTick();
});
