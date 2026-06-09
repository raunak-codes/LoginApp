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
│   ├── config/
│   │   └── db.js               # PostgreSQL pool connection configuration
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── authorize.js        # Role-based request authorization
│   ├── routes/                 # Core API endpoints
│   │   ├── auth.js             # User Signup and Login endpoints
│   │   ├── departments.js      # Fetch and add departments
│   │   ├── employees.js        # CRUD, Multi-image upload, and statistics
│   │   ├── leave.js            # Leave application, approvals, and balance management
│   │   ├── skills.js           # Fetch and add skills
│   │   └── user.js             # Get logged-in user profile details
│   ├── src/                    # Enterprise MVC Features
│   │   ├── controllers/        # Business logic controllers (Assets, Search, etc.)
│   │   ├── repositories/       # Data Access Layer querying PostgreSQL
│   │   ├── routes/             # Endpoints for Assets, Audit, Notifications, Search
│   │   ├── services/           # Orchestration layer for transactions/notifications
│   │   ├── utils/              # Utilities (e.g., central logger)
│   │   └── validators/         # Joi schema models validating payloads
│   ├── uploads/                # Directory storing uploaded employee images
│   ├── .env                    # Environment variables (DB credentials, secret keys)
│   ├── server.js               # Express application entrypoint
│   └── package.json            # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable presentation and layout components
│   │   │   ├── Button.jsx & .css
│   │   │   ├── Card.jsx & .css
│   │   │   ├── Layout.jsx & .css
│   │   │   ├── Loader.jsx & .css
│   │   │   ├── Modal.jsx & .css
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx & .css
│   │   │   ├── StatusBadge.jsx & .css
│   │   │   └── Table.jsx & .css
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global JWT authentication state provider
│   │   ├── pages/              # View pages of the client application
│   │   │   ├── ApplyLeave.jsx  # Page to apply for a leave
│   │   │   ├── AssetAllocation.jsx
│   │   │   ├── AssetHistory.jsx & .css
│   │   │   ├── Assets.jsx & .css
│   │   │   ├── AuditLogs.jsx
│   │   │   ├── Auth.css        # Shared styles for login/signup
│   │   │   ├── CreateAsset.jsx
│   │   │   ├── CreateEmployee.jsx
│   │   │   ├── Dashboard.jsx & .css # Admin statistics and charts overview
│   │   │   ├── Departments.jsx # Department list and submission
│   │   │   ├── EditEmployee.jsx
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── LeaveApprovals.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyLeaves.jsx    # Current user's leave applications
│   │   │   ├── Notifications.jsx & .css
│   │   │   ├── Reports.jsx & .css
│   │   │   ├── Search.jsx & .css
│   │   │   ├── Signup.jsx
│   │   │   └── Skills.jsx      # Skill list and submission
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx   # Route registration & protection
│   │   ├── styles/
│   │   │   └── global.css      # Core global application styling definitions
│   │   ├── App.jsx             # Top-level React container
│   │   ├── index.js            # Frontend entrypoint
│   │   └── package.json        # Frontend dependencies & scripts
│   
└── database/
    ├── schema.sql              # Relational schema setup & initial seeds
    └── migrate_enterprise.sql  # Updates for Assets, Auditing, and Notifications
```

---

## 🛠️ Setup & Installation

### 1. Database Setup

1. Open your PostgreSQL server (e.g., via `psql` or pgAdmin).
2. Execute the commands/queries inside [schema.sql](file:///d:/LoginApp/database/schema.sql) and then [migrate_enterprise.sql](file:///d:/LoginApp/database/migrate_enterprise.sql) to initialize the database tables and prepopulate the default departments, skills, leave types, and custom enterprise metrics.

```bash
# Initialize core schema
psql -U postgres -f database/schema.sql

# Migrate enterprise enhancements
psql -U postgres -d loginapp -f database/migrate_enterprise.sql
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
3. Create a `.env` file in the root of the `backend/` folder (configured based on the `.env` template):
   ```env
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=loginapp
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server runs locally at: `http://localhost:5000`*

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

---

## 🌐 API Reference

All requests must be made to the backend endpoint `http://localhost:5000`.

### Authentication & Profile
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account with selected roles | No |
| `POST` | `/api/auth/login` | Login and return standard JWT bearer token | No |
| `GET` | `/api/user/profile` | Retrieve profile information for the authenticated user | Yes |

### Employee Profiles
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Retrieve list of all employees (Join query with department) | Yes |
| `POST` | `/api/employees` | Create employee profile and map relationships to skills | Yes |
| `GET` | `/api/employees/:id` | Fetch detail of a single employee with skills & images | Yes |
| `PUT` | `/api/employees/:id` | Update employee information details | Yes |
| `DELETE` | `/api/employees/:id` | Delete employee record & associated profile images | Yes |
| `POST` | `/api/employees/upload` | Multipart upload (Multer) for up to 5 profile images | Yes |
| `GET` | `/api/employees/stats/count` | Retrieve counts for Dashboard stats cards | Yes |

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
