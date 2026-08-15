# Maritime AI Service
# Uses LLM (Gemini / OpenAI) for:
#   - Intake agent: asks clarifying questions, structures constraints
#   - Explanation agent: explains WHY the winning strategy is better
#   - Report agent: generates executive decision report
#
# CRITICAL: The LLM is NOT used for numerical calculations.
# All numbers come from the deterministic optimizer.

import os
import json
import urllib.request

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
OPENAI_BASE = "https://api.openai.com/v1/chat/completions"


def _get_provider():
    if os.environ.get("GEMINI_API_KEY"):
        return "gemini"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    return None


def _call_gemini(prompt: str, system: str = "") -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    model = "gemini-2.5-flash"
    url = f"{GEMINI_BASE}/{model}:generateContent?key={api_key}"
    
    contents = []
    if system:
        contents.append({"role": "user", "parts": [{"text": f"[SYSTEM CONTEXT]\n{system}"}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. I am a maritime supply chain AI assistant. I will only use the data provided — I will not invent numbers, prices, or capacity figures."}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})
    
    payload = json.dumps({
        "contents": contents,
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1500}
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as response:
        data = json.loads(response.read().decode("utf-8"))
    
    return data["candidates"][0]["content"]["parts"][0]["text"]


def _call_openai(prompt: str, system: str = "") -> str:
    api_key = os.environ.get("OPENAI_API_KEY")
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 1500,
        "temperature": 0.3
    }).encode("utf-8")
    
    req = urllib.request.Request(
        OPENAI_BASE, data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        data = json.loads(response.read().decode("utf-8"))
    
    return data["choices"][0]["message"]["content"]


def call_ai(prompt: str, system: str = "") -> dict:
    provider = _get_provider()
    
    if not provider:
        return {
            "status": "no_api_key",
            "text": "AI explanation unavailable — no API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY to .env.",
            "provider": None
        }
    
    try:
        if provider == "gemini":
            text = _call_gemini(prompt, system)
        else:
            text = _call_openai(prompt, system)
        return {"status": "ok", "text": text, "provider": provider}
    except Exception as e:
        return {"status": "error", "text": f"AI call failed: {str(e)}", "provider": provider}


SYSTEM_MARITIME = """You are a maritime supply chain AI assistant for an energy company's decision support platform.

RULES:
- You ONLY interpret and explain results from the deterministic optimization engine. You do NOT invent prices, capacity, routes, or bookings.
- When citing numbers, always reference the data provided to you.
- Always distinguish between confirmed data and estimates.
- Be concise, specific, and use professional maritime/energy industry terminology.
- Do not promise outcomes — use "estimated", "projected", "indicates", "suggests" for unconfirmed data.
- Format your response in clear sections: Summary, Key Trade-offs, Risks & Assumptions, Recommendation."""


def explain_strategy(optimization_result: dict, scenario: dict) -> dict:
    """
    LLM explains WHY the winning strategy is better than alternatives.
    Numbers come from the optimizer — LLM only provides reasoning narrative.
    """
    winner = next((s for s in optimization_result.get("strategies", []) if s.get("is_winner")), None)
    if not winner:
        return call_ai("No winning strategy found.", SYSTEM_MARITIME)
    
    alternatives = [s for s in optimization_result.get("strategies", []) if not s.get("is_winner")]
    
    # Build alternative summary separately to avoid f-string dict-literal issues
    alt_summary = [
        {"name": s["name"], "cost_per_bbl": s["weighted_freight_usd_per_bbl"],
         "eta_days": s["eta_days"], "risk": s["weighted_risk"]}
        for s in alternatives[:3]
    ]
    alt_summary_json = json.dumps(alt_summary, indent=2)

    prompt = f"""
The maritime supply optimization engine has produced the following results. Explain why the winning strategy is the best choice.

SUPPLY SCENARIO:
- Product: {scenario.get('product', 'N/A')}
- Required volume: {scenario.get('volume_mbbl', 'N/A')} thousand barrels
- Destination: {scenario.get('destination_port_id', 'N/A')}
- Deadline: {scenario.get('max_days', 'N/A')} days
- Disruption: {scenario.get('disruption_id', 'None')}

WINNING STRATEGY: {winner['name']}
- Coverage: {winner['coverage_pct']}% of required volume
- Estimated freight cost: ${winner['weighted_freight_usd_per_bbl']}/bbl (estimated)
- Estimated total cost: ${winner['estimated_total_cost_usd']:,.0f} (estimated)
- ETA: {winner['eta_days']} days
- Risk score: {winner['weighted_risk']:.2f} / 1.0
- Is hybrid: {winner['is_hybrid']}
- Data confidence: {winner['confidence']}
- Allocation:
{json.dumps(winner['allocation'], indent=2)}

TOP ALTERNATIVES:
{alt_summary_json}

Optimizer used: {optimization_result.get('solver', 'greedy_heuristic')}
Optimization weights: {json.dumps(optimization_result.get('weights_used', {}))}

Provide your explanation in 3-4 paragraphs covering: why this strategy wins on the configured weights, key trade-offs versus alternatives, data confidence and assumptions, and any risks the operator should be aware of.
"""
    return call_ai(prompt, SYSTEM_MARITIME)


def generate_report(optimization_result: dict, scenario: dict, explanation: dict) -> dict:
    """
    Generates executive decision report.
    """
    winner = next((s for s in optimization_result.get("strategies", []) if s.get("is_winner")), {})
    
    prompt = f"""
Generate a concise executive decision report for the following maritime supply optimization result.

SCENARIO: {json.dumps(scenario, indent=2)}
RECOMMENDED STRATEGY: {json.dumps(winner, indent=2)}
AI ANALYSIS: {explanation.get('text', 'N/A')}
DATA CONFIDENCE: {winner.get('confidence', 'estimated')}

Format the report as:
1. SITUATION SUMMARY (2 sentences)
2. RECOMMENDED ACTION (specific, actionable)  
3. COST BREAKDOWN (tabular: per-barrel, total estimated)
4. EXPECTED TIMELINE
5. KEY RISKS (3 bullet points)
6. ASSUMPTIONS & DATA CONFIDENCE
7. NEXT STEPS

Keep it under 500 words. Use professional energy/maritime language.
Clearly label all estimated figures as estimates.
"""
    return call_ai(prompt, SYSTEM_MARITIME)
