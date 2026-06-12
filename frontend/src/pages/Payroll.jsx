import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { CreditCard, Edit2, Check, X, ShieldAlert } from "lucide-react";
import "../components/Layout.css";
import "./Payroll.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper function to compute standard Indian wage deductions and benefits
function calculateDeductions(basicVal, hraVal, ltaVal, allowancesVal) {
  const basic = parseFloat(basicVal || 0.00);
  const hra = parseFloat(hraVal || 0.00);
  const lta = parseFloat(ltaVal || 0.00);
  const allowances = parseFloat(allowancesVal || 0.00);

  const gross = basic + hra + lta + allowances;
  
  // 1. PF (Employee & Employer) = 12% of Basic
  const pf = Math.round(basic * 0.12 * 100) / 100;
  const employer_pf = pf;
  
  // 2. Gratuity = 4.81% of Basic
  const gratuity = Math.round(basic * 0.0481 * 100) / 100;
  
  // 3. Professional Tax (PT)
  const pt = gross > 15000.00 ? 200.00 : 0.00;
  
  // 4. TDS (Income Tax under standard slabs with rebate for gross <= 7,00,000 annual)
  const annual = gross * 12;
  let annualTax = 0;
  if (annual > 700000.00) {
    if (annual > 1500000.00) {
      annualTax = (annual - 1500000.00) * 0.30 + 140000.00;
    } else if (annual > 1200000.00) {
      annualTax = (annual - 1200000.00) * 0.20 + 80000.00;
    } else if (annual > 1000000.00) {
      annualTax = (annual - 1000000.00) * 0.15 + 50000.00;
    } else {
      annualTax = (annual - 700000.00) * 0.10 + 20000.00;
    }
  }
  const tds = Math.round((annualTax / 12) * 100) / 100;

  return {
    gross,
    pf,
    employer_pf,
    gratuity,
    pt,
    tds,
    ctc: gross + employer_pf + gratuity,
    net: gross - (pf + tds + pt)
  };
}

function Payroll() {
  const { token, user } = useAuth();
  const isAdmin = ["admin", "hr"].includes(user?.role);

  // States
  const [employees, setEmployees] = useState([]);
  const [mySalary, setMySalary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    basic: 0,
    hra: 0,
    lta: 0,
    allowances: 0,
    employer_pf: 0,
    gratuity: 0,
    pf: 0,
    tds: 0,
    pt: 0
  });

  // Live computed values during edit
  const computedGross = parseFloat(form.basic || 0) + parseFloat(form.hra || 0) + parseFloat(form.lta || 0) + parseFloat(form.allowances || 0);
  const computedCTC = computedGross + parseFloat(form.employer_pf || 0) + parseFloat(form.gratuity || 0);
  const computedNet = computedGross - (parseFloat(form.pf || 0) + parseFloat(form.tds || 0) + parseFloat(form.pt || 0));

  // Fetch employees salaries list (Admin/HR only)
  const fetchEmployeesSalaries = async () => {
    try {
      const res = await axios.get(`${API}/api/payroll/employees`, {
        headers: { Authorization: token }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch logged-in user's salary card details
  const fetchMySalary = async () => {
    try {
      const res = await axios.get(`${API}/api/payroll/my-salary`, {
        headers: { Authorization: token }
      });
      setMySalary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initData = async () => {
    setLoading(true);
    if (isAdmin) {
      await fetchEmployeesSalaries();
    } else {
      await fetchMySalary();
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [token]);

  // Handle click on employee row
  const handleOpenEmp = async (emp) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/payroll/employees/${emp.employee_id}`, {
        headers: { Authorization: token }
      });
      setSelectedEmp(res.data);
      setForm({
        basic: res.data.basic,
        hra: res.data.hra,
        lta: res.data.lta,
        allowances: res.data.allowances,
        employer_pf: res.data.employer_pf,
        gratuity: res.data.gratuity,
        pf: res.data.pf,
        tds: res.data.tds,
        pt: res.data.pt
      });
      setIsEditing(false);
      setShowModal(true);
    } catch (err) {
      alert("Failed to load employee salary details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = parseFloat(e.target.value) || 0;
    const updatedForm = { ...form, [name]: value };

    // Calculate dynamic values
    const calcs = calculateDeductions(
      updatedForm.basic,
      updatedForm.hra,
      updatedForm.lta,
      updatedForm.allowances
    );

    setForm({
      ...updatedForm,
      pf: calcs.pf,
      employer_pf: calcs.employer_pf,
      gratuity: calcs.gratuity,
      pt: calcs.pt,
      tds: calcs.tds
    });
  };


  const handleSaveSalary = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API}/api/payroll/employees/${selectedEmp.employee_id}`,
        form,
        { headers: { Authorization: token } }
      );
      alert("Salary components updated successfully.");
      setShowModal(false);
      setIsEditing(false);
      await fetchEmployeesSalaries();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update salary.");
    } finally {
      setLoading(false);
    }
  };

  // Grid columns
  const columns = [
    { key: "name", label: "Employee Name" },
    { key: "designation", label: "Designation" },
    {
      key: "ctc",
      label: "CTC (Annualized)",
      render: (val) => `₹${(parseFloat(val) * 12).toLocaleString([], { maximumFractionDigits: 0 })}`
    },
    {
      key: "gross",
      label: "Monthly Gross",
      render: (val) => `₹${parseFloat(val).toLocaleString([], { maximumFractionDigits: 2 })}`
    },
    {
      key: "net",
      label: "Monthly Net",
      render: (val) => `₹${parseFloat(val).toLocaleString([], { maximumFractionDigits: 2 })}`
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button size="sm" onClick={() => handleOpenEmp(row)}>
          View Breakdown
        </Button>
      )
    }
  ];

  return (
    <Layout>
      <div className="page-header">
        <h2>Payroll & Salaries</h2>
        <p>Manage structured compensations, employee pay components, deductions, and tax withholdings.</p>
      </div>

      <div className="payroll-container">
        {isAdmin ? (
          <div>
            <div style={{ marginBottom: "16px", fontWeight: "600", fontSize: "14.5px" }}>Employee Wage Ledger</div>
            <FormTable
              columns={columns}
              data={employees}
              loading={loading}
              emptyMessage="No employee salary templates found."
            />
          </div>
        ) : (
          /* Employee self-service card details */
          mySalary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="salary-overview">
                <div className="overview-card ctc">
                  <div className="overview-card-title">Cost to Company (Annual)</div>
                  <div className="overview-card-value">₹{(mySalary.ctc * 12).toLocaleString([], { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="overview-card gross">
                  <div className="overview-card-title">Monthly Gross Earnings</div>
                  <div className="overview-card-value">₹{mySalary.gross.toLocaleString([], { maximumFractionDigits: 2 })}</div>
                </div>
                <div className="overview-card net">
                  <div className="overview-card-title">Monthly Net Take-Home</div>
                  <div className="overview-card-value">₹{mySalary.net.toLocaleString([], { maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div style={{ fontWeight: "700", fontSize: "16px", marginTop: "12px" }}>Salary Component Breakdown</div>
              <div className="salary-breakdown-grid">
                <div className="breakdown-section">
                  <div className="breakdown-section-title">Earnings (Monthly)</div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Basic Salary:</span>
                    <span className="breakdown-value">₹{mySalary.basic.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">HRA Allowance:</span>
                    <span className="breakdown-value">₹{mySalary.hra.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">LTA Allowance:</span>
                    <span className="breakdown-value">₹{mySalary.lta.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Other Allowances:</span>
                    <span className="breakdown-value">₹{mySalary.allowances.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span className="breakdown-label">Total Monthly Gross:</span>
                    <span className="breakdown-value">₹{mySalary.gross.toLocaleString()}</span>
                  </div>
                </div>

                <div className="breakdown-section">
                  <div className="breakdown-section-title">Deductions & Benefits</div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Provident Fund (PF):</span>
                    <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{mySalary.pf.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Income Tax (TDS):</span>
                    <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{mySalary.tds.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span className="breakdown-label">Professional Tax (PT):</span>
                    <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{mySalary.pt.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span className="breakdown-label">Total Deductions:</span>
                    <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{(mySalary.pf + mySalary.tds + mySalary.pt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No salary slip found. Please contact HR.
            </div>
          )
        )}
      </div>

      {/* Admin Salary Breakdown Modal */}
      {showModal && selectedEmp && (
        <Modal
          title={`Salary Details: ${selectedEmp.name}`}
          size="lg"
          onClose={() => {
            setShowModal(false);
            setIsEditing(false);
          }}
        >

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* View / Edit sections */}
            <div className="salary-breakdown-grid" style={{ marginBottom: "0px" }}>
              {/* Earnings column */}
              <div className="breakdown-section">
                <div className="breakdown-section-title">Earnings (Monthly)</div>
                {isEditing ? (
                  <>
                    <div className="breakdown-input-group">
                      <label>Basic Salary</label>
                      <input type="number" name="basic" value={form.basic} onChange={handleInputChange} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>HRA Allowance</label>
                      <input type="number" name="hra" value={form.hra} onChange={handleInputChange} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>LTA Allowance</label>
                      <input type="number" name="lta" value={form.lta} onChange={handleInputChange} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>Other Allowances</label>
                      <input type="number" name="allowances" value={form.allowances} onChange={handleInputChange} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Basic Salary:</span>
                      <span className="breakdown-value">₹{selectedEmp.basic.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">HRA Allowance:</span>
                      <span className="breakdown-value">₹{selectedEmp.hra.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">LTA Allowance:</span>
                      <span className="breakdown-value">₹{selectedEmp.lta.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Other Allowances:</span>
                      <span className="breakdown-value">₹{selectedEmp.allowances.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="breakdown-row total">
                  <span className="breakdown-label">Computed Gross:</span>
                  <span className="breakdown-value">₹{(isEditing ? computedGross : selectedEmp.gross).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="breakdown-section">
                <div className="breakdown-section-title">Deductions (Monthly)</div>
                {isEditing ? (
                  <>
                    <div className="breakdown-input-group">
                      <label>Employee PF Contribution</label>
                      <input type="number" name="pf" value={form.pf} disabled style={{ background: "var(--surface)", cursor: "not-allowed", opacity: 0.7 }} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>Income Tax (TDS)</label>
                      <input type="number" name="tds" value={form.tds} disabled style={{ background: "var(--surface)", cursor: "not-allowed", opacity: 0.7 }} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>Professional Tax (PT)</label>
                      <input type="number" name="pt" value={form.pt} disabled style={{ background: "var(--surface)", cursor: "not-allowed", opacity: 0.7 }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Provident Fund (PF):</span>
                      <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{selectedEmp.pf.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Income Tax (TDS):</span>
                      <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{selectedEmp.tds.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Professional Tax (PT):</span>
                      <span className="breakdown-value" style={{ color: "var(--danger)" }}>- ₹{selectedEmp.pt.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="breakdown-row total">
                  <span className="breakdown-label">Computed Net (Take-Home):</span>
                  <span className="breakdown-value" style={{ color: "var(--success)" }}>₹{(isEditing ? computedNet : selectedEmp.net).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Employer Contributions section */}
            <div className="breakdown-section" style={{ background: "rgba(79, 70, 229, 0.05)" }}>
              <div className="breakdown-section-title" style={{ borderColor: "rgba(79, 70, 229, 0.15)" }}>Employer Yearly Benefits (CTC components)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {isEditing ? (
                  <>
                    <div className="breakdown-input-group">
                      <label>Employer PF share</label>
                      <input type="number" name="employer_pf" value={form.employer_pf} disabled style={{ background: "var(--surface)", cursor: "not-allowed", opacity: 0.7 }} />
                    </div>
                    <div className="breakdown-input-group">
                      <label>Gratuity Provisions</label>
                      <input type="number" name="gratuity" value={form.gratuity} disabled style={{ background: "var(--surface)", cursor: "not-allowed", opacity: 0.7 }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Employer PF Contribution:</span>
                      <span className="breakdown-value">₹{selectedEmp.employer_pf.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Gratuity Provision:</span>
                      <span className="breakdown-value">₹{selectedEmp.gratuity.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="breakdown-row total" style={{ marginTop: "12px", paddingTop: "12px" }}>
                <span className="breakdown-label">Computed Cost to Company (CTC Monthly):</span>
                <span className="breakdown-value" style={{ color: "var(--accent)" }}>₹{(isEditing ? computedCTC : selectedEmp.ctc).toLocaleString()}</span>
              </div>
            </div>

            {isEditing && (
              <p className="auto-calc-info">
                ℹ️ Deductions (PF, TDS, PT) and Employer benefits are automatically calculated based on earnings standard rates (PF: 12% of Basic, Gratuity: 4.81% of Basic, PT: ₹200 if Gross &gt; ₹15,000, TDS: standard slab tax rates).
              </p>
            )}


            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(false)} style={{ display: "flex", gap: "6px" }} disabled={loading}>
                    <X size={15} /> Cancel
                  </Button>
                  <Button onClick={handleSaveSalary} style={{ display: "flex", gap: "6px" }} disabled={loading}>
                    <Check size={15} /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                  <Button onClick={() => setIsEditing(true)} style={{ display: "flex", gap: "6px" }}>
                    <Edit2 size={15} /> Edit Wage Structure
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

export default Payroll;
