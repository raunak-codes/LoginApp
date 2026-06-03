import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: token },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate("/"));

    axios
      .get("http://localhost:5000/api/employees/stats/count", {
        headers: { Authorization: token },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email} | Role: {user.role}</p>

      {stats && (
        <div>
          <h3>Statistics</h3>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>
              <p>Employees</p>
              <h2>{stats.total_employees}</h2>
            </div>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>
              <p>Departments</p>
              <h2>{stats.total_departments}</h2>
            </div>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>
              <p>Skills</p>
              <h2>{stats.total_skills}</h2>
            </div>
            <div style={{ border: "1px solid #ccc", padding: "16px" }}>
              <p>Images</p>
              <h2>{stats.total_images}</h2>
            </div>
          </div>
        </div>
      )}

      <br />
      <button onClick={() => navigate("/employees")}>Employee List</button>
      <button onClick={() => navigate("/employees/create")}>Add Employee</button>
      <button onClick={() => navigate("/departments")}>Departments</button>
      <button onClick={() => navigate("/skills")}>Skills</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;