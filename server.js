
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const BASE = "https://api.edamam.com/api/recipes/v2";

// Serve the static frontend
app.use(express.static("public"));

// (Optional) allow other origins during dev; same-origin is fine too.
app.use(cors({ origin: true }));

// Helpful error if keys are missing
function ensureKeys(req, res) {
  if (!process.env.EDAMAM_APP_ID || !process.env.EDAMAM_APP_KEY) {
    res.status(500).json({
      error:
        "Missing EDAMAM_APP_ID/EDAMAM_APP_KEY on the server. Add them to .env and restart."
    });
    return false;
  }
  return true;
}

// Proxy endpoint: the browser calls /api/recipes?...; the server adds app_id/app_key
app.get("/api/recipes", async (req, res) => {
  if (!ensureKeys(req, res)) return;

  try {
    const url = new URL(BASE);
    url.searchParams.set("type", "public");
    url.searchParams.set("app_id", process.env.EDAMAM_APP_ID);
    url.searchParams.set("app_key", process.env.EDAMAM_APP_KEY);

    // Allowlisted params from the client
    const allowed = ["q", "mealType", "dishType", "diet", "health", "calories"];
    for (const [k, v] of Object.entries(req.query)) {
      if (!allowed.includes(k)) continue;
      if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, val));
      else url.searchParams.set(k, v);
    }

    const r = await fetch(url.toString());
    const body = await r.text();
    res
      .status(r.status)
      .type(r.headers.get("content-type") || "application/json")
      .send(body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Recipe Finder running at http://localhost:${PORT}`);
});
