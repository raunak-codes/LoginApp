const pool = require("../config/db");
const logger = require("../utils/logger");

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
    basic,
    hra,
    lta,
    allowances,
    pf,
    employer_pf,
    gratuity,
    pt,
    tds
  };
}

const payrollController = {
  // List all employees with their salaries (Admin/HR only)
  listEmployeesWithSalary: async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT u.id AS employee_id, u.name, u.email, ep.designation, ep.salary AS base_salary,
                COALESCE(s.basic, 0.00) AS basic, 
                COALESCE(s.hra, 0.00) AS hra, 
                COALESCE(s.lta, 0.00) AS lta, 
                COALESCE(s.allowances, 0.00) AS allowances, 
                COALESCE(s.employer_pf, 0.00) AS employer_pf, 
                COALESCE(s.gratuity, 0.00) AS gratuity, 
                COALESCE(s.pf, 0.00) AS pf, 
                COALESCE(s.tds, 0.00) AS tds, 
                COALESCE(s.pt, 0.00) AS pt
         FROM users u
         JOIN employee_profiles ep ON u.id = ep.user_id
         LEFT JOIN salaries s ON u.id = s.employee_id
         WHERE u.role != 'admin'
         ORDER BY u.name ASC`
      );

      // Compute aggregates on the fly
      const processed = result.rows.map((row) => {
        const basic = parseFloat(row.basic);
        const hra = parseFloat(row.hra);
        const lta = parseFloat(row.lta);
        const allowances = parseFloat(row.allowances);
        const employer_pf = parseFloat(row.employer_pf);
        const gratuity = parseFloat(row.gratuity);
        const pf = parseFloat(row.pf);
        const tds = parseFloat(row.tds);
        const pt = parseFloat(row.pt);

        const gross = basic + hra + lta + allowances;
        const ctc = gross + employer_pf + gratuity;
        const net = gross - (pf + tds + pt);

        return {
          ...row,
          gross,
          ctc,
          net
        };
      });

      res.json(processed);
    } catch (err) {
      next(err);
    }
  },

  // Get single employee breakdown
  getSalaryDetail: async (req, res, next) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      
      // Verification: Check if caller is Admin/HR OR is looking at their own profile
      if (req.user.role !== "admin" && req.user.role !== "hr" && req.user.id !== employeeId) {
        return res.status(403).json({ message: "Access denied — insufficient permissions" });
      }

      const result = await pool.query(
        `SELECT u.id AS employee_id, u.name, u.email, ep.designation,
                COALESCE(s.basic, 0.00) AS basic, 
                COALESCE(s.hra, 0.00) AS hra, 
                COALESCE(s.lta, 0.00) AS lta, 
                COALESCE(s.allowances, 0.00) AS allowances, 
                COALESCE(s.employer_pf, 0.00) AS employer_pf, 
                COALESCE(s.gratuity, 0.00) AS gratuity, 
                COALESCE(s.pf, 0.00) AS pf, 
                COALESCE(s.tds, 0.00) AS tds, 
                COALESCE(s.pt, 0.00) AS pt
         FROM users u
         JOIN employee_profiles ep ON u.id = ep.user_id
         LEFT JOIN salaries s ON u.id = s.employee_id
         WHERE u.id = $1`,
        [employeeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employee profile not found." });
      }

      const row = result.rows[0];
      const basic = parseFloat(row.basic);
      const hra = parseFloat(row.hra);
      const lta = parseFloat(row.lta);
      const allowances = parseFloat(row.allowances);
      const employer_pf = parseFloat(row.employer_pf);
      const gratuity = parseFloat(row.gratuity);
      const pf = parseFloat(row.pf);
      const tds = parseFloat(row.tds);
      const pt = parseFloat(row.pt);

      const gross = basic + hra + lta + allowances;
      const ctc = gross + employer_pf + gratuity;
      const net = gross - (pf + tds + pt);

      res.json({
        ...row,
        basic,
        hra,
        lta,
        allowances,
        employer_pf,
        gratuity,
        pf,
        tds,
        pt,
        gross,
        ctc,
        net
      });
    } catch (err) {
      next(err);
    }
  },

  // Save or Update salary components (Admin/HR only)
  updateSalary: async (req, res, next) => {
    try {
      const employeeId = parseInt(req.params.employee_id);
      const { basic, hra, lta, allowances } = req.body;

      // Automatically calculate deductions and employer components
      const calculated = calculateDeductions(basic, hra, lta, allowances);

      const result = await pool.query(
        `INSERT INTO salaries (employee_id, basic, hra, lta, allowances, employer_pf, gratuity, pf, tds, pt, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT (employee_id) DO UPDATE SET
           basic = EXCLUDED.basic,
           hra = EXCLUDED.hra,
           lta = EXCLUDED.lta,
           allowances = EXCLUDED.allowances,
           employer_pf = EXCLUDED.employer_pf,
           gratuity = EXCLUDED.gratuity,
           pf = EXCLUDED.pf,
           tds = EXCLUDED.tds,
           pt = EXCLUDED.pt,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          employeeId,
          calculated.basic,
          calculated.hra,
          calculated.lta,
          calculated.allowances,
          calculated.employer_pf,
          calculated.gratuity,
          calculated.pf,
          calculated.tds,
          calculated.pt
        ]
      );


      logger.info(`Salary components updated for user ${employeeId} by Admin/HR`);
      res.json({ message: "Salary updated successfully.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // Get logged-in employee's own salary breakdown
  getMySalary: async (req, res, next) => {
    try {
      req.params.employee_id = req.user.id;
      return payrollController.getSalaryDetail(req, res, next);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = payrollController;
