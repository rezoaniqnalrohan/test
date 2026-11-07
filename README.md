# ✨ Nexus Inventory — Animated Frontend Product Manager

A modern, animated frontend web application for managing product catalogs and portfolio analytics. Built with pure **HTML5**, **CSS3** (Glassmorphism, Ambient Floating Orbs, Keyframe Animations, Dark/Light Themes), and **Vanilla JavaScript (ES6+)** with persistent `localStorage` state.

---

## 🌟 Highlights & Features

- **Fluid Visuals & Animations**:
  - Floating ambient gradient orbs and subtle grid mesh overlay.
  - Staggered row and card entrance animations (`60fps`).
  - Smooth Dark / Light mode switcher with CSS custom properties.
- **Complete Interactive CRUD**:
  - **Create**: Add new products with SKU, Category, Unit Price, and Stock Quantity.
  - **Read**: Switch seamlessly between **Table View** and **Bento Card Grid View**.
  - **Update**: Edit any item with instant portfolio recalculation.
  - **Delete**: Confirmation modal with toast notification feedback.
- **Live Portfolio Analytics**:
  - Real-time KPI cards (*Total Products*, *Inventory Units*, *Portfolio Value*, *Stock Alerts*).
  - Dynamic multi-color **Category Distribution Bar** and interactive legend.
- **Search, Filter & Export**:
  - Instant search across product names, categories, and SKUs.
  - Category filter pills (*Peripherals*, *Displays*, *Audio*, *Accessories*, *Workspace*).
  - One-click **CSV Export** and **Reset Demo Data**.
- **Interactive Profile & Auth Modal**:
  - Sign in, create an account, or use the one-click **Auto-Fill Demo** profile.

---

## 📁 Project Structure

```text
├── index.html       # Main application entry point (Hero, Workspace, Modals)
├── css/
│   └── styles.css   # Complete animated stylesheet, glassmorphism & themes
├── js/
│   └── app.js       # Client-side state engine, CRUD, analytics & persistence
└── README.md        # Project documentation
```

---

## 🚀 Running Locally

No build tools or backend servers are required!
1. Open [`index.html`](./index.html) directly in any modern web browser, **or**
2. Serve the folder with any static file server (e.g., VS Code Live Server or `npx serve .`).
