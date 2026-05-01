import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

app.use(express.static(".")); // serves your HTML file

app.get("/api/sotonmet", async (req, res) => {
  try {
    const date = req.query.date;

    const response = await fetch(
      `https://www.sotonmet.co.uk/search.aspx?searchdate=${date}`
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    const data = [];

    $("#Table1 tr").each((i, row) => {
      if (i === 0) return; // header row

      const cols = $(row).find("td");

      data.push({
        time: cols.eq(0).text().trim(),
        windSpeed: parseFloat(cols.eq(3).text()),
        windDir: parseFloat(cols.eq(4).text())
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}`);
});
