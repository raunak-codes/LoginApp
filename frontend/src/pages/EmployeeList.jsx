import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees", {
        headers: { Authorization: token },
      })
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/employees/${id}`, {
      headers: { Authorization: token },
    });
    setEmployees(employees.filter((e) => e.id !== id));
  };

  return (
    <div>
      <h2>Employee List</h2>
      <button onClick={() => navigate("/employees/create")}>
        Add Employee
      </button>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department_name}</td>
              <td>{emp.designation}</td>
              <td>{emp.phone}</td>
              <td>{emp.salary}</td>
              <td>
                <button onClick={() => navigate(`/employees/edit/${emp.id}`)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;