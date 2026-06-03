import { useEffect, useState } from "react";
import axios from "axios";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: token },
      })
      .then((res) => setDepartments(res.data));
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await axios.post(
      "http://localhost:5000/api/departments",
      { department_name: name },
      { headers: { Authorization: token } }
    );
    setDepartments([...departments, res.data]);
    setName("");
  };

  return (
    <div>
      <h2>Departments</h2>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {departments.map((d) => (
          <li key={d.id}>{d.department_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Departments;