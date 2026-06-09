import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login          from "../pages/Login";
import Signup         from "../pages/Signup";
import Dashboard      from "../pages/Dashboard";
import EmployeeList   from "../pages/EmployeeList";
import CreateEmployee from "../pages/CreateEmployee";
import EditEmployee   from "../pages/EditEmployee";
import Departments    from "../pages/Departments";
import Skills         from "../pages/Skills";
import ApplyLeave     from "../pages/ApplyLeave";
import MyLeaves       from "../pages/MyLeaves";
import LeaveApprovals from "../pages/LeaveApprovals";

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard"         element={<Protected><Dashboard /></Protected>} />
        <Route path="/employees"         element={<Protected><EmployeeList /></Protected>} />
        <Route path="/employees/create"  element={<Protected><CreateEmployee /></Protected>} />
        <Route path="/employees/edit/:id" element={<Protected><EditEmployee /></Protected>} />
        <Route path="/departments"       element={<Protected><Departments /></Protected>} />
        <Route path="/skills"            element={<Protected><Skills /></Protected>} />
        <Route path="/leave/apply"       element={<Protected><ApplyLeave /></Protected>} />
        <Route path="/leave/my"          element={<Protected><MyLeaves /></Protected>} />
        <Route path="/leave/approvals"   element={<Protected><LeaveApprovals /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
