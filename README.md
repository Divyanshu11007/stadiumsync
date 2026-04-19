# 🏟️ StadiumSync

Real-time crowd intelligence, wait times, and seamless navigation for large-scale sporting events.

## Features

- 📊 Real-time crowd density monitoring
- ⏱️ Live wait times for concessions, restrooms & gates
- 🗺️ Interactive venue map
- 📅 Event schedule & live scores
- 🔔 Alerts & announcements
- 📁 **Large Dataset Import** — upload 100K–500K rows with location support

## 🚀 Deploy on Railway (Free)

### Step 1 — Set up Database
1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project** → **Provision MySQL**
3. Click the MySQL service → **Variables** tab → copy `DATABASE_URL`

### Step 2 — Deploy the App
1. In the same Railway project, click **+ New** → **GitHub Repo**
2. Connect your GitHub and select `stadiumsync`
3. Railway auto-detects the config and starts building

### Step 3 — Set Environment Variables
In Railway → your app service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | (paste from MySQL service) |
| `JWT_SECRET` | any random 32+ char string |
| `VITE_APP_ID` | `stadiumsync` |
| `NODE_ENV` | `production` |

### Step 4 — Generate a Domain
Railway → your app → **Settings** → **Networking** → **Generate Domain**

Your app is live! 🎉

---

## 💻 Run Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Push database schema
pnpm db:push

# 4. Start dev server
pnpm dev
```

Open http://localhost:3000

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express, tRPC
- **Database**: MySQL + Drizzle ORM
- **Build**: Vite + esbuild
