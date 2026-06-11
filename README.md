# 🚀 Employee & Leave Management System (LoginApp)

A modern, full-stack Employee and Leave Management System built with **React**, **Node.js (Express)**, and **PostgreSQL**. The application features robust role-based access control (RBAC), database relationship mappings (departments, skills, employee images, leave logs), file uploads, enterprise asset management, auditing, and detailed dashboard analytics.

---

## ✨ Features

- **🔒 Advanced Authentication & RBAC**: JWT-based login/signup with custom role assignments (`admin`, `hr`, `manager`, `employee`, `user`).
- **📊 Interactive Dashboard**: Displays real-time counts of total employees, departments, skills, and uploaded images alongside dynamic hiring trends and department employee count charts.
- **📁 Employee Profile Management**:
  - Add, edit, delete, and view comprehensive employee records.
  - Multi-image upload for employee profiles (up to 5 images using Multer).
  - Many-to-many relationship mapping for employee skills.
- **🏢 Department & Skill Management**: Dedicated space to register and manage corporate departments and professional skills.
- **📅 Leave Request & Approval Workflow**:
  - Request leaves specifying custom types (`Casual Leave`, `Sick Leave`, `Earned Leave`, `Maternity Leave`) and automatic duration calculation.
  - Leave balances automatically updated upon approval.
  - Multi-user approval flows with audit remarks logging.
- **💼 Enterprise Asset Management**:
  - Register corporate inventory items (laptops, monitors, keycards).
  - Allocate and return assets to/from employees.
  - Automatic email/notification triggers on assignment.
  - Log audit trails and allocation history per asset.
- **📝 Centralized Audit Trail**: Automatic database-level logs tracking all critical CRUD operations (inserts, updates, deletes) in detailed JSONB formats.
- **🔔 Notification Engine**: Alerts users of critical actions (e.g., assets assigned, leaves approved) visible inside their private notification inbox.
- **🔎 Global Search**: Instantly lookup employees or assets across multiple filter criteria.

---

## 📁 Directory Structure

```
LoginApp/
├── backend/
│   ├── src/                    # Main application source folder
│   │   ├── config/             # Database connection, env loader, initialization
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── initDb.js
│   │   ├── controllers/        # Express controllers (Asset, Leave, Employees, etc.)
│   │   ├── jobs/               # Background task scheduler (cronJobs.js)
│   │   ├── middleware/         # Security, File-upload, and Request-counter middlewares
│   │   │   ├── auth.js
│   │   │   ├── authorize.js
│   │   │   ├── errorHandler.js
│   │   │   ├── requestCounter.js
│   │   │   └── upload.js
│   │   ├── repositories/       # Data Access Object pattern mapping PG tables
│   │   ├── routes/             # API endpoints
│   │   │   └── v2/             # Modernized v2 endpoints (e.g., paginated employees)
│   │   ├── services/           # Business transactional logic layer (e.g., emails)
│   │   ├── utils/              # Helper utilities (winston logger, memory caching)
│   │   └── validators/         # Joi validation payload schemas
│   ├── uploads/                # Local directory for uploaded user photos
│   ├── .env                    # Environment credentials
│   ├── Dockerfile              # Docker image definition for backend Node app
│   ├── server.js               # Main server entrypoint
│   └── package.json            # Backend dependency manifest
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Premium styling layout elements (Sidebar, Table, etc.)
│   │   ├── context/            # React global authentication status (AuthContext)
│   │   ├── pages/              # SPA dashboard and workflow pages
│   │   ├── routes/             # App routing registry (AppRoutes.jsx)
│   │   ├── styles/             # Application global styling variables (global.css)
│   │   ├── App.jsx             # React master component
│   │   └── index.js            # React mounting node
│   ├── Dockerfile              # Nginx server image configuration for hosting React build
│   └── package.json            # Frontend dependency manifest
│   
├── database/
│   ├── schema.sql              # Relational database table schemas
│   ├── migrate_enterprise.sql  # Enterprise features migration (Assets, notifications)
│   └── migrate_enterprise_v2.sql # Performance optimizations (indexes, summary views)
│
└── docker-compose.yml          # Container configuration for local deployment orchestrations
```

---

## 🛠️ Setup & Installation

### 1. Database Setup

1. Open your PostgreSQL server (e.g., via `psql` or pgAdmin).
2. Execute the database files in sequential order: [schema.sql](file:///d:/LoginApp/database/schema.sql), [migrate_enterprise.sql](file:///d:/LoginApp/database/migrate_enterprise.sql), and [migrate_enterprise_v2.sql](file:///d:/LoginApp/database/migrate_enterprise_v2.sql) to initialize tables, seed metrics, create indexes, and build database views.

```bash
# Initialize core schema
psql -U postgres -f database/schema.sql

# Migrate enterprise enhancements (v1)
psql -U postgres -d loginapp -f database/migrate_enterprise.sql

# Optimize database and register custom dashboard views (v2)
psql -U postgres -d loginapp -f database/migrate_enterprise_v2.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` folder:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=loginapp
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key

   # SMTP configuration for actual email dispatch (e.g., Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server runs locally at: `http://localhost:5000`*

### 📬 Email & SMTP Configuration

The system integrates **Nodemailer** to dispatch transactional email alerts:
- **Automatic Triggers**:
  - **Employee Welcome**: Sent to new employees upon registration.
  - **Leave Status Updates**: Sent to employees when their leave request is approved or rejected.
  - **Asset Updates**: Sent when an asset is allocated or returned.
- **Mock Mode**: If `SMTP_HOST` is not defined in `.env`, the system runs a mock JSON transporter which logs mock email details to the console/combined log.
- **Gmail Setup**: To send real emails via Gmail, enable 2-Step Verification on your Google Account, generate a 16-character **App Password**, and use it as `SMTP_PASS`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install client-side dependencies:
   ```bash
   npm install
   ```
3. Run the development build:
   ```bash
   npm start
   ```
   *The client web app starts locally at: `http://localhost:3000`*

### 🐳 Docker Compose Deployment (Local Orchestration)

The project includes Docker configurations for building and running all components (Frontend, Backend, PostgreSQL) as containers.

1. Build and run all services in detached mode:
   ```bash
   docker-compose up --build -d
   ```
2. Verify all containers are running:
   ```bash
   docker-compose ps
   ```
3. To initialize the database tables and prepopulate seed data on the Docker instance:
   ```bash
   docker exec -i peopledesk-postgres psql -U postgres -d loginapp < database/schema.sql
   docker exec -i peopledesk-postgres psql -U postgres -d loginapp < database/migrate_enterprise.sql
   docker exec -i peopledesk-postgres psql -U postgres -d loginapp < database/migrate_enterprise_v2.sql
   ```

---

## 🌐 API Reference

All requests must be made to the backend endpoint `http://localhost:5000`.

### Authentication & Profile
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account with selected roles | No |
| `POST` | `/api/auth/login` | Login and return standard JWT bearer token | No |
| `GET` | `/api/user/profile` | Retrieve profile information for the authenticated user | Yes |

### Employee Profiles (v1)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Retrieve list of all employees (Join query with department) | Yes |
| `POST` | `/api/employees` | Create employee profile and map relationships to skills | Yes |
| `GET` | `/api/employees/:id` | Fetch detail of a single employee with skills & images | Yes |
| `PUT` | `/api/employees/:id` | Update employee information details | Yes |
| `DELETE` | `/api/employees/:id` | Delete employee record & associated profile images | Yes |
| `POST` | `/api/employees/upload` | Multipart upload (Multer) for up to 5 profile images | Yes |
| `GET` | `/api/employees/stats/count` | Retrieve counts for Dashboard stats cards | Yes |

### Employee Profiles (v2)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v2/employees` | Retrieve paginated list of employees with modernized nested schema structure | Yes |

### Departments & Skills
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Get list of all registered departments | No |
| `POST` | `/api/departments` | Add a new department | No |
| `GET` | `/api/skills` | Retrieve all database skill categories | No |
| `POST` | `/api/skills` | Add a new skill category | No |

### Leave Management
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leave/types` | Retrieve list of leave types and standard durations | Yes |
| `POST` | `/api/leave/apply` | Apply for leave (automatically calculates dates difference) | Yes |
| `GET` | `/api/leave/my` | View currently logged-in user's leave application history | Yes |
| `GET` | `/api/leave/pending` | Fetch all pending leave applications | Yes |
| `POST` | `/api/leave/:id/approve` | Approve leave application (deducts leave balance, logs audit) | Yes |
| `POST` | `/api/leave/:id/reject` | Reject leave application and submit auditor notes | Yes |

### Asset Management
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assets` | Get all registered assets | Yes |
| `POST` | `/api/assets` | Register a new corporate asset | Yes |
| `GET` | `/api/assets/:id` | Retrieve single asset information | Yes |
| `PUT` | `/api/assets/:id` | Update asset details | Yes |
| `DELETE` | `/api/assets/:id` | Delete an asset (if not allocated) | Yes |
| `POST` | `/api/assets/:id/allocate` | Allocate an asset to an employee | Yes |
| `POST` | `/api/assets/:id/return` | Register asset return | Yes |
| `GET` | `/api/assets/:id/history` | View history tracking for an asset | Yes |

### Notifications & Auditing
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Retrieve all notifications for the user | Yes |
| `PUT` | `/api/notifications/read` | Mark all notifications as read | Yes |
| `GET` | `/api/audit-logs` | Retrieve database audit logs (Admin only) | Yes |
| `GET` | `/api/search` | Search across employees and assets | Yes |
| `GET` | `/api/dashboard/stats` | Advanced dashboard charts data | Yes |

### Health Checks & Performance Monitoring
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Simple service status check | No |
| `GET` | `/api/health/details` | System-level uptime, memory usage, CPU load, active request counters | No |

---

## 🛣️ Routing Table (React Router)

All frontend routes are declared inside [AppRoutes.jsx](file:///d:/LoginApp/frontend/src/routes/AppRoutes.jsx).

| Route Path | Component View | Authorization |
| :--- | :--- | :--- |
| `/` | `Login` | Open |
| `/signup` | `Signup` | Open |
| `/dashboard` | `Dashboard` | Protected |
| `/search` | `Search` | Protected |
| `/employees` | `EmployeeList` | Protected |
| `/employees/create` | `CreateEmployee` | Protected |
| `/employees/edit/:id` | `EditEmployee` | Protected |
| `/departments` | `Departments` | Protected |
| `/skills` | `Skills` | Protected |
| `/leave/apply` | `ApplyLeave` | Protected |
| `/leave/my` | `MyLeaves` | Protected |
| `/leave/approvals` | `LeaveApprovals` | Protected |
| `/assets` | `Assets` | Protected |
| `/assets/create` | `CreateAsset` | Protected |
| `/assets/:id/allocate` | `AssetAllocation` | Protected |
| `/assets/:id/history` | `AssetHistory` | Protected |
| `/notifications` | `Notifications` | Protected |
| `/audit-logs` | `AuditLogs` | Protected |
| `/reports` | `Reports` | Protected |

---

## 🚀 Deployment

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
