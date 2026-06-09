import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import "../components/Layout.css";
import "./AssetHistory.css";

const ACTION_ICONS = {
  allocated: "📤",
  returned:  "📥",
  created:   "✨",
  updated:   "✏️",
  damaged:   "⚠️",
  lost:      "❌",
};

function AssetHistory() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets/${id}`, { headers: { Authorization: token } }),
      axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/assets/${id}/history`, { headers: { Authorization: token } }),
    ])
      .then(([a, h]) => { setAsset(a.data); setHistory(h.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token]);

  return (
    <Layout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Asset History</h2>
          {asset && <p>{asset.asset_name} ({asset.asset_code})</p>}
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/assets")}>← Back to Assets</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : history.length === 0 ? (
        <div className="history-empty">No history recorded for this asset yet.</div>
      ) : (
        <div className="history-timeline">
          {history.map((h, idx) => (
            <div className="history-item" key={h.id}>
              <div className="history-icon">{ACTION_ICONS[h.action] || "📋"}</div>
              <div className="history-line" />
              <div className="history-content">
                <div className="history-action">{h.action}</div>
                {h.remarks && <div className="history-remarks">"{h.remarks}"</div>}
                <div className="history-meta">
                  By <strong>{h.performed_by_name || "System"}</strong> ·{" "}
                  {new Date(h.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default AssetHistory;
