import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ API ROUTE FIRST
app.get("/api/sotonmet", async (req, res) => {
  try {
    const date = req.query.date;

    const response = await fetch(
      `https://www.sotonmet.co.uk/search.aspx?searchdate=${date}`
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    const data = [];

    $("table tr").each((i, row) => {
      const cols = $(row).find("td");
      if (cols.length < 5) return;

      const time = cols.eq(0).text().trim();
      const windSpeed = parseFloat(cols.eq(3).text());
      const windDir = parseFloat(cols.eq(4).text());

      if (!isNaN(windSpeed) && !isNaN(windDir)) {
        data.push({ time, windSpeed, windDir });
      }
    });

    console.log("Rows parsed:", data.length);
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ STATIC FILES AFTER
app.use(express.static("."));

// ✅ ROOT FALLBACK
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/wind-dashboard.html");
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
