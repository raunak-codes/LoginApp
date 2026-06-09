import "./StatusBadge.css";

function StatusBadge({ status }) {
  const map = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-danger",
    user: "badge-info",
    admin: "badge-accent",
    hr: "badge-success",
    manager: "badge-info",
  };

  return (
    <span className={`badge ${map[status?.toLowerCase()] || "badge-info"}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
