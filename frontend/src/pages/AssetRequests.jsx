import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { Laptop, Send, Check, X, ClipboardList } from "lucide-react";
import "../components/Layout.css";
import "./AssetRequests.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AssetRequests() {
  const { token, user } = useAuth();
  const isAdmin = ["admin", "hr"].includes(user?.role);

  // States
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // my | pending
  const [loading, setLoading] = useState(true);

  // Approval Modal States
  const [showModal, setShowModal] = useState(false);
  const [targetReq, setTargetReq] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");

  // Form states
  const [form, setForm] = useState({
    asset_name: "",
    asset_type: "Laptop",
    reason: ""
  });

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/assets/requests/my`, {
        headers: { Authorization: token }
      });
      setMyRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/assets/requests/pending`, {
        headers: { Authorization: token }
      });
      setPendingRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await fetchMyRequests();
    if (isAdmin) {
      await fetchPendingRequests();
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [token]);

  useEffect(() => {
    if (isAdmin && activeTab === "pending") {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.asset_name) return alert("Please specify asset name.");
    try {
      setLoading(true);
      await axios.post(`${API}/api/assets/request`, form, {
        headers: { Authorization: token }
      });
      alert("Asset request submitted successfully.");
      setForm({
        asset_name: "",
        asset_type: "Laptop",
        reason: ""
      });
      await fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApproveModal = async (reqItem) => {
    try {
      setLoading(true);
      setTargetReq(reqItem);
      // Fetch available assets from inventory
      const res = await axios.get(`${API}/api/assets?status=available`, {
        headers: { Authorization: token }
      });
      // Filter assets matching the requested type (optional filter, or show all available)
      const matching = res.data.data.filter(a => a.asset_type.toLowerCase() === reqItem.asset_type.toLowerCase());
      const list = matching.length > 0 ? matching : res.data.data;
      
      setAvailableAssets(list);
      if (list.length > 0) {
        setSelectedAssetId(list[0].id);
      } else {
        setSelectedAssetId("");
      }
      setShowModal(true);
    } catch (err) {
      alert("Failed to load inventory stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedAssetId) return alert("Please select an asset to allocate.");
    try {
      setLoading(true);
      await axios.post(
        `${API}/api/assets/requests/${targetReq.id}/approve`,
        { asset_id: selectedAssetId },
        { headers: { Authorization: token } }
      );
      alert("Asset request approved and gear allocated.");
      setShowModal(false);
      setTargetReq(null);
      await fetchPendingRequests();
      await fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this equipment request?")) return;
    try {
      setLoading(true);
      await axios.post(`${API}/api/assets/requests/${id}/reject`, {}, {
        headers: { Authorization: token }
      });
      alert("Asset request rejected.");
      await fetchPendingRequests();
      await fetchMyRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request.");
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
    { key: "asset_name", label: "Requested Item" },
    { key: "asset_type", label: "Type" },
    { key: "reason", label: "Reason" },
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
    { key: "asset_name", label: "Equipment Details" },
    { key: "asset_type", label: "Type" },
    { key: "reason", label: "Reason" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button size="sm" onClick={() => handleOpenApproveModal(row)} style={{ padding: "6px 10px" }}>
            <Check size={14} /> Allocate
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
        <h2>Asset Requests</h2>
        <p>Request company devices, peripheral hardware, standard office keys, or license registrations.</p>
      </div>

      <div className="asset-requests-container">
        {/* Tab switcher */}
        {isAdmin && (
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Device Requests
            </button>
            <button
              className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Requests Ledger
            </button>
          </div>
        )}

        {activeTab === "my" ? (
          <div className="asset-requests-layout">
            {/* Submit form */}
            <div className="request-form-card">
              <div className="request-form-title">Request Equipment</div>
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>Asset Description / Name *</label>
                  <input
                    name="asset_name"
                    placeholder="e.g. MacBook Pro M3 or Dell Monitor"
                    value={form.asset_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Asset Category Type *</label>
                  <select name="asset_type" value={form.asset_type} onChange={handleInputChange} required>
                    <option value="Laptop">Laptop / Workstation</option>
                    <option value="Monitor">Monitor / Display</option>
                    <option value="Keycard">Office Access Card</option>
                    <option value="Phone">Mobile Device</option>
                    <option value="Headset">Audio / Headset</option>
                    <option value="Other">Other Peripherals</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Business Justification Detail</label>
                  <textarea
                    name="reason"
                    placeholder="Describe why you need this equipment..."
                    value={form.reason}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" disabled={loading} style={{ display: "flex", gap: "8px", width: "100%", marginTop: "8px" }}>
                  <Send size={15} /> Submit Request
                </Button>
              </form>
            </div>

            {/* History Table */}
            <div className="request-history-card">
              <div style={{ fontWeight: "600", fontSize: "14.5px" }}>My Personal Requests History</div>
              <FormTable
                columns={myColumns}
                data={myRequests}
                loading={loading}
                emptyMessage="No asset requests logged."
              />
            </div>
          </div>
        ) : (
          /* Pending Ledger */
          <div>
            <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "14.5px" }}>Pending Requests Queue</div>
            <FormTable
              columns={pendingColumns}
              data={pendingRequests}
              loading={loading}
              emptyMessage="No pending equipment requests found."
            />
          </div>
        )}
      </div>

      {/* Allocation Approval Modal */}
      {showModal && targetReq && (
        <Modal
          title="Approve Request & Allocate Asset"
          onClose={() => {
            setShowModal(false);
            setTargetReq(null);
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
              Allocating asset for <strong>{targetReq.name}</strong> ({targetReq.designation}) in response to request: <br />
              <span style={{ color: "var(--text-muted)" }}>"{targetReq.asset_name}" ({targetReq.asset_type})</span>
            </div>

            <div className="form-group">
              <label>Select Available Inventory Stock *</label>
              {availableAssets.length > 0 ? (
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    outline: "none",
                    width: "100%"
                  }}
                >
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_name} ({asset.asset_code}) - {asset.asset_type}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ color: "var(--danger)", fontWeight: "600", fontSize: "13px" }}>
                  ⚠️ No available stock found in inventory matching this type. Please register new assets first.
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setTargetReq(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmApprove} disabled={!selectedAssetId || loading}>
                Confirm Allocation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

export default AssetRequests;
