import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function LeaveApprovals() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/leave/pending`, {
        headers: { Authorization: token },
      })
      .then((r) => setLeaves(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (action) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/leave/${selected.id}/${action}`,
        { remarks },
        { headers: { Authorization: token } }
      );
      setLeaves(leaves.filter((l) => l.id !== selected.id));
      setSelected(null);
      setRemarks("");
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const columns = [
    { key: "employee_name", label: "Employee" },
    { key: "leave_name",    label: "Leave Type" },
    { key: "from_date",     label: "From",  render: (v) => new Date(v).toLocaleDateString() },
    { key: "to_date",       label: "To",    render: (v) => new Date(v).toLocaleDateString() },
    { key: "total_days",    label: "Days" },
    { key: "reason",        label: "Reason" },
    { key: "status",        label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>Leave Approvals</h2>
        <p>Review and action pending leave requests</p>
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={leaves}
            actions={(row) => (
              <Button size="sm" onClick={() => setSelected(row)}>Review</Button>
            )}
          />
        )}
      </Card>

      {selected && (
        <Modal title="Review Leave Request" onClose={() => setSelected(null)}>
          <p style={{ fontSize: 14, marginBottom: 16, color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text)" }}>{selected.employee_name}</strong> has requested{" "}
            <strong style={{ color: "var(--text)" }}>{selected.total_days} day(s)</strong> of{" "}
            {selected.leave_name}.
          </p>
          <p style={{ fontSize: 14, marginBottom: 20, color: "var(--text-muted)" }}>
            Reason: {selected.reason}
          </p>
          <div className="form-group">
            <label>Remarks (optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
          <div className="form-actions">
            <Button variant="danger"  onClick={() => handleAction("reject")}>Reject</Button>
            <Button variant="success" onClick={() => handleAction("approve")}>Approve</Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

export default LeaveApprovals;
