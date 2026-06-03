# LoginApp — React + Node.js + PostgreSQL

Full-stack authentication and employee management project covering Task 1 (base auth), Task 2 (advanced auth features), and Task 3 (employee profile management system).

## Directory Structure

```
LoginApp/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   └── authorize.js             # Role-based access middleware
│   ├── routes/
│   │   ├── auth.js                  # POST /api/auth/signup, /login
│   │   ├── user.js                  # GET /api/user/profile
│   │   ├── departments.js           # GET, POST /api/departments
│   │   ├── skills.js                # GET, POST /api/skills
│   │   └── employees.js             # Full CRUD + image upload + stats
│   ├── uploads/                     # Uploaded employee images stored here
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── ProtectedRoute.jsx   # Redirects to / if no token
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx        # Stats cards + navigation
│       │   ├── EmployeeList.jsx     # Table with edit/delete actions
│       │   ├── CreateEmployee.jsx   # Form with dept, skills, image upload
│       │   ├── EditEmployee.jsx     # Pre-filled update form
│       │   ├── Departments.jsx      # List + add departments
│       │   └── Skills.jsx           # List + add skills
│       ├── routes/
│       │   └── AppRoutes.jsx        # All React Router routes
│       ├── App.jsx
│       ├── index.js
│       └── package.json
│
└── database/
    ├── schema.sql                   # Users, refresh_tokens, password_reset, Departments, employees, images, skills

```

## Setup

### 1. Database
Open PostgreSQL and run schema file:
```sql
\i database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
# Edit .env — set your DB_PASSWORD and JWT_SECRET
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

## Frontend Routes

| URL | Component | Protected |
|-----|-----------|-----------|
| / | Login | No |
| /signup | Signup | No |
| /dashboard | Dashboard | Yes |
| /employees | Employee List | Yes |
| /employees/create | Create Employee | Yes |
| /employees/edit/:id | Edit Employee | Yes |
| /departments | Departments | Yes |
| /skills | Skills | Yes |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login, returns JWT |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get logged-in user profile |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/departments | Get all departments |
| POST | /api/departments | Add a department |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/skills | Get all skills |
| POST | /api/skills | Add a skill |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/employees | Create employee + assign skills |
| GET | /api/employees | List all employees (JOIN with users + departments) |
| GET | /api/employees/:id | Single employee with skills and images |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| POST | /api/employees/upload | Upload up to 5 images |
| GET | /api/employees/stats/count | Dashboard statistics |


## Deployment

| Part | Platform |
|------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Neon](https://neon.tech) |

**Backend on Render:**
- Build command: `npm install`
- Start command: `npm start`
- Add all `.env` values as environment variables

**Frontend on Vercel:**
- Import GitHub repo → select `frontend` folder → deploy
