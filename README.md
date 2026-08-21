# 📦 StockTap — Tap-to-Count Inventory Management System

Full-stack inventory management web application built with **React Native / Expo Web**, **Node.js Express API**, and **MongoDB Atlas**.

---

## 🛠️ Architecture & Setup

* **Frontend**: Expo Web (`expo export --platform web`) with Zustand, Lucide icons, & responsive UI.
* **Backend**: Express API running on Node.js with Mongoose models (`Product`, `AuditLog`).
* **Database**: MongoDB Atlas (`stocktap_db` database).
* **Deployment**: Production ready for **Vercel** serverless web hosting.

---

## ⚡ Quick Start

### 1. Backend Development Server
```bash
cd backend
npm install
npm start
# Server runs at http://localhost:8000
```

### 2. Frontend Development Server
```bash
cd frontend
yarn install
yarn start
# Starts Expo dev server
```

---

## ☁️ Vercel & Production Build Setup

1. **Root Vercel Configuration**: [`vercel.json`](file:///c:/Ashutosh/Projects/Git/STOCKTAP/vercel.json) configured for single-command Vercel deployment.
2. **Environment Variables on Vercel**:
   * `MONGO_URI`: `mongodb+srv://ashutoshbalsaraf_db_user:<password>@cluster0.ede0mx8.mongodb.net/stocktap_db?retryWrites=true&w=majority&appName=Cluster0`
   * `EXPO_PUBLIC_API_URL`: `/api`
3. **Production Export**:
   ```bash
   cd frontend
   npx expo export --platform web
   ```
