import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">{children}</main>
    </div>
  );
}

export default Layout;
