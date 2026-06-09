import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard",    path: "/dashboard",           roles: ["admin","hr","manager","user"] },
  { label: "Employees",    path: "/employees",           roles: ["admin","hr","manager"] },
  { label: "Departments",  path: "/departments",         roles: ["admin","hr"] },
  { label: "Skills",       path: "/skills",              roles: ["admin","hr"] },
  { label: "Apply Leave",  path: "/leave/apply",         roles: ["user","employee"] },
  { label: "My Leaves",    path: "/leave/my",            roles: ["user","employee","admin","hr","manager"] },
  { label: "Approvals",    path: "/leave/approvals",     roles: ["admin","hr","manager"] },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filtered = navItems.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">HR</span>
        <span className="sidebar-name">PeopleDesk</span>
      </div>

      <nav className="sidebar-nav">
        {filtered.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sidebar-username">{user.name}</div>
              <div className="sidebar-role">{user.role}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
