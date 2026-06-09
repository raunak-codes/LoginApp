import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  // ── Core ──
  { label: "Dashboard",    path: "/dashboard",          icon: "📊", roles: ["admin","hr","manager","user","employee"] },
  { label: "Search",       path: "/search",             icon: "🔍", roles: ["admin","hr","manager","user","employee"] },

  // ── Employee Management ──
  { label: "Employees",    path: "/employees",          icon: "👥", roles: ["admin","hr","manager"] },
  { label: "Departments",  path: "/departments",        icon: "🏢", roles: ["admin","hr"] },
  { label: "Skills",       path: "/skills",             icon: "💡", roles: ["admin","hr"] },

  // ── Leave Management ──
  { label: "Apply Leave",  path: "/leave/apply",        icon: "📝", roles: ["user","employee"] },
  { label: "My Leaves",    path: "/leave/my",           icon: "📅", roles: ["user","employee","admin","hr","manager"] },
  { label: "Approvals",    path: "/leave/approvals",    icon: "✅", roles: ["admin","hr","manager"] },

  // ── Asset Management ──
  { label: "Assets",       path: "/assets",             icon: "💻", roles: ["admin","hr","manager","user","employee"] },

  // ── Notifications ──
  { label: "Notifications",path: "/notifications",      icon: "🔔", roles: ["admin","hr","manager","user","employee"] },

  // ── Admin Only ──
  { label: "Audit Logs",   path: "/audit-logs",         icon: "🔍", roles: ["admin"] },
  { label: "Reports",      path: "/reports",            icon: "📈", roles: ["admin","hr","manager"] },
];

const navGroups = [
  { title: "Core",              keys: ["Dashboard", "Search"] },
  { title: "Employees",         keys: ["Employees", "Departments", "Skills"] },
  { title: "Leave",             keys: ["Apply Leave", "My Leaves", "Approvals"] },
  { title: "Assets",            keys: ["Assets"] },
  { title: "Notifications",     keys: ["Notifications"] },
  { title: "Admin",             keys: ["Audit Logs", "Reports"] },
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
        {navGroups.map((group) => {
          const items = filtered.filter((i) => group.keys.includes(i.label));
          if (!items.length) return null;
          return (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-label">{group.title}</div>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
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
