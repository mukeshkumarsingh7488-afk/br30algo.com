export default function handler(req, res) {
  res.setHeader("Content-Type", "application/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://sudha-dairy-frontend.vercel.app/</loc>
    </url>
  </urlset>`);
}
