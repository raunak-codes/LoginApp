import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";

function Skills() {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/skills", {
        headers: { Authorization: token },
      })
      .then((r) => setSkills(r.data));
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await axios.post(
      "http://localhost:5000/api/skills",
      { skill_name: name },
      { headers: { Authorization: token } }
    );
    setSkills([...skills, res.data]);
    setName("");
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Skills</h2>
        <p>Manage skills tracked across employees</p>
      </div>

      <Card style={{ maxWidth: 480, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add Skill</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Skill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }}
          />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card style={{ padding: 0, maxWidth: 480 }}>
        <Table
          columns={[{ key: "id", label: "#" }, { key: "skill_name", label: "Skill Name" }]}
          data={skills}
        />
      </Card>
    </Layout>
  );
}

export default Skills;
