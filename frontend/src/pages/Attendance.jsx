import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import FormTable from "../components/FormTable";
import StatusBadge from "../components/StatusBadge";
import { Clock, LogIn, LogOut, Info, ShieldAlert } from "lucide-react";
import "../components/Layout.css";
import "./Attendance.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Attendance() {
  const { token, user } = useAuth();
  const isAdmin = ["admin", "hr"].includes(user?.role);

  // States
  const [todayStatus, setTodayStatus] = useState({
    checkedIn: false,
    checkInTime: null,
    checkOutTime: null,
    status: null,
    isLate: false
  });
  const [myLogs, setMyLogs] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // my | team
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch functions
  const fetchTodayStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/attendance/status`, {
        headers: { Authorization: token }
      });
      setTodayStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyLogs = async () => {
    try {
      const res = await axios.get(`${API}/api/attendance/my`, {
        headers: { Authorization: token }
      });
      setMyLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamLogs = async () => {
    try {
      const res = await axios.get(`${API}/api/attendance/list?date=${filterDate}`, {
        headers: { Authorization: token }
      });
      setTeamLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchTodayStatus(), fetchMyLogs()]);
    if (isAdmin) {
      await fetchTeamLogs();
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [token]);

  useEffect(() => {
    if (isAdmin && activeTab === "team") {
      fetchTeamLogs();
    }
  }, [filterDate, activeTab]);

  // Actions
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/attendance/check-in`, {}, {
        headers: { Authorization: token }
      });
      alert(res.data.message || "Checked in successfully.");
      await initData();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!window.confirm("Confirm clock-out for today?")) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/attendance/check-out`, {}, {
        headers: { Authorization: token }
      });
      alert(res.data.message || "Checked out successfully.");
      await initData();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
    } finally {
      setLoading(false);
    }
  };

  // Grid columns definition
  const myColumns = [
    {
      key: "created_at",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    },
    {
      key: "check_in",
      label: "Check In",
      render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"
    },
    {
      key: "check_out",
      label: "Check Out",
      render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"
    },
    {
      key: "is_late",
      label: "Late",
      render: (val) => val ? <span style={{ color: "var(--warning)", fontWeight: 600 }}>Yes</span> : "No"
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />
    }
  ];

  const teamColumns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email" },
    { key: "designation", label: "Designation" },
    {
      key: "check_in",
      label: "Check In",
      render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"
    },
    {
      key: "check_out",
      label: "Check Out",
      render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"
    },
    {
      key: "status",
      label: "Status",
      render: (val) => val ? <StatusBadge status={val} /> : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Not Clocked In</span>
    }
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>Attendance Tracking</h2>
        <p>Log your daily work hours, check shift parameters, and track work logs.</p>
      </div>

      <div className="attendance-container">
        {/* Check-In Console Card */}
        <div className="attendance-console">
          <div className="clock-card">
            <Clock size={28} style={{ color: "var(--accent)" }} />
            <div className="digital-clock">{timeStr}</div>
            <div className="date-text">{dateStr}</div>

            <div className="clock-actions">
              {!todayStatus.checkedIn ? (
                <Button onClick={handleCheckIn} disabled={loading} style={{ display: "flex", gap: "8px" }}>
                  <LogIn size={16} /> Check In
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={handleCheckOut}
                  disabled={loading || !!todayStatus.checkOutTime}
                  style={{ display: "flex", gap: "8px" }}
                >
                  <LogOut size={16} /> Check Out
                </Button>
              )}
            </div>
          </div>

          <div className="rules-card">
            <div className="rules-title">Attendance Policy Rules</div>
            <div className="rules-list">
              <div className="rule-item">
                <Info size={16} className="rule-bullet" />
                <div><strong>Standard Shift Deadline:</strong> Employees must check in by <strong>09:15 AM</strong>. Any check-in after this is flagged as late.</div>
              </div>
              <div className="rule-item">
                <ShieldAlert size={16} className="rule-bullet" style={{ color: "var(--danger)" }} />
                <div><strong>Late Check-in Limit:</strong> For every <strong>3 late entries</strong> logged in a calendar month, <strong>1 day of attendance is deducted</strong> (the 3rd day's check-in status will automatically record as <strong>Absent</strong>).</div>
              </div>
            </div>
            {todayStatus.checkedIn && (
              <div className="attendance-status-banner">
                <div>
                  <strong>Today's Log:</strong> Checked In at <strong>{new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>. Status: <StatusBadge status={todayStatus.status} /> {todayStatus.isLate ? "⚠️ (Late Entry)" : ""}
                  {todayStatus.checkOutTime && (
                    <span> | Checked Out at <strong>{new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection (Admins/HR only) */}
        {isAdmin && (
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Attendance Logs
            </button>
            <button
              className={`tab-btn ${activeTab === "team" ? "active" : ""}`}
              onClick={() => setActiveTab("team")}
            >
              Team Attendance Ledger
            </button>
          </div>
        )}

        {/* Views */}
        {activeTab === "my" ? (
          <div>
            <div style={{ marginBottom: "12px", fontWeight: "600", fontSize: "14px" }}>My History Logs</div>
            <FormTable
              columns={myColumns}
              data={myLogs}
              loading={loading}
              emptyMessage="No attendance logs found for this month."
            />
          </div>
        ) : (
          <div>
            <div className="attendance-filters">
              <label>Select Log Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <FormTable
              columns={teamColumns}
              data={teamLogs}
              loading={loading}
              emptyMessage="No employees registered or logged for this date."
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Attendance;
