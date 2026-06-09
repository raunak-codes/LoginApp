import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";

function ApplyLeave() {
  const { token } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: "", from_date: "", to_date: "", reason: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/leave/types", {
        headers: { Authorization: token },
      })
      .then((r) => setLeaveTypes(r.data))
      .catch(console.error);
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/leave/apply", form, {
        headers: { Authorization: token },
      });
      setSuccess(true);
      setForm({ leave_type_id: "", from_date: "", to_date: "", reason: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Apply for Leave</h2>
        <p>Submit a new leave request</p>
      </div>

      {success && (
        <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 14 }}>
          Leave application submitted successfully.
        </div>
      )}

      <Card style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Type</label>
            <select name="leave_type_id" value={form.leave_type_id} onChange={handleChange} required>
              <option value="">Select leave type</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.leave_name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Date</label>
              <input type="date" name="from_date" value={form.from_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input type="date" name="to_date" value={form.to_date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea name="reason" placeholder="Brief reason for leave..." value={form.reason} onChange={handleChange} required />
          </div>

          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
}

export default ApplyLeave;
