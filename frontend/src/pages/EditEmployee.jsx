import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

function EditEmployee() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    department_id: "", phone: "", address: "", designation: "", salary: "",
  });

  useEffect(() => {
    const h = { headers: { Authorization: token } };
    axios.get("http://localhost:5000/api/departments", h).then((r) => setDepartments(r.data));
    axios.get(`http://localhost:5000/api/employees/${id}`, h).then((r) => {
      const { department_id, phone, address, designation, salary } = r.data;
      setForm({ department_id, phone, address, designation, salary });
    });
  }, [id, token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/employees/${id}`, form, {
        headers: { Authorization: token },
      });
      navigate("/employees");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Edit Employee</h2>
        <p>Update employee profile details</p>
      </div>

      <Card style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department</label>
            <select name="department_id" value={form.department_id} onChange={handleChange}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input name="designation" value={form.designation || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary</label>
              <input name="salary" type="number" value={form.salary || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={form.address || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate("/employees")}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}

export default EditEmployee;
