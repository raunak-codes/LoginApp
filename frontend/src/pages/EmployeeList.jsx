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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/api/employees`, {
        headers: { Authorization: token },
      })
      .then((res) => setEmployees(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/employees/${id}`, {
      headers: { Authorization: token },
    });
    setEmployees(employees.filter((e) => e.id !== id));
  };

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
    </Layout>
  );
}

export default EmployeeList;
