import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import {

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line,
} from "recharts";
import "../components/Layout.css";
import "./Dashboard.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


const COLORS = ["#c17f3e", "#3a7d5c", "#3a5c8a", "#b84c4c", "#b87c2e", "#6b4ab8"];

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? "—"}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}

function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/api/dashboard/stats`, {
        headers: { Authorization: token },
      })
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Layout>
      <div className="page-header">
        <h2>{greeting}, {user?.name} 👋</h2>
        <p>Here's your organisation overview for today.</p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="stat-grid stat-grid--7">
            <StatCard label="Total Employees" value={stats?.total_employees} sub="registered" icon="👥" accent="#c17f3e" />
            <StatCard label="Departments" value={stats?.total_departments} sub="active" icon="🏢" accent="#3a5c8a" />
            <StatCard label="Skills Tracked" value={stats?.total_skills} sub="on record" icon="💡" accent="#b87c2e" />
            <StatCard label="Total Assets" value={stats?.total_assets} sub="in inventory" icon="💻" accent="#3a7d5c" />
            <StatCard label="Available Assets" value={stats?.available_assets} sub="ready to assign" icon="✅" accent="#3a7d5c" />
            <StatCard label="Pending Leaves" value={stats?.pending_leaves} sub="awaiting approval" icon="⏳" accent="#b84c4c" />
            <StatCard label="Approved Leaves" value={stats?.approved_leaves} sub="this cycle" icon="✔️" accent="#3a7d5c" />
          </div>

          {/* ── Charts Row 1 ── */}
          <div className="chart-grid">
            {/* Department Wise Count — Bar Chart */}
            <div className="chart-card">
              <div className="chart-title">Department Wise Headcount</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.dept_employee_count || []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="employee_count" name="Employees" fill="#c17f3e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Status — Pie Chart */}
            <div className="chart-card">
              <div className="chart-title">Asset Status Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats?.asset_status_breakdown || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.asset_status_breakdown || []).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Charts Row 2 ── */}
          <div className="chart-grid">
            {/* Monthly Hiring Trend — Area Chart */}
            <div className="chart-card chart-card--wide">
              <div className="chart-title">Monthly Hiring Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.monthly_hiring || []}>
                  <defs>
                    <linearGradient id="hiringGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c17f3e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c17f3e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="new_hires"
                    name="New Hires"
                    stroke="#c17f3e"
                    strokeWidth={2}
                    fill="url(#hiringGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Leave Trend — Line Chart */}
            <div className="chart-card">
              <div className="chart-title">Leave Overview</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    { name: "Pending", value: stats?.pending_leaves || 0 },
                    { name: "Approved", value: stats?.approved_leaves || 0 },
                  ]}
                  barSize={48}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Leaves" radius={[4, 4, 0, 0]}>
                    <Cell fill="#b87c2e" />
                    <Cell fill="#3a7d5c" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Dashboard;
