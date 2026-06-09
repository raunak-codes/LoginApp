import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function NotificationBell() {
  const { token } = useAuth();
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    if (!token) return;
    axios
      .get(`${API}/api/notifications`, { headers: { Authorization: token } })
      .then((r) => setData(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await axios.put(`${API}/api/notifications/read-all`, {}, { headers: { Authorization: token } });
    fetchNotifications();
  };

  const markRead = async (id) => {
    await axios.put(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/notifications/${id}/read`, {}, { headers: { Authorization: token } });
    fetchNotifications();
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <span className="notif-icon">🔔</span>
        {data.unread_count > 0 && (
          <span className="notif-badge">{data.unread_count > 9 ? "9+" : data.unread_count}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {data.unread_count > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-list">
            {data.notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              data.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item${n.is_read ? "" : " notif-item--unread"}`}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  {!n.is_read && <span className="notif-dot" />}
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
