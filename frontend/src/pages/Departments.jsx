import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";

function Departments() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: token },
      })
      .then((r) => setDepartments(r.data));
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await axios.post(
      "http://localhost:5000/api/departments",
      { department_name: name },
      { headers: { Authorization: token } }
    );
    setDepartments([...departments, res.data]);
    setName("");
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Departments</h2>
        <p>Manage your organisation's departments</p>
      </div>

      <Card style={{ maxWidth: 480, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add Department</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            className="inline-input"
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }}
          />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card style={{ padding: 0, maxWidth: 480 }}>
        <Table
          columns={[{ key: "id", label: "#" }, { key: "department_name", label: "Department Name" }]}
          data={departments}
        />
      </Card>
    </Layout>
  );
}

export default Departments;
