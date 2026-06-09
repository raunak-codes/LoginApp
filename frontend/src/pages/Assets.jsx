import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import "../components/Layout.css";
import "./Assets.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


const STATUS_OPTS = ["", "available", "allocated", "returned", "damaged", "lost"];

function Assets() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");

  const limit = 10;
  const isAdmin = ["admin", "hr"].includes(user?.role);

  const fetchAssets = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { asset_type: typeFilter }),
      sortBy,
      sortOrder,
    });
    axios
      .get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets?${params}`, { headers: { Authorization: token } })
      .then((r) => { setAssets(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios
      .get(`${API}/api/assets/types`, { headers: { Authorization: token } })
      .then((r) => setTypes(r.data))
      .catch(console.error);
  }, [token]);

  useEffect(() => { fetchAssets(); }, [page, statusFilter, typeFilter, sortBy, sortOrder]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchAssets(); };

  const totalPages = Math.ceil(total / limit);

  const columns = [
    { key: "asset_code", label: "Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "asset_type", label: "Type" },
    { key: "purchase_cost", label: "Cost", render: (v) => v ? `₹${Number(v).toLocaleString()}` : "—" },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "assigned_to", label: "Assigned To", render: (v) => v || "—" },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/assets/${row.id}/history`)}>History</Button>
          {isAdmin && row.status === "available" && (
            <Button size="sm" onClick={() => navigate(`/assets/${row.id}/allocate`)}>Allocate</Button>
          )}
          {isAdmin && row.status === "allocated" && (
            <Button size="sm" variant="danger" onClick={() => handleReturn(row.id)}>Return</Button>
          )}
        </div>
      ),
    },
  ];

  const handleReturn = async (id) => {
    if (!window.confirm("Mark this asset as returned?")) return;
    await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets/${id}/return`, { remarks: "Returned via dashboard" }, { headers: { Authorization: token } });
    fetchAssets();
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Asset Management</h2>
        <p>Track all company assets — laptops, monitors, licenses, and more.</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="assets-toolbar">
        <form onSubmit={handleSearch} className="assets-search">
          <input
            className="assets-search-input"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" size="sm">Search</Button>
        </form>

        <div className="assets-filters">
          <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUS_OPTS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={`${sortBy}:${sortOrder}`} onChange={(e) => { const [s, o] = e.target.value.split(":"); setSortBy(s); setSortOrder(o); }}>
            <option value="id:DESC">Newest First</option>
            <option value="asset_name:ASC">Name A-Z</option>
            <option value="purchase_cost:DESC">Highest Cost</option>
            <option value="status:ASC">Status</option>
          </select>
        </div>

        {isAdmin && <Button onClick={() => navigate("/assets/create")}>+ New Asset</Button>}
      </div>

      {/* ── Table ── */}
      <FormTable columns={columns} data={assets} loading={loading} emptyMessage="No assets found" />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="pagination-info">Page {page} of {totalPages} ({total} total)</span>
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </Layout>
  );
}

export default Assets;
