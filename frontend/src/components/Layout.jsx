import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-body">
        <header className="layout-topbar">
          <div className="layout-topbar-right">
            <NotificationBell />
          </div>
        </header>
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
