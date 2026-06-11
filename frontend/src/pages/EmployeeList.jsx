import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Card from "../components/Card";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";


function EmployeeList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchEmployees = () => {
    setLoading(true);
    axios
      .get(`${API}/api/employees?page=${page}&limit=${limit}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setEmployees(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, [token, page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/employees/${id}`, {
        headers: { Authorization: token },
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete employee");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const columns = [
    { key: "name",            label: "Name" },
    { key: "email",           label: "Email" },
    { key: "department_name", label: "Department" },
    { key: "designation",     label: "Designation" },
    { key: "phone",           label: "Phone" },
    { key: "salary",          label: "Salary", render: (v) => v ? `₹${Number(v).toLocaleString()}` : "—" },
  ];

  return (
    <Layout>
      <div className="page-actions">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Employees</h2>
          <p>All registered employee profiles</p>
        </div>
        <Button onClick={() => navigate("/employees/create")}>
          + Add Employee
        </Button>
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={employees}
            actions={(row) => (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/employees/edit/${row.id}`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </Button>
              </>
            )}
          />
        )}
      </Card>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </Layout>
  );
}

export default EmployeeList;
