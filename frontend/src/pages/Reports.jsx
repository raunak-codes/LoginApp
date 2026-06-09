import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import "../components/Layout.css";
import "./Reports.css";

const REPORTS = [
  {
    id: "employees",
    label: "Employee Report",
    icon: "👥",
    description: "Full list of employees with department, designation, salary, and contact info.",
    endpoint: "/api/dashboard/reports/employees",
    filename: "Employee_Report",
    columns: ["name", "email", "role", "department_name", "designation", "salary", "phone", "created_at"],
  },
  {
    id: "leaves",
    label: "Leave Report",
    icon: "📅",
    description: "All leave applications with employee names, types, dates, and approval status.",
    endpoint: "/api/dashboard/reports/leaves",
    filename: "Leave_Report",
    columns: ["employee_name", "leave_name", "from_date", "to_date", "total_days", "reason", "status", "created_at"],
  },
  {
    id: "assets",
    label: "Asset Report",
    icon: "💻",
    description: "Inventory of all company assets with allocation status and purchase details.",
    endpoint: "/api/dashboard/reports/assets",
    filename: "Asset_Report",
    columns: ["asset_code", "asset_name", "asset_type", "purchase_date", "purchase_cost", "status", "assigned_to"],
  },
];

function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState({});

  const downloadReport = async (report, format) => {
    setLoading((l) => ({ ...l, [`${report.id}-${format}`]: true }));
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${report.endpoint}`, {
        headers: { Authorization: token },
      });

      if (format === "csv" || format === "excel") {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, report.label);
        const ext = format === "csv" ? "csv" : "xlsx";
        const type = format === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        XLSX.writeFile(wb, `${report.filename}_${new Date().toISOString().slice(0, 10)}.${ext}`);
      } else if (format === "pdf") {
        // Print preview with print CSS
        const cols = report.columns;
        const rows = data.map((row) => cols.map((c) => row[c] ?? "").join("\t")).join("\n");
        const header = cols.join("\t");
        const printWin = window.open("", "_blank");
        printWin.document.write(`
          <html><head><title>${report.label}</title>
          <style>
            body { font-family: sans-serif; font-size: 12px; padding: 20px; }
            h2 { margin-bottom: 12px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 11px; }
            th { background: #f0f0f0; font-weight: 600; }
          </style></head>
          <body><h2>${report.label} — ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead><tr>${cols.map((c) => `<th>${c.replace(/_/g, " ").toUpperCase()}</th>`).join("")}</tr></thead>
            <tbody>${data.map((row) => `<tr>${cols.map((c) => `<td>${row[c] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
          </body></html>
        `);
        printWin.document.close();
        printWin.print();
      }
    } catch (err) {
      alert("Failed to generate report: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading((l) => ({ ...l, [`${report.id}-${format}`]: false }));
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Reports</h2>
        <p>Export your ERP data in CSV, Excel, or PDF format.</p>
      </div>

      <div className="reports-grid">
        {REPORTS.map((report) => (
          <div className="report-card" key={report.id}>
            <div className="report-icon">{report.icon}</div>
            <div className="report-info">
              <div className="report-title">{report.label}</div>
              <div className="report-desc">{report.description}</div>
            </div>
            <div className="report-actions">
              <Button
                size="sm"
                variant="secondary"
                loading={loading[`${report.id}-csv`]}
                onClick={() => downloadReport(report, "csv")}
              >
                📄 CSV
              </Button>
              <Button
                size="sm"
                loading={loading[`${report.id}-excel`]}
                onClick={() => downloadReport(report, "excel")}
              >
                📊 Excel
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={loading[`${report.id}-pdf`]}
                onClick={() => downloadReport(report, "pdf")}
              >
                🖨️ PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Reports;
