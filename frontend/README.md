# 📱 StockTap Frontend — React Native / Expo App

> **Cross-platform mobile & web client for StockTap Inventory Management System.** Built with **Expo SDK 54**, **Expo Router**, **React Native 0.81**, and **Zustand**.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Start Expo Development Server
yarn start

# 3. Open in Browser (Web)
yarn web

# 4. Run Lint & Type Checks
npm run lint
npx tsc --noEmit
```

---

## 📂 Project Structure

```text
frontend/
├── app/                      # Expo Router File-Based Pages
│   ├── index.tsx             # Auth Splash & Router Gateway
│   ├── setup.tsx             # 4-Digit Owner PIN Initial Setup
│   ├── login.tsx             # Passcode Authentication Screen
│   ├── inventory.tsx         # Main Inventory Dashboard & Tap-to-Count Sheet
│   └── product-form.tsx      # Add/Edit Product Modal & Category Selector
├── src/
│   ├── components/           # Reusable UI (PinKeypad, CountSheet)
│   ├── store/                # Persistent Auth & Inventory Zustand Stores
│   ├── theme/                # Design Tokens (Colors, Typography, Spacing)
│   └── types/                # TypeScript Interfaces (Product, AuditLog)
├── .eas/workflows/           # EAS Workflows CI/CD configuration
├── app.json                  # Expo Application Configuration
├── eas.json                  # EAS Build Profiles Configuration
├── eslint.config.js          # ESLint configuration
└── package.json
```

---

## 🛠️ Verification & Linters

- **ESLint**: `npm run lint` (`expo lint`)
- **TypeScript**: `npx tsc --noEmit`
- **Expo Doctor**: `npx expo-doctor`
