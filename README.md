# 📦 Product Manager - Full-Stack Authentication & CRUD Application

A modern full-stack web application for inventory and product management, featuring a complete **User Authentication System** (Registration, Login, Password Hashing, JWT Session Management) and a **Protected Dashboard**.

Built with **Node.js**, **Express**, **SQLite** (via native `node:sqlite`), **bcryptjs**, **jsonwebtoken**, and a clean, responsive interface.

---

## ✨ Features

### 🔐 User Authentication & Security
- **User Registration**: Register new accounts with Name, Email, and Password. Includes real-time validation and duplicate email prevention.
- **User Login**: Secure authentication with email and password.
- **Password Hashing (bcrypt)**: Passwords are automatically salted and hashed using `bcryptjs` before storage — plain-text passwords are never stored.
- **JWT Token Authentication**: Issues signed JSON Web Tokens (`jwt`) upon login/signup to persist sessions in `localStorage` and transmit via `Authorization: Bearer <token>` headers.
- **Protected Dashboard**: `index.html` and all `/api/products` endpoints are protected. Unauthenticated requests are rejected (HTTP 401) and redirected to `/login.html`.
- **User-Scoped Data**: Each user's products and inventory analytics are securely isolated and tied to their account `user_id`.
- **Logout**: Dedicated logout button that clears session tokens and returns the user to the login screen.
- **1-Click Demo Account**: Includes pre-seeded demo credentials for instant testing (`demo@example.com` / `Password123!`).

### 📦 Product Management (CRUD)
- ➕ **Add Products**: Product name, price, and stock quantity with validation.
- 📋 **View Products**: Clean tabular display showing IDs, names, prices, formatted stock badges, and total inventory value.
- ✏️ **Edit Products**: Update product details via an interactive modal with instant reflection.
- 🗑️ **Delete Products**: Safe deletion with a confirmation dialog to prevent accidental data loss.
- 📊 **Live Inventory Analytics**: Real-time summary cards displaying Total Products, Total Units, Total Inventory Value, and Low Stock warnings.
- 🔍 **Search & Sort**: Debounced live search and multi-criteria sorting.
- 📥 **Export to CSV**: Download inventory spreadsheets with one click.

---

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Security & Auth**: `bcryptjs` (password hashing) & `jsonwebtoken` (JWT issuance & verification)
- **Database**: [SQLite](https://www.sqlite.org/) via native Node.js core module (`node:sqlite`)
- **Frontend**: Modern Vanilla JavaScript (ES6+), CSS3 (Flexbox/Grid), and Semantic HTML5

---

## 📁 Project Structure

```text
CRUD/
├── data/
│   └── products.db               # SQLite database file with users & products
├── public/                       # Frontend web assets
│   ├── css/
│   │   └── styles.css            # Responsive styles for auth & dashboard
│   ├── js/
│   │   ├── api.js                # Frontend API client with JWT support
│   │   ├── auth.js               # Login and Registration page controller
│   │   ├── ui.js                 # DOM renderers, modals, toast alerts
│   │   └── app.js                # Dashboard controller, user profile & logout
│   ├── index.html                # Protected Product Manager dashboard
│   ├── login.html                # Login page with 1-click demo fill
│   └── register.html             # User registration page
├── server/
│   ├── config/
│   │   ├── db.js                 # Database migrations (users & products tables)
│   │   └── seed.js               # Database seed script
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, and Profile handlers
│   │   └── productController.js  # User-scoped Product CRUD handlers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── errorHandler.js       # Centralized 404 & 500 error handling
│   │   └── validator.js          # Product payload validation
│   ├── models/
│   │   ├── userModel.js          # User queries & password comparisons
│   │   └── productModel.js       # SQL queries scoped to user_id
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── productRoutes.js      # /api/products routes (protected)
│   └── app.js                    # Express application setup
├── test/
│   └── integration.test.js       # End-to-end auth & CRUD test suite
├── .env                          # Local environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies and scripts
├── server.js                     # Server entry point
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### 1. Installation

Install all required dependencies:
```bash
npm install
```

### 2. Environment Configuration

The application includes a pre-configured `.env` file:
```env
PORT=5000
NODE_ENV=development
DB_PATH=./data/products.db
JWT_SECRET=supersecret_jwt_key_product_manager_987654321_secure
JWT_EXPIRES_IN=7d
```

### 3. Running the Server

#### Start Production Server:
```bash
npm start
```

#### Start Development Server (Auto-reload with Nodemon):
```bash
npm run dev
```

Navigate to:
👉 **[http://localhost:5000](http://localhost:5000)** (redirects to `/login.html` if unauthenticated).

---

## 🔑 Demo Account Credentials

You can click the **"Use Demo"** button on the login screen or manually enter:
- **Email:** `demo@example.com`
- **Password:** `Password123!`

Or click **"Create an account"** to register a new user!

---

## 📡 REST API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Login user and receive JWT token (`email`, `password`) | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (Bearer token)** |

### Product Endpoints (All Protected)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve user's products (`?search=`, `?sortBy=`, `?sortOrder=`) | **Yes (Bearer token)** |
| `GET` | `/api/products/:id` | Retrieve single product details | **Yes (Bearer token)** |
| `GET` | `/api/products/stats` | Retrieve user's inventory statistics | **Yes (Bearer token)** |
| `POST` | `/api/products` | Create a new product | **Yes (Bearer token)** |
| `PUT` | `/api/products/:id` | Update an existing product | **Yes (Bearer token)** |
| `DELETE` | `/api/products/:id` | Delete a product | **Yes (Bearer token)** |
| `GET` | `/api/health` | Public server health check | No |

---

## 🧪 Running Tests

To run the complete integration test suite:
```bash
npm test
```
