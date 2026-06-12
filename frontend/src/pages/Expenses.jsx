import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { Receipt, Send, Check, X, FileText } from "lucide-react";
import "../components/Layout.css";
import "./Expenses.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Expenses() {
  const { token, user } = useAuth();
  const isApprover = ["admin", "hr", "manager"].includes(user?.role);

  // States
  const [myClaims, setMyClaims] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // my | pending
  const [loading, setLoading] = useState(true);

  // Form states
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "travel",
    description: "",
    receipt_url: ""
  });

  const fetchMyClaims = async () => {
    try {
      const res = await axios.get(`${API}/api/expenses/my`, {
        headers: { Authorization: token }
      });
      setMyClaims(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingClaims = async () => {
    try {
      const res = await axios.get(`${API}/api/expenses/pending`, {
        headers: { Authorization: token }
      });
      setPendingClaims(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await fetchMyClaims();
    if (isApprover) {
      await fetchPendingClaims();
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [token]);

  useEffect(() => {
    if (isApprover && activeTab === "pending") {
      fetchPendingClaims();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return alert("Please fill all required fields.");
    try {
      setLoading(true);
      await axios.post(`${API}/api/expenses/claim`, form, {
        headers: { Authorization: token }
      });
      alert("Expense claim submitted successfully.");
      setForm({
        title: "",
        amount: "",
        category: "travel",
        description: "",
        receipt_url: ""
      });
      await fetchMyClaims();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit claim.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this expense claim?")) return;
    try {
      setLoading(true);
      await axios.post(`${API}/api/expenses/${id}/approve`, {}, {
        headers: { Authorization: token }
      });
      alert("Expense claim approved.");
      await fetchPendingClaims();
      await fetchMyClaims();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this expense claim?")) return;
    try {
      setLoading(true);
      await axios.post(`${API}/api/expenses/${id}/reject`, {}, {
        headers: { Authorization: token }
      });
      alert("Expense claim rejected.");
      await fetchPendingClaims();
      await fetchMyClaims();
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const myColumns = [
    {
      key: "created_at",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    },
    { key: "title", label: "Description" },
    { key: "category", label: "Category" },
    {
      key: "amount",
      label: "Amount",
      render: (val) => `₹${parseFloat(val).toLocaleString()}`
    },
    {
      key: "receipt_url",
      label: "Receipt",
      render: (val) => val ? <a href={val} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>View Doc</a> : "—"
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />
    }
  ];

  const pendingColumns = [
    {
      key: "created_at",
      label: "Date",
      render: (val) => new Date(val).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    },
    { key: "name", label: "Employee" },
    { key: "designation", label: "Designation" },
    { key: "title", label: "Claim Detail" },
    { key: "category", label: "Category" },
    {
      key: "amount",
      label: "Amount",
      render: (val) => `₹${parseFloat(val).toLocaleString()}`
    },
    {
      key: "receipt_url",
      label: "Receipt",
      render: (val) => val ? <a href={val} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>View Doc</a> : "—"
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button size="sm" onClick={() => handleApprove(row.id)} style={{ padding: "6px 10px" }}>
            <Check size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleReject(row.id)} style={{ padding: "6px 10px" }}>
            <X size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>Expense Claims</h2>
        <p>File receipt claims for corporate travels, office hardware, utilities, and client meals.</p>
      </div>

      <div className="expenses-container">
        {/* Tab switcher */}
        {isApprover && (
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Expenses
            </button>
            <button
              className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approvals Ledger
            </button>
          </div>
        )}

        {activeTab === "my" ? (
          <div className="expenses-layout">
            {/* Submit form */}
            <div className="claim-form-card">
              <div className="claim-form-title">File Expense Claim</div>
              <form onSubmit={handleSubmitClaim}>
                <div className="form-group">
                  <label>Claim Description *</label>
                  <input
                    name="title"
                    placeholder="e.g. Flight to conference"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reimbursement Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange} required>
                    <option value="travel">Travel & Lodging</option>
                    <option value="hardware">Hardware & Software</option>
                    <option value="meals">Meals & Entertainment</option>
                    <option value="other">Other / Miscellaneous</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      name="amount"
                      type="number"
                      placeholder="5000"
                      value={form.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Receipt Document Link</label>
                    <input
                      name="receipt_url"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={form.receipt_url}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Justification Details</label>
                  <textarea
                    name="description"
                    placeholder="Provide context for finance auditors..."
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" disabled={loading} style={{ display: "flex", gap: "8px", width: "100%", marginTop: "8px" }}>
                  <Send size={15} /> Submit Claim
                </Button>
              </form>
            </div>

            {/* History Table */}
            <div className="expenses-history-card">
              <div style={{ fontWeight: "600", fontSize: "14.5px" }}>My Personal Claims History</div>
              <FormTable
                columns={myColumns}
                data={myClaims}
                loading={loading}
                emptyMessage="No expense claims filed yet."
              />
            </div>
          </div>
        ) : (
          /* Pending Ledger */
          <div>
            <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "14.5px" }}>Pending Claims Queue</div>
            <FormTable
              columns={pendingColumns}
              data={pendingClaims}
              loading={loading}
              emptyMessage="No pending expense claims at this time."
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Expenses;
