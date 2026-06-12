import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import {
  Users,
  Building2,
  Lightbulb,
  Laptop,
  CheckCircle,
  Clock,
  CheckSquare
} from "lucide-react";
import "../components/Layout.css";
import "./Dashboard.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const COLORS = ["#4f46e5", "#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e"];

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTop: `4px solid ${accent}` } : {}}>
      <div className="stat-header">
        <div className="stat-icon-wrapper" style={{ background: `${accent}15`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value ?? "—"}</div>
        <div className="stat-card-sub">{sub}</div>
      </div>
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
            <StatCard label="Total Employees" value={stats?.total_employees} sub="registered" icon={Users} accent="#4f46e5" />
            <StatCard label="Departments" value={stats?.total_departments} sub="active" icon={Building2} accent="#0ea5e9" />
            <StatCard label="Skills Tracked" value={stats?.total_skills} sub="on record" icon={Lightbulb} accent="#f59e0b" />
            <StatCard label="Total Assets" value={stats?.total_assets} sub="in inventory" icon={Laptop} accent="#8b5cf6" />
            <StatCard label="Available Assets" value={stats?.available_assets} sub="ready to assign" icon={CheckCircle} accent="#10b981" />
            <StatCard label="Pending Leaves" value={stats?.pending_leaves} sub="awaiting approval" icon={Clock} accent="#ef4444" />
            <StatCard label="Approved Leaves" value={stats?.approved_leaves} sub="this cycle" icon={CheckSquare} accent="#10b981" />
          </div>

          {/* ── Charts Row 1 ── */}
          <div className="chart-grid">
            {/* Department Wise Count — Bar Chart */}
            <div className="chart-card">
              <div className="chart-title">Department Wise Headcount</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.dept_employee_count || []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="department_name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                  <Bar dataKey="employee_count" name="Employees" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Wise Salary — Bar Chart */}
            <div className="chart-card">
              <div className="chart-title">Departmental Salary Expense (Monthly)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.dept_salary_distribution || []} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="department_name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Total Salary"]} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                  <Bar dataKey="total_salary" name="Total Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="new_hires"
                    name="New Hires"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#hiringGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Charts Row 3 ── */}
          <div className="chart-grid">
            {/* Attendance Punctuality — Pie Chart */}
            <div className="chart-card">
              <div className="chart-title">Attendance Punctuality Breakdown</div>
              {!stats?.attendance_status_breakdown || stats.attendance_status_breakdown.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "220px", color: "var(--text-muted)", fontSize: "12px" }}>
                  No attendance records logged
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats?.attendance_status_breakdown || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                      label={({ status, percent }) => `${status.toUpperCase()} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(stats?.attendance_status_breakdown || []).map((entry, idx) => (
                        <Cell key={idx} fill={entry.status === 'present' ? '#10b981' : entry.status === 'late' ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Leave Trend — Bar Chart */}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                  <Bar dataKey="value" name="Leaves" radius={[4, 4, 0, 0]}>
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
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
