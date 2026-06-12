import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Table from "../components/Table";
import Loader from "../components/Loader";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function UserManagement() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/user`, {
        headers: { Authorization: token },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setError("");
    setSuccess("");
    try {
      await axios.put(
        `${API}/api/user/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: token },
        }
      );
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (role, row) => {
        const isSelf = row.id === user?.id;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select
              value={role}
              onChange={(e) => handleRoleChange(row.id, e.target.value)}
              disabled={isSelf || updatingId === row.id}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                outline: "none",
                cursor: isSelf ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              <option value="user">User</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
            {updatingId === row.id && (
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Saving...</span>
            )}
            {isSelf && (
              <span style={{ fontSize: "11px", color: "var(--accent)", fontStyle: "italic" }}>
                (You)
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>User Role Management</h2>
        <p>Manage system users, access roles, and permissions.</p>
      </div>

      {success && (
        <div
          style={{
            color: "#10b981",
            background: "rgba(16, 185, 129, 0.1)",
            padding: "12px 16px",
            borderRadius: "var(--radius)",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          style={{
            color: "#ef4444",
            background: "rgba(239, 68, 68, 0.1)",
            padding: "12px 16px",
            borderRadius: "var(--radius)",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", maxWidth: "480px" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? <Loader /> : <Table columns={columns} data={filteredUsers} />}
      </Card>
    </Layout>
  );
}

export default UserManagement;
