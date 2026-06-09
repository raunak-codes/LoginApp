import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Button from "../components/Button";
import "../components/Layout.css";
import "./AssetHistory.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


const ASSET_TYPES = ["Laptop", "Mouse", "Monitor", "Keyboard", "Access Card", "ID Card", "Software License", "Mobile", "Tablet", "Other"];

function CreateAsset() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    asset_code: "",
    asset_name: "",
    asset_type: "",
    purchase_date: "",
    purchase_cost: "",
    status: "available",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.asset_code) errs.asset_code = "Asset code is required";
    if (!form.asset_name || form.asset_name.length < 2) errs.asset_name = "Name must be at least 2 characters";
    if (!form.asset_type) errs.asset_type = "Asset type is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/assets`, form, { headers: { Authorization: token } });
      setSuccess("Asset created successfully!");
      setTimeout(() => navigate("/assets"), 1200);
    } catch (err) {
      setErrors({ general: err.response?.data?.error || "Failed to create asset" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Add New Asset</h2>
        <p>Register a new asset in the company inventory.</p>
      </div>

      <div className="form-card">
        {success && <div className="alert-success">{success}</div>}
        {errors.general && <div className="alert-error">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Asset Code" id="asset_code" value={form.asset_code} onChange={set("asset_code")} placeholder="e.g. AST-001" required error={errors.asset_code} />
            <FormInput label="Asset Name" id="asset_name" value={form.asset_name} onChange={set("asset_name")} placeholder="e.g. Dell Latitude 5420" required error={errors.asset_name} />
          </div>
          <div className="form-row">
            <FormSelect
              label="Asset Type" id="asset_type" value={form.asset_type} onChange={set("asset_type")}
              options={ASSET_TYPES.map(t => ({ value: t, label: t }))}
              placeholder="Select type…" required error={errors.asset_type}
            />
            <FormSelect
              label="Status" id="status" value={form.status} onChange={set("status")}
              options={["available", "damaged", "lost"].map(s => ({ value: s, label: s }))}
            />
          </div>
          <div className="form-row">
            <FormInput label="Purchase Date" id="purchase_date" type="date" value={form.purchase_date} onChange={set("purchase_date")} />
            <FormInput label="Purchase Cost (₹)" id="purchase_cost" type="number" value={form.purchase_cost} onChange={set("purchase_cost")} placeholder="e.g. 85000" />
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate("/assets")}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Asset</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CreateAsset;
