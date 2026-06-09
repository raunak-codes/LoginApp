-- ============================================================
-- PeopleDesk ERP — Migration: Add New Enterprise Tables
-- Run this if you already have the existing loginapp database
-- ============================================================

-- Asset Master
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100),
    purchase_date DATE,
    purchase_cost NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Allocations
CREATE TABLE IF NOT EXISTS asset_allocations (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    employee_id INT REFERENCES users(id),
    allocated_by INT REFERENCES users(id),
    allocated_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'active'
);

-- Asset History
CREATE TABLE IF NOT EXISTS asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    action VARCHAR(100),
    remarks TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs (JSONB)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    action_type VARCHAR(50),
    record_id INT,
    old_data JSONB,
    new_data JSONB,
    performed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- View: Employee Summary
CREATE OR REPLACE VIEW employee_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    d.department_name,
    ep.designation,
    ep.salary,
    ep.phone,
    ep.created_at AS joined_at
FROM users u
JOIN employee_profiles ep ON u.id = ep.user_id
JOIN departments d ON d.id = ep.department_id;

-- View: Monthly Hiring Trend
CREATE OR REPLACE VIEW monthly_hiring_trend AS
SELECT
    TO_CHAR(created_at, 'YYYY-MM') AS month,
    COUNT(*) AS new_hires
FROM employee_profiles
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month;

-- View: Department Wise Employee Count
CREATE OR REPLACE VIEW dept_employee_count AS
SELECT
    d.department_name,
    COUNT(ep.id) AS employee_count
FROM departments d
LEFT JOIN employee_profiles ep ON ep.department_id = d.id
GROUP BY d.department_name;

-- Stored Procedure: Calculate Leave Balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(
    p_employee_id INT,
    p_leave_type_id INT
)
RETURNS INT AS $$
DECLARE
    v_total_days INT;
    v_used_days INT;
    v_balance INT;
BEGIN
    SELECT total_days INTO v_total_days
    FROM leave_types WHERE id = p_leave_type_id;

    SELECT COALESCE(SUM(total_days), 0) INTO v_used_days
    FROM leave_applications
    WHERE employee_id = p_employee_id
      AND leave_type_id = p_leave_type_id
      AND status = 'approved';

    v_balance := v_total_days - v_used_days;
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Sample seed data for assets
INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status)
VALUES
  ('AST-001', 'Dell Latitude 5420', 'Laptop', '2024-01-15', 85000.00, 'available'),
  ('AST-002', 'Logitech MX Master 3', 'Mouse', '2024-01-15', 5500.00, 'available'),
  ('AST-003', 'Dell 27" Monitor P2722H', 'Monitor', '2024-02-01', 22000.00, 'available'),
  ('AST-004', 'HID Access Card - 001', 'Access Card', '2024-01-01', 500.00, 'available'),
  ('AST-005', 'Microsoft Office 365', 'Software License', '2024-01-01', 12000.00, 'available')
ON CONFLICT (asset_code) DO NOTHING;
