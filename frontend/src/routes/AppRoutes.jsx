import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Auth ──────────────────────────────────────────────────────
import Login          from "../pages/Login";
import Signup         from "../pages/Signup";

// ── Core ──────────────────────────────────────────────────────
import Dashboard      from "../pages/Dashboard";
import Search         from "../pages/Search";

// ── Employee Management ───────────────────────────────────────
import EmployeeList   from "../pages/EmployeeList";
import CreateEmployee from "../pages/CreateEmployee";
import EditEmployee   from "../pages/EditEmployee";
import Departments    from "../pages/Departments";
import Skills         from "../pages/Skills";

// ── Leave Management ──────────────────────────────────────────
import ApplyLeave     from "../pages/ApplyLeave";
import MyLeaves       from "../pages/MyLeaves";
import LeaveApprovals from "../pages/LeaveApprovals";

// ── Asset Management ──────────────────────────────────────────
import Assets         from "../pages/Assets";
import CreateAsset    from "../pages/CreateAsset";
import AssetAllocation from "../pages/AssetAllocation";
import AssetHistory   from "../pages/AssetHistory";

// ── Notifications + Audit + Reports ──────────────────────────
import Notifications  from "../pages/Notifications";
import AuditLogs      from "../pages/AuditLogs";
import Reports        from "../pages/Reports";

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Core */}
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/search"    element={<Protected><Search /></Protected>} />

        {/* Employees */}
        <Route path="/employees"          element={<Protected><EmployeeList /></Protected>} />
        <Route path="/employees/create"   element={<Protected><CreateEmployee /></Protected>} />
        <Route path="/employees/edit/:id" element={<Protected><EditEmployee /></Protected>} />
        <Route path="/departments"        element={<Protected><Departments /></Protected>} />
        <Route path="/skills"             element={<Protected><Skills /></Protected>} />

        {/* Leave */}
        <Route path="/leave/apply"     element={<Protected><ApplyLeave /></Protected>} />
        <Route path="/leave/my"        element={<Protected><MyLeaves /></Protected>} />
        <Route path="/leave/approvals" element={<Protected><LeaveApprovals /></Protected>} />

        {/* Assets */}
        <Route path="/assets"                  element={<Protected><Assets /></Protected>} />
        <Route path="/assets/create"           element={<Protected><CreateAsset /></Protected>} />
        <Route path="/assets/:id/allocate"     element={<Protected><AssetAllocation /></Protected>} />
        <Route path="/assets/:id/history"      element={<Protected><AssetHistory /></Protected>} />

        {/* Notifications, Audit, Reports */}
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/audit-logs"    element={<Protected><AuditLogs /></Protected>} />
        <Route path="/reports"       element={<Protected><Reports /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
