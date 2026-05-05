import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * API: Fetch SotonMet CSV and return JSON
 */
app.get("/api/sotonmet", async (req, res) => {
  try {
    const dateStr = req.query.date; // YYYY-MM-DD
    if (!dateStr) {
      return res.status(400).json({ error: "Missing date parameter" });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const year = date.getUTCFullYear();
    const day = String(date.getUTCDate()).padStart(2, "0");

    const monthName = date.toLocaleString("en-GB", {
      month: "long",
      timeZone: "UTC"
    });

    const shortMonth = monthName.substring(0, 3);

    const csvUrl =
      `https://www.sotonmet.co.uk/archive/${year}/${monthName}/CSV/` +
      `Sot${day}${shortMonth}${year}.csv`;

    console.log("Fetching CSV:", csvUrl);

    const response = await fetch(csvUrl);
    if (!response.ok) {
      return res.status(404).json({ error: "CSV not found for this date" });
    }

    const csvText = await response.text();
    const lines = csvText.trim().split("\n");

    const data = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");

      // Defensive check
      if (cols.length < 6) continue;

      const time = cols[0].trim();
      const windDir = parseFloat(cols[3]);
      const windSpeed = parseFloat(cols[4]);

      if (!isNaN(windSpeed) && !isNaN(windDir)) {
        data.push({ time, windSpeed, windDir });
      }
    }

    console.log("Rows parsed:", data.length);
    res.json(data);

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to process CSV" });
  }
});

/**
 * Serve static frontend files (HTML, JS, CSS)
 */
app.use(express.static("."));

/**
 * Default route: load dashboard
 */
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/wind-dashboard.html");
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

