import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Search,
  Users,
  Building2,
  Lightbulb,
  FileText,
  Calendar,
  CheckSquare,
  Laptop,
  Bell,
  History,
  FileSpreadsheet,
  LogOut,
  Clock,
  CreditCard,
  Receipt,
  Briefcase,
  Shield
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  // ── Core ──
  { label: "Dashboard",    path: "/dashboard",          icon: LayoutDashboard, roles: ["admin","hr","manager"] },
  { label: "Search",       path: "/search",             icon: Search,          roles: ["admin","hr","manager","user","employee"] },

  // ── Employee Management ──
  { label: "Employees",    path: "/employees",          icon: Users,           roles: ["admin","hr","manager"] },
  { label: "Departments",  path: "/departments",        icon: Building2,       roles: ["admin","hr"] },
  { label: "Skills",       path: "/skills",             icon: Lightbulb,       roles: ["admin","hr"] },

  // ── Leave & Time ──
  { label: "Apply Leave",  path: "/leave/apply",        icon: FileText,        roles: ["user","employee"] },
  { label: "My Leaves",    path: "/leave/my",           icon: Calendar,        roles: ["user","employee","admin","hr","manager"] },
  { label: "Approvals",    path: "/leave/approvals",    icon: CheckSquare,     roles: ["admin","hr","manager"] },
  { label: "Attendance",   path: "/attendance",         icon: Clock,           roles: ["admin","hr","manager","user","employee"] },

  // ── Finance ──
  { label: "Payroll",      path: "/payroll",            icon: CreditCard,      roles: ["admin","hr","manager","user","employee"] },
  { label: "Expenses",     path: "/expenses",           icon: Receipt,         roles: ["admin","hr","manager","user","employee"] },

  // ── Asset Management ──
  { label: "Assets",       path: "/assets",             icon: Laptop,          roles: ["admin","hr","manager","user","employee"] },
  { label: "Asset Requests",path: "/assets/requests",   icon: Briefcase,       roles: ["admin","hr","manager","user","employee"] },

  // ── Notifications ──
  { label: "Notifications",path: "/notifications",      icon: Bell,            roles: ["admin","hr","manager","user","employee"] },

  // ── Admin Only ──
  { label: "User Management", path: "/admin/users",    icon: Shield,          roles: ["admin"] },
  { label: "Audit Logs",   path: "/audit-logs",         icon: History,         roles: ["admin"] },
  { label: "Reports",      path: "/reports",            icon: FileSpreadsheet, roles: ["admin","hr","manager"] },
];

const navGroups = [
  { title: "Core",              keys: ["Dashboard", "Search"] },
  { title: "Employees",         keys: ["Employees", "Departments", "Skills"] },
  { title: "Leave & Time",      keys: ["Apply Leave", "My Leaves", "Approvals", "Attendance"] },
  { title: "Finance",           keys: ["Payroll", "Expenses"] },
  { title: "Assets",            keys: ["Assets", "Asset Requests"] },
  { title: "Notifications",     keys: ["Notifications"] },
  { title: "Admin",             keys: ["User Management", "Audit Logs", "Reports"] },
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
        <div className="sidebar-logo">
          <Building2 size={16} />
        </div>
        <span className="sidebar-name">PeopleDesk</span>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const items = filtered.filter((i) => group.keys.includes(i.label));
          if (!items.length) return null;
          return (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-label">{group.title}</div>
              {items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <IconComponent size={16} className="sidebar-link-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
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
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user.name}</div>
              <div className="sidebar-role">{user.role}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
