import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";

function MyLeaves() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/leave/my", {
        headers: { Authorization: token },
      })
      .then((r) => setLeaves(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const columns = [
    { key: "leave_name",  label: "Leave Type" },
    { key: "from_date",   label: "From",   render: (v) => new Date(v).toLocaleDateString() },
    { key: "to_date",     label: "To",     render: (v) => new Date(v).toLocaleDateString() },
    { key: "total_days",  label: "Days" },
    { key: "reason",      label: "Reason" },
    { key: "status",      label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>My Leave History</h2>
        <p>All leave applications you have submitted</p>
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? <Loader /> : <Table columns={columns} data={leaves} />}
      </Card>
    </Layout>
  );
}

export default MyLeaves;
