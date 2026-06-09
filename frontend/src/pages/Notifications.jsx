import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import "../components/Layout.css";
import "./Notifications.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function Notifications() {
  const { token } = useAuth();
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    axios
      .get(`${API}/api/notifications`, { headers: { Authorization: token } })
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [token]);

  const markAllRead = async () => {
    await axios.put(`${API}/api/notifications/read-all`, {}, { headers: { Authorization: token } });
    fetch();
  };

  const markRead = async (id) => {
    await axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/notifications/${id}/read`, {}, { headers: { Authorization: token } });
    fetch();
  };

  return (
    <Layout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Notifications</h2>
          <p>{data.unread_count} unread notification{data.unread_count !== 1 ? "s" : ""}</p>
        </div>
        {data.unread_count > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : data.notifications.length === 0 ? (
        <div className="notif-page-empty">
          <div className="notif-page-empty-icon">🔔</div>
          <div>No notifications yet</div>
          <p>You'll get notified here when assets are assigned or leaves are approved.</p>
        </div>
      ) : (
        <div className="notif-page-list">
          {data.notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-page-item${n.is_read ? "" : " notif-page-item--unread"}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="notif-page-dot-col">
                {!n.is_read && <span className="notif-page-dot" />}
              </div>
              <div className="notif-page-body">
                <div className="notif-page-title">{n.title}</div>
                <div className="notif-page-msg">{n.message}</div>
                <div className="notif-page-time">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Notifications;
