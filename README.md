Recipe Finder (Vue + Node/Express + Edamam)
A single-page, mobile-friendly recipe search site. It lets you filter by meal (Breakfast, Lunch, Dinner, Snacks, Appetisers), diet type, health labels (e.g., Vegan, Gluten-Free), and max calories. Results come from the Edamam Recipe Search API v2.

Images scale to 100% width on phones, and the API keys stay server-side (never exposed to the browser).

✨ What users can do
🔎 Search recipes by keyword (e.g., “chicken”, “pasta”, “curry”)

🍽️ Filter by meal category: Breakfast · Lunch · Dinner · Snacks · Appetisers
(“Appetisers” maps to Edamam’s dishType=Starter.)

🥗 Filter by diet (Balanced, High-Protein, Low-Fat, Low-Carb)

✅ Filter by health labels (Vegan, Vegetarian, Gluten-Free, etc.)

🔥 Set a max calories cap (per recipe)

📄 Open the original recipe

➕ Click Load more to paginate

🧠 How it works (architecture)
pgsql
Copy code
Browser (Vue 3 SPA)
        │  calls
        ▼
Node/Express proxy  →  Edamam Recipe Search API v2
(injects APP_ID + APP_KEY        (type=public, q, mealType, dishType,
from environment variables)       diet, health, calories …)
The frontend (Vue 3) lives under /public and renders the UI.

The backend is a tiny Express server (server.js) that serves the frontend and proxies /api/recipes to Edamam.

The proxy appends your APP_ID and APP_KEY from environment variables, keeping them off the client.

Pagination uses Edamam’s _links.next.href.

🗂 Folder structure
pgsql
Copy code
recipe-finder/
├─ public/
│  ├─ index.html       # Vue 3 SPA (ES modules)
│  └─ styles.css       # external, mobile-first CSS
├─ server.js           # Express static server + /api/recipes proxy
├─ package.json
├─ .env                # EDAMAM_APP_ID, EDAMAM_APP_KEY, PORT  (not committed)
├─ .gitignore          # ignores node_modules and .env
└─ (optional) docs/    # copy of public/ for GitHub Pages hosting
⚙️ Prerequisites
Node.js 18+

An Edamam account with an app for Recipe Search API v2 (not Meal Planner, not Food DB).

You’ll get an Application ID and Application Key for Recipe Search v2.

🧪 Run locally
Clone & install

bash
Copy code
npm install
Create .env (next to server.js) with your Recipe Search v2 keys:

ini
Copy code
EDAMAM_APP_ID=your_recipe_search_app_id
EDAMAM_APP_KEY=your_recipe_search_app_key
PORT=3000
Start

bash
Copy code
npm start
# ➜ Recipe Finder running at http://localhost:3000
Test the proxy

Open: http://localhost:3000/api/recipes?q=chicken
You should see JSON with hits.

Use the app

Open: http://localhost:3000

Note: If your Node version is < 18 and you see “fetch is not defined,” either upgrade Node or install node-fetch and import it in server.js.

🌐 Host it online
Option A — All-in-one on Render (recommended)
This serves the frontend and proxy from one URL. Auto-deploys on every push.

Push this repo to GitHub.

On render.com → New → Web Service → connect your repo.

Build Command: npm install

Start Command: node server.js (or npm start if your package.json has it)

Environment Variables:

EDAMAM_APP_ID = your Recipe Search v2 App ID

EDAMAM_APP_KEY = your Recipe Search v2 App Key

(optional) NODE_VERSION = 18

Deploy. Your site will be at https://<your-app>.onrender.com.

Option B — Frontend on GitHub Pages + Backend on Render
Deploy the backend on Render (as above). Copy the URL, e.g.
https://recipe-finder-abc123.onrender.com

In public/index.html (and docs/index.html if you use Pages), set:

js
Copy code
const BASE = "https://recipe-finder-abc123.onrender.com/api/recipes";
Create a docs/ folder and copy public/index.html and public/styles.css into it.

Push to GitHub → Repo Settings → Pages → Source: Deploy from a branch → Branch main, Folder /docs.

Visit https://<your-username>.github.io/<repo>/.

(Optional) Lock CORS on the server to your Pages origin:

js
Copy code
// server.js
import cors from "cors";
app.use(cors({
  origin: [
    "https://<your-username>.github.io",
    "https://<your-username>.github.io/<your-repo>"
  ]
}));
🔧 Scripts
json
Copy code
{
  "scripts": {
    "start": "node server.js"
  }
}
🔐 Security notes
Never commit .env. Your .gitignore already excludes it.

Keys are injected by the Express proxy and never sent to the browser.

If a key is ever exposed, rotate it in the Edamam dashboard and update your hosting env vars.

🧩 API details (used by the app)
Endpoint: GET https://api.edamam.com/api/recipes/v2

Required: type=public, app_id, app_key

Filters used by the app:

q (query string)

mealType (Breakfast, Lunch, Dinner, Snack)

dishType (Starter for “Appetisers”)

diet (e.g., low-carb, balanced, etc. → lower-case, hyphenated)

health (e.g., gluten-free, vegan → lower-case, hyphenated)

calories (e.g., 0-700)

Pagination: follow _links.next.href

🧯 Troubleshooting
401 Unauthorized

Using Meal Planner keys instead of Recipe Search v2.

Env vars not set on the server/Render.

Restart the server after changing .env.

CORS error (only when Pages + Render split)

Ensure BASE uses https with your Render URL.

Allow your Pages origin in cors() on the server, redeploy.

“fetch is not defined” (server logs)

Use Node 18+ (NODE_VERSION=18 on Render), or install node-fetch.

Cold start delay (Render Free plan)

First request after inactivity can take a few seconds. Subsequent calls are fast.
