module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: "online",
    service: "Polyinnovae Hackathon API",
    timestamp: new Date().toISOString(),
    environment: "vercel-production"
  });
};
