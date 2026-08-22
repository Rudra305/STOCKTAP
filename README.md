# 📦 StockTap — Tap-to-Count Inventory Management System

> **A fast, touch-optimized inventory management and audit application** built with **React Native / Expo (Web & Mobile)**, **Node.js Express REST API**, and **MongoDB Atlas**. Features tactile tap-to-count inventory sheet controls, secure 4-digit Owner Passcode locking, low-stock alerts, and activity audit logging.

[![Live Web App](https://img.shields.io/badge/Live_Web_App-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://stocktapmerlin.vercel.app)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-blue?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

🔗 **Live Production Web App**: [https://stocktapmerlin.vercel.app](https://stocktapmerlin.vercel.app)

---

## 📖 About StockTap

**StockTap** eliminates the hassle of tracking inventory with manual pen-and-paper or clunky spreadsheets. Designed with a mobile-first, tap-to-count philosophy, StockTap empowers store owners and inventory managers to rapidly adjust stock levels on the fly, lock sensitive store settings behind an Owner Passcode, and maintain full transparency with automated audit logging.

### 🌟 Key Features

- 🔢 **Tactile Tap-to-Count Sheet**: Quick-count bottom sheet with big touch targets (`+1`, `-1`, manual override) and haptic feedback.
- 🔐 **Owner Passcode Lock**: 4-digit PIN security (`setup` and `login` screens) protecting owner-only actions and inventory modifications.
- ⚠️ **Low-Stock Detection**: Automatic visual warnings and badge alerts when items fall below custom minimum thresholds.
- 🔍 **Real-Time Search & Category Filtering**: Instant product lookup with interactive category chips.
- 📋 **Product Management**: Complete CRUD operations (create, update, delete, SKU, category, stock threshold, photo URL).
- 📜 **Audit Trail & Activity Logs**: Track every stock increment, decrement, and item edit in MongoDB.
- 🌐 **Cross-Platform**: Runs seamlessly on Expo Web, iOS, and Android.

---

## 🛠️ Architecture & Tech Stack

```text
STOCKTAP/
├── backend/                  # Node.js & Express REST API
│   ├── models/               # Mongoose schemas (Product, AuditLog)
│   ├── routes/               # Express API routes (/api/products, /api/logs)
│   ├── server.js             # API server entrypoint & MongoDB connection
│   └── package.json
├── frontend/                 # Expo (SDK 54) + React Native Web frontend
│   ├── app/                  # Expo Router pages (index, setup, login, inventory, product-form)
│   ├── src/                  # Components (PinKeypad, CountSheet), Store (auth, inventory), Theme
│   ├── .eas/workflows/       # EAS Workflows auto-deployment configuration
│   ├── eas.json              # EAS build profile setup
│   ├── eslint.config.js      # ESLint configuration
│   └── package.json
├── vercel.json               # Vercel serverless deployment routing configuration
└── README.md
```

### Stack Components
* **Frontend**: Expo SDK 54, Expo Router v4, React Native 0.81, Zustand state management, Expo Haptics, Feather Vector Icons.
* **Backend**: Node.js, Express.js, Mongoose ODM, Cors, Dotenv.
* **Database**: MongoDB Atlas cloud cluster (`stocktap_db`).
* **CI/CD & Deployment**: EAS Workflows for Mobile builds; Vercel for Web deployment.

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **Yarn** or **npm**

---

### 1. Root Convenience Scripts

You can run both frontend and backend directly from the workspace root:

```bash
# Start backend server
yarn start:backend

# Start frontend Expo dev server
yarn start:frontend

# Export frontend production build
yarn build:frontend
```

---

### 2. Manual Backend Setup

```bash
cd backend
npm install

# Create environment configuration
cp .env.example .env

# Start Node.js Express Server (Port 8000)
npm start
```

---

### 3. Manual Frontend Setup

```bash
cd frontend
yarn install

# Start Expo Development Server
yarn start
```

---

## 🧪 Quality Assurance & Linters

StockTap maintains strict code quality and type safety:

| Command | Description |
| :--- | :--- |
| `npm run lint` | Runs ESLint (`expo lint`) to inspect code quality |
| `npx tsc --noEmit` | Validates TypeScript type safety without compiling |
| `npx expo-doctor` | Verifies Expo SDK dependency compatibility (18/18 checks) |

---

## ☁️ CI/CD & Deployment Setup

### 📱 EAS Auto-Deployment (Expo Cloud)
EAS Workflows are configured under [`frontend/.eas/workflows/create-production-builds.yml`](file:///c:/Ashutosh/Projects/Git/STOCKTAP/frontend/.eas/workflows/create-production-builds.yml).
* **Triggers**: Pushes to `main` branch automatically build Android Preview APKs on Expo Cloud.

### 🌐 Vercel Web Deployment
1. Root [`vercel.json`](file:///c:/Ashutosh/Projects/Git/STOCKTAP/vercel.json) routes API requests to `/backend/server.js` and serves Expo Web assets.
2. **Environment Variables**:
   - `MONGO_URI`: MongoDB Atlas connection string.
   - `EXPO_PUBLIC_API_URL`: `/api`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
