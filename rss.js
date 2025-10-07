// /api/rss.js — Vercel Serverless Function (Node.js)
// Proxies YouTube channel RSS to avoid CORS and enable caching.

export default async function handler(req, res) {
  try {
    const { channel_id } = req.query || {};
    if (!channel_id) {
      res.status(400).json({ error: "Missing required query param: channel_id" });
      return;
    }

    const upstream = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channel_id)}`;
    const r = await fetch(upstream, {
      headers: { "User-Agent": "AFVIP-RSS-Proxy/1.0" }
    });

    const xml = await r.text();
    // Forward status; set caching for edge/CDN
    res.status(r.status);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400"); // 5m cache at edge, 1d stale
    res.send(xml);
  } catch (e) {
    res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
  }
}
