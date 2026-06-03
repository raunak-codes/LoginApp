import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateEmployee() {
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
    skill_ids: [],
  });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: token },
      })
      .then((res) => setDepartments(res.data));

    axios
      .get("http://localhost:5000/api/skills", {
        headers: { Authorization: token },
      })
      .then((res) => setSkills(res.data));
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) =>
      parseInt(o.value)
    );
    setForm({ ...form, skill_ids: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Create employee profile
    const empRes = await axios.post(
      "http://localhost:5000/api/employees",
      form,
      { headers: { Authorization: token } }
    );

    const employee_id = empRes.data.id;

    // Step 2: Upload images if selected
    if (images.length > 0) {
      const formData = new FormData();
      formData.append("employee_id", employee_id);
      Array.from(images).forEach((file) => formData.append("images", file));

      await axios.post(
        "http://localhost:5000/api/employees/upload",
        formData,
        { headers: { Authorization: token } }
      );
    }

    alert("Employee created successfully");
    navigate("/employees");
  };

  return (
    <div>
      <h2>Create Employee</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="user_id"
          placeholder="User ID"
          onChange={handleChange}
        />

        <select name="department_id" onChange={handleChange}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>

        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input
          name="designation"
          placeholder="Designation"
          onChange={handleChange}
        />
        <input
          name="salary"
          placeholder="Salary"
          type="number"
          onChange={handleChange}
        />

        <label>Skills (hold Ctrl to select multiple)</label>
        <select multiple onChange={handleSkillChange}>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.skill_name}
            </option>
          ))}
        </select>

        <label>Upload Images (max 5)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
        />

        <button type="submit">Create Employee</button>
      </form>
    </div>
  );
}

export default CreateEmployee;