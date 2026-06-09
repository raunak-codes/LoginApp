import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function CreateEmployee() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user_id: "", department_id: "", phone: "",
    address: "", designation: "", salary: "", skill_ids: [],
  });

  useEffect(() => {
    const h = { headers: { Authorization: token } };
    axios.get(`${API}/api/departments`, h).then((r) => setDepartments(r.data));
    axios.get(`${API}/api/skills`, h).then((r) => setSkills(r.data));
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSkillChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value));
    setForm({ ...form, skill_ids: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/employees`, form, {
        headers: { Authorization: token },
      });
      if (images.length > 0) {
        const fd = new FormData();
        fd.append("employee_id", res.data.id);
        Array.from(images).forEach((f) => fd.append("images", f));
        await axios.post(`${API}/api/employees/upload`, fd, {
          headers: { Authorization: token },
        });
      }
      navigate("/employees");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Add Employee</h2>
        <p>Create a new employee profile</p>
      </div>

      <Card style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>User ID</label>
              <input name="user_id" placeholder="Enter user ID" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department_id" onChange={handleChange} required>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" placeholder="Phone number" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input name="designation" placeholder="e.g. Software Engineer" onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary</label>
              <input name="salary" type="number" placeholder="Annual salary" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" placeholder="City / Address" onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Skills <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(hold Ctrl to select multiple)</span></label>
            <select multiple onChange={handleSkillChange} style={{ height: 100 }}>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>{s.skill_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Photos <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(max 5)</span></label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
          </div>

          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate("/employees")}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Employee"}</Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}

export default CreateEmployee;
