<div align="center">

# 🏟️ StadiumSync

### Real-Time Crowd Intelligence & Venue Navigation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

> **Navigate Your Venue Experience** — StadiumSync delivers real-time crowd density overlays, live wait times, smart alerts, and step-by-step seat navigation for large-scale sporting events and concerts.

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Routes](#-api-routes)
- [Data Import](#-data-import)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

StadiumSync is a full-stack web application designed to transform the in-stadium experience. Using a real-time dataset of **10,000+ sensor readings**, the platform provides attendees and staff with live crowd intelligence, dramatically reducing congestion and improving safety at large events.

Built as a hackathon submission for a national competition, StadiumSync demonstrates how data-driven decisions can modernize venue management for millions of fans.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Venue Map** | Real-time crowd density overlays across all stadium zones |
| ⏱️ **Live Wait Times** | Up-to-the-minute wait times for concessions, restrooms & gates |
| 📅 **Event Schedule** | Live scores, key moments, and event timeline |
| 🔔 **Smart Alerts** | Gate changes, emergencies, and special announcements pushed instantly |
| 💺 **Seat Finder** | Step-by-step navigation from entrance to your exact seat |
| 🤖 **AI Chat Assistant** | On-demand help powered by AI for venue queries |
| 🛡️ **Admin Dashboard** | Staff management panel for real-time venue operations |
| 📊 **Data Import Tool** | Bulk CSV import for historical and real-time sensor data |
| 👤 **Role-Based Access** | Separate views for attendees, staff, and administrators |
| 🌙 **Theme Support** | Light and dark mode for all-condition readability |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Wouter** — lightweight client-side routing
- **tRPC** — end-to-end type-safe API calls
- **Tailwind CSS** — utility-first styling
- **Shadcn/UI** — accessible, composable component library
- **Lucide React** — icon library

### Backend
- **Node.js** with **Express**
- **tRPC** — type-safe RPC layer
- **Drizzle ORM** — type-safe SQL query builder

### Database
- **MySQL 8.0** — relational data store for venues, users, zones, alerts, and wait times

### Data & Scripts
- **10,000-row real-time dataset** (`smart_stadium_realtime_dataset_10000.csv`)
- Custom **Node.js import script** for bulk data loading

---

## 📁 Project Structure

```
stadiumsync/
├── client/                         # React frontend (TypeScript)
│   ├── index.html
│   └── src/
│       ├── _core/hooks/            # Auth hooks
│       ├── components/             # Reusable UI components
│       │   ├── ui/                 # Shadcn/UI base components
│       │   ├── AIChatBox.tsx       # AI assistant widget
│       │   ├── Map.tsx             # Venue map with overlays
│       │   ├── ZoneCard.tsx        # Crowd zone status card
│       │   └── WaitTimeIndicator.tsx
│       ├── contexts/               # React context providers
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # tRPC client, utilities
│       ├── pages/                  # Route-level page components
│       │   ├── Home.tsx            # Landing / dashboard
│       │   ├── MapPage.tsx         # Interactive venue map
│       │   ├── WaitTimesPage.tsx   # Live wait times
│       │   ├── SchedulePage.tsx    # Event schedule
│       │   ├── AlertsPage.tsx      # Smart alerts
│       │   ├── MySeatPage.tsx      # Seat finder
│       │   ├── AdminPanel.tsx      # Admin dashboard
│       │   └── DataImportPage.tsx  # CSV data import UI
│       ├── App.tsx                 # Root router + layout
│       └── main.tsx                # Entry point
│
├── server/                         # Node.js / Express backend
│   └── _core/types/                # Shared server types
│
├── drizzle/                        # Database schema & migrations
│   ├── schema.ts                   # Table definitions (Drizzle ORM)
│   ├── relations.ts                # Table relationships
│   ├── 0000_thin_jubilee.sql       # Initial migration
│   └── 0001_worthless_the_stranger.sql
│
├── data/
│   └── smart_stadium_realtime_dataset_10000.csv  # Real-time sensor dataset
│
├── scripts/
│   └── import-venue-data.mjs       # Bulk CSV data import script
│
├── patches/                        # Package patches (wouter)
├── .env.example                    # Environment variable template
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) v20 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [MySQL](https://www.mysql.com/) 8.0

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/stadiumsync.git
cd stadiumsync
```

### 2. Install Dependencies

```bash
# Install root / server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual database credentials and secrets
```

### 4. Set Up the Database

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE stadiumsync;"

# Run migrations
npm run db:migrate
```

### 5. Import Sample Data

```bash
node scripts/import-venue-data.mjs
```

### 6. Start the Application

```bash
# Start backend server
npm run dev:server

# In a new terminal, start frontend
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup

StadiumSync uses **Drizzle ORM** with MySQL. The schema includes the following tables:

| Table | Description |
|---|---|
| `users` | Attendees, staff, and admins with role-based access |
| `venues` | Stadium/arena records |
| `zones` | Sections within a venue (seating, concourse, entrance, exit) |
| `facilities` | Concessions, restrooms, first aid, parking, etc. |
| `waitTimes` | Real-time wait time records per facility |
| `crowdDensity` | Time-series crowd density readings per zone |
| `events` | Sports, concerts, and conference events |
| `eventMoments` | Key live moments (goals, timeouts, announcements) |
| `alerts` | Venue-wide or zone-targeted alerts |
| `userPreferences` | Saved seat, notification, and display preferences |
| `seats` | Individual seat records with map coordinates |

---

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for all required variables. Key ones:

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (default: `stadiumsync`) |
| `PORT` | Backend server port (default: `3000`) |
| `SESSION_SECRET` | Random string for session signing |
| `AUTH_CLIENT_ID` | OAuth client ID |

---

## 📜 Available Scripts

```bash
npm run dev:server      # Start backend in development mode
npm run dev:client      # Start Vite dev server for frontend
npm run build           # Build both frontend and backend
npm run db:migrate      # Run Drizzle database migrations
npm run db:push         # Push schema changes to database
npm run import-data     # Import CSV venue data
```

---

## 🔌 API Routes

All API routes are served via **tRPC** with full type safety end-to-end. Key routers include:

| Router | Description |
|---|---|
| `auth` | Login, logout, session management |
| `venues` | Venue CRUD operations |
| `zones` | Zone crowd density queries and updates |
| `facilities` | Facility listings and filtering |
| `waitTimes` | Real-time wait time reads and staff updates |
| `alerts` | Create, fetch, and expire venue alerts |
| `events` | Event schedule and live moment tracking |
| `seats` | Seat lookup and navigation directions |

---

## 📦 Data Import

StadiumSync ships with a **10,000-row real-time sensor dataset** capturing:

- Crowd density per zone (every 30 seconds)
- Average wait times per facility
- Entry/exit flow rates
- Incident flags
- Staff allocation recommendations
- Temperature readings

To import the full dataset:

```bash
node scripts/import-venue-data.mjs ./data/smart_stadium_realtime_dataset_10000.csv
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ for the National Hackathon Competition

**StadiumSync** — Smarter Venues. Better Experiences.

</div>
