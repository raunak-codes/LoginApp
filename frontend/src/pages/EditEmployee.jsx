import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/departments", {
        headers: { Authorization: token },
      })
      .then((res) => setDepartments(res.data));

    axios
      .get(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        const { department_id, phone, address, designation, salary } = res.data;
        setForm({ department_id, phone, address, designation, salary });
      });
  }, [id, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/api/employees/${id}`, form, {
      headers: { Authorization: token },
    });
    alert("Employee updated");
    navigate("/employees");
  };

  return (
    <div>
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <select name="department_id" value={form.department_id} onChange={handleChange}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={handleChange}
        />
        <input
          name="salary"
          placeholder="Salary"
          type="number"
          value={form.salary}
          onChange={handleChange}
        />

        <button type="submit">Update Employee</button>
      </form>
    </div>
  );
}

export default EditEmployee;