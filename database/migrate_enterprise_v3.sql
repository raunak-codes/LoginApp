-- ============================================================
-- PeopleDesk ERP — Migration V3: Attendance, Payroll, Expenses, & Asset Requests
-- ============================================================

-- 1. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id) ON DELETE CASCADE,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    status VARCHAR(50) DEFAULT 'present', -- present | late | absent
    is_late BOOLEAN DEFAULT FALSE,
    created_at DATE DEFAULT CURRENT_DATE,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, created_at)
);

-- 2. Salaries Table
CREATE TABLE IF NOT EXISTS salaries (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    basic NUMERIC(12,2) DEFAULT 0.00,
    hra NUMERIC(12,2) DEFAULT 0.00,
    lta NUMERIC(12,2) DEFAULT 0.00,
    allowances NUMERIC(12,2) DEFAULT 0.00,
    employer_pf NUMERIC(12,2) DEFAULT 0.00,
    gratuity NUMERIC(12,2) DEFAULT 0.00,
    pf NUMERIC(12,2) DEFAULT 0.00,  -- employee PF deduction
    tds NUMERIC(12,2) DEFAULT 0.00, -- tax deduction
    pt NUMERIC(12,2) DEFAULT 0.00,  -- professional tax
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Expense Claims Table
CREATE TABLE IF NOT EXISTS expense_claims (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- travel | hardware | meals | other
    description TEXT,
    receipt_url TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- pending | approved | rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Asset Requests Table
CREATE TABLE IF NOT EXISTS asset_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- pending | approved | rejected
    allocated_asset_id INT REFERENCES assets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed default salaries for existing employee profiles
WITH initial_components AS (
    SELECT 
        user_id,
        COALESCE(salary * 0.50, 25000.00) AS basic,
        COALESCE(salary * 0.20, 10000.00) AS hra,
        COALESCE(salary * 0.10, 5000.00) AS lta,
        COALESCE(salary * 0.20, 10000.00) AS allowances
    FROM employee_profiles
)
INSERT INTO salaries (employee_id, basic, hra, lta, allowances, employer_pf, gratuity, pf, tds, pt)
SELECT 
    user_id,
    basic,
    hra,
    lta,
    allowances,
    ROUND(basic * 0.12, 2) AS employer_pf,
    ROUND(basic * 0.0481, 2) AS gratuity,
    ROUND(basic * 0.12, 2) AS pf,
    ROUND(
        (CASE 
            WHEN (basic + hra + lta + allowances) * 12 <= 700000.00 THEN 0.00
            WHEN (basic + hra + lta + allowances) * 12 <= 1000000.00 THEN ((basic + hra + lta + allowances) * 12 - 700000.00) * 0.10 + 20000.00
            WHEN (basic + hra + lta + allowances) * 12 <= 1200000.00 THEN ((basic + hra + lta + allowances) * 12 - 1000000.00) * 0.15 + 50000.00
            WHEN (basic + hra + lta + allowances) * 12 <= 1500000.00 THEN ((basic + hra + lta + allowances) * 12 - 1200000.00) * 0.20 + 80000.00
            ELSE ((basic + hra + lta + allowances) * 12 - 1500000.00) * 0.30 + 140000.00
        END) / 12, 
        2
    ) AS tds,
    CASE WHEN (basic + hra + lta + allowances) > 15000.00 THEN 200.00 ELSE 0.00 END AS pt
FROM initial_components
ON CONFLICT (employee_id) DO NOTHING;

