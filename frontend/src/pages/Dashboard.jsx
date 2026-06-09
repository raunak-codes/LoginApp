import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import "../components/Layout.css";

function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees/stats/count", {
        headers: { Authorization: token },
      })
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const statItems = stats
    ? [
        { label: "Total Employees",   value: stats.total_employees,   sub: "registered" },
        { label: "Departments",        value: stats.total_departments, sub: "active" },
        { label: "Skills Tracked",     value: stats.total_skills,      sub: "on record" },
        { label: "Employee Images",    value: stats.total_images,      sub: "uploaded" },
      ]
    : [];

  return (
    <Layout>
      <div className="page-header">
        <h2>Good day, {user?.name} 👋</h2>
        <p>Here's what's happening across your organisation.</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="stat-grid">
          {statItems.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value">{s.value ?? "—"}</div>
              <div className="stat-card-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;
