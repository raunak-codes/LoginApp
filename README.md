# LoginApp — React + Node.js + PostgreSQL

Full-stack authentication project covering Task 1 (base app) and Task 2 (advanced features).

## Directory Structure

```
LoginApp/
│
├── backend/
│   ├── config/
│   │   └── db.js               # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── authorize.js        # Role-based access middleware
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/signup, /login
│   │   └── user.js             # GET /api/user/profile
│   ├── .env                    # Environment variables
│   ├── server.js               # Express app entry point
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── ProtectedRoute.jsx   # Redirects to / if no token
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   └── Dashboard.jsx        # Protected; fetches user profile
│       ├── routes/
│       │   └── AppRoutes.jsx        # React Router setup
│       ├── App.jsx
│       ├── index.js
│       └── package.json
│
└── database/
    └── schema.sql              # All CREATE TABLE statements
```

## Setup

### 1. Database
Open PostgreSQL and run `database/schema.sql`.

### 2. Backend
```bash
cd backend
npm install
# Edit .env — set your DB_PASSWORD
npm run dev
```
Runs at: http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
Runs at: http://localhost:3000

## Routes

| URL | Component | Protected |
|-----|-----------|-----------|
| / | Login | No |
| /signup | Signup | No |
| /dashboard | Dashboard | Yes |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/user/profile | Get logged-in user (requires token) |
