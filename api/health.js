// Maritime Decision Network — /api/health
// Returns status of all integrated services

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  const providers = {
    ai: process.env.GEMINI_API_KEY ? "gemini" : (process.env.OPENAI_API_KEY ? "openai" : "none"),
    ais: process.env.AISSTREAM_API_KEY ? "aisstream.io" : "dev_fallback",
    weather: "open-meteo (free, no key)",
    map: process.env.MAPBOX_TOKEN ? "mapbox" : "leaflet (open-source)"
  };

  res.status(200).json({
    status: "ok",
    service: "Maritime Decision Network API",
    providers,
    note: providers.ai === "none"
      ? "No AI API key configured. Add GEMINI_API_KEY to .env for AI explanations."
      : null,
    timestamp: new Date().toISOString()
  });
}
