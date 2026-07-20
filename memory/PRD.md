# StockTap — Product Requirements

## Vision
A raw, high-contrast stock-counting tool for a single owner. Offline-first. Every tap moves fast.

## Users
- **The Owner** (single user). Logs in with a 4-digit PIN.

## Core Flows
1. **Onboarding** — First launch prompts owner to create a 4-digit PIN. Confirm re-entry. Stored hashed in SecureStore.
2. **Login** — On subsequent launches or after "LOCK", owner enters PIN.
3. **Inventory Home** — Sticky header (search + horizontal chip row for categories) + list of products. Each row shows SKU, name, category, and a massive mono stock number. Low-stock rows flip the count area to the brand red-orange.
4. **Tap-to-Count** — Tapping a product opens a Gorhom bottom sheet with:
   - Product name / SKU
   - Massive current-count display
   - Manual entry TextInput (numeric)
   - Full-width split `−` / `+` buttons (haptic on every press)
   - RESET button (top-right)
   - Auto-persists to AsyncStorage on every change
5. **Add / Edit / Delete Products** — Form screen with photo (camera / gallery), name, SKU, category, count, low-stock threshold. Delete only in edit mode.
6. **Search & Category Filter** — Live text search across name/SKU/category. Chip row filters by category (single-line horizontal scroller).
7. **Low-stock alert** — Rows with `count <= lowStockThreshold` show a bright brand-color number cell and a "LOW" badge.

## Storage
- **Products**: AsyncStorage (`stocktap.products`), seeded on first launch with 4 sample items.
- **PIN**: Hashed SHA-256 in SecureStore (`stocktap.pin.hash`).
- **Session**: Boolean in AsyncStorage (`stocktap.session.active`), cleared by LOCK button.

## Design
Brutalist Mobile (Personality 5). Radius 0, hard 2pt borders, mono numbers, Space Mono / Space Grotesk feel via system mono + heavy sans, industrial red-orange (#FF3B00) accent, hard color flips for active states. Haptics on every count change.

## Non-Goals (v1)
- Multi-user / roles
- Cloud sync
- Reports / history
- Barcode scanning
