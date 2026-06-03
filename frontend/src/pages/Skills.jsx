import { useEffect, useState } from "react";
import axios from "axios";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/skills", {
        headers: { Authorization: token },
      })
      .then((res) => setSkills(res.data));
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await axios.post(
      "http://localhost:5000/api/skills",
      { skill_name: name },
      { headers: { Authorization: token } }
    );
    setSkills([...skills, res.data]);
    setName("");
  };

  return (
    <div>
      <h2>Skills</h2>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Skill Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {skills.map((s) => (
          <li key={s.id}>{s.skill_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Skills;