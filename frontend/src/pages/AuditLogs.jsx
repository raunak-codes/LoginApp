import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import "../components/Layout.css";
import "./Assets.css";

const ACTION_COLORS = {
  INSERT: "var(--success)",
  UPDATE: "var(--warning)",
  DELETE: "var(--danger)",
};

function AuditLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const limit = 20;

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit, ...(tableFilter && { table_name: tableFilter }), ...(actionFilter && { action_type: actionFilter }) });
    axios
      .get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/audit-logs?${params}`, { headers: { Authorization: token } })
      .then((r) => { setLogs(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page, tableFilter, actionFilter]);

  const totalPages = Math.ceil(total / limit);

  const columns = [
    { key: "id", label: "#", width: "50px" },
    { key: "table_name", label: "Table" },
    {
      key: "action_type", label: "Action",
      render: (v) => <span style={{ color: ACTION_COLORS[v] || "var(--text)", fontWeight: 600 }}>{v}</span>
    },
    { key: "record_id", label: "Record ID" },
    {
      key: "old_data", label: "Old Value",
      render: (v) => v ? <pre className="audit-json">{JSON.stringify(v, null, 2)}</pre> : "—"
    },
    {
      key: "new_data", label: "New Value",
      render: (v) => v ? <pre className="audit-json">{JSON.stringify(v, null, 2)}</pre> : "—"
    },
    { key: "performed_by_name", label: "By" },
    { key: "created_at", label: "When", render: (v) => new Date(v).toLocaleString() },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>Audit Trail</h2>
        <p>Every data change is recorded here with old and new values (JSONB).</p>
      </div>

      <div className="assets-toolbar">
        <select className="filter-select" value={tableFilter} onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}>
          <option value="">All Tables</option>
          <option value="assets">assets</option>
          <option value="asset_allocations">asset_allocations</option>
          <option value="employee_profiles">employee_profiles</option>
          <option value="leave_applications">leave_applications</option>
        </select>
        <select className="filter-select" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{total} total records</span>
      </div>

      <FormTable columns={columns} data={logs} loading={loading} emptyMessage="No audit logs found" />

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </Layout>
  );
}

export default AuditLogs;
