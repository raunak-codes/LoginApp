import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import "../components/Layout.css";
import "./AssetHistory.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function AssetAllocation() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets/${id}`, { headers: { Authorization: token } }).then((r) => setAsset(r.data));
    axios.get(`${API}/api/employees?limit=1000`, { headers: { Authorization: token } }).then((r) => setEmployees(r.data.data || []));
  }, [id, token]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!employeeId) { setError("Please select an employee"); return; }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets/${id}/allocate`,
        { employee_id: parseInt(employeeId), remarks },
        { headers: { Authorization: token } }
      );
      setSuccess("Asset allocated successfully! Employee has been notified.");
      setTimeout(() => navigate("/assets"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Allocation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Allocate Asset</h2>
        <p>Assign this asset to an employee. A notification will be sent automatically.</p>
      </div>

      {asset && (
        <div className="asset-info-card">
          <div className="asset-info-row">
            <span className="asset-info-label">Asset</span>
            <span className="asset-info-value">{asset.asset_name}</span>
          </div>
          <div className="asset-info-row">
            <span className="asset-info-label">Code</span>
            <span className="asset-info-value">{asset.asset_code}</span>
          </div>
          <div className="asset-info-row">
            <span className="asset-info-label">Type</span>
            <span className="asset-info-value">{asset.asset_type}</span>
          </div>
          <div className="asset-info-row">
            <span className="asset-info-label">Status</span>
            <span className="asset-info-value" style={{ color: "var(--success)" }}>{asset.status}</span>
          </div>
        </div>
      )}

      <div className="form-card">
        {success && <div className="alert-success">{success}</div>}
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleAllocate}>
          <FormSelect
            label="Select Employee" id="employee" value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            options={employees.map((emp) => ({ value: emp.user_id, label: `${emp.name} — ${emp.department_name} (${emp.designation})` }))}
            placeholder="Choose employee…" required
          />

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Remarks (optional)</label>
            <textarea
              className="form-control"
              placeholder="e.g. Assigned for project work"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-actions" style={{ marginTop: 20 }}>
            <Button type="button" variant="secondary" onClick={() => navigate("/assets")}>Cancel</Button>
            <Button type="submit" loading={loading}>Allocate Asset</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AssetAllocation;
