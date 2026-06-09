
-- ============================================================
-- PeopleDesk ERP — Full Schema
-- ============================================================

-- 1. Create database
CREATE DATABASE loginapp;

-- 2. Connect to it: \c loginapp

-- 3. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    verified BOOLEAN DEFAULT FALSE
);

-- 4. Create password_reset table
CREATE TABLE password_reset (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT,
    expires_at TIMESTAMP
);

-- 5. Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT
);

-- 6. Create departments table
CREATE TABLE departments (
	id SERIAL PRIMARY KEY,
	department_name VARCHAR(100)
);

INSERT INTO departments(department_name) VALUES ('IT'),('HR'),('Finance'),('Marketing');

-- 7. Create employee_profiles table
CREATE TABLE employee_profiles (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id),
	department_id INT REFERENCES departments(id),
	phone VARCHAR(20),
	address TEXT,
	designation VARCHAR(100),
	salary NUMERIC(10,2),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Employee Images
CREATE TABLE employee_images (
	id SERIAL PRIMARY KEY,
	employee_id INT REFERENCES employee_profiles(id),
	image_url TEXT
);

-- 9. Create skills table
CREATE TABLE skills(
	id SERIAL PRIMARY KEY,
	skill_name VARCHAR(100)
);

INSERT INTO skills(skill_name) VALUES ('React'),('NodeJS'),('PostgreSQL'),('Python'),('Java');

-- 10. Create employee_skills (many-to-many)
CREATE TABLE employee_skills (
	id SERIAL PRIMARY KEY,
	employee_id INT REFERENCES employee_profiles(id),
	skill_id INT REFERENCES skills(id)
);

-- 11. Leave Types
CREATE TABLE leave_types (
    id SERIAL PRIMARY KEY,
    leave_name VARCHAR(100),
    total_days INT
);

INSERT INTO leave_types(leave_name, total_days) VALUES
    ('Casual Leave', 12),
    ('Sick Leave', 10),
    ('Earned Leave', 15),
    ('Maternity Leave', 180);

-- 12. Leave Balance
CREATE TABLE leave_balance (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id),
    leave_type_id INT REFERENCES leave_types(id),
    available_days INT
);

-- 13. Leave Applications
CREATE TABLE leave_applications (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES users(id),
    leave_type_id INT REFERENCES leave_types(id),
    from_date DATE,
    to_date DATE,
    total_days INT,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Approval History
CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    leave_id INT REFERENCES leave_applications(id),
    approved_by INT REFERENCES users(id),
    action VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NEW: Asset Management Tables
-- ============================================================

-- 15. Asset Master
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100),
    purchase_date DATE,
    purchase_cost NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status values: available | allocated | returned | damaged | lost

-- 16. Asset Allocations
CREATE TABLE asset_allocations (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    employee_id INT REFERENCES users(id),
    allocated_by INT REFERENCES users(id),
    allocated_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'active'
);

-- 17. Asset History (audit trail for assets)
CREATE TABLE asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    action VARCHAR(100),
    remarks TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NEW: Notification Engine
-- ============================================================

-- 18. Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NEW: Audit Trail (JSONB)
-- ============================================================

-- 19. Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    action_type VARCHAR(50),
    record_id INT,
    old_data JSONB,
    new_data JSONB,
    performed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PostgreSQL VIEW: Employee Summary
-- ============================================================

CREATE VIEW employee_summary AS
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

-- ============================================================
-- PostgreSQL STORED PROCEDURE: Calculate Leave Balance
-- ============================================================

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
    -- Get total days for the leave type
    SELECT total_days INTO v_total_days
    FROM leave_types
    WHERE id = p_leave_type_id;

    -- Get used days (approved leaves)
    SELECT COALESCE(SUM(total_days), 0) INTO v_used_days
    FROM leave_applications
    WHERE employee_id = p_employee_id
      AND leave_type_id = p_leave_type_id
      AND status = 'approved';

    v_balance := v_total_days - v_used_days;
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT calculate_leave_balance(1, 1);

-- ============================================================
-- Monthly Hiring Trend View (for Dashboard Chart)
-- ============================================================

CREATE VIEW monthly_hiring_trend AS
SELECT
    TO_CHAR(created_at, 'YYYY-MM') AS month,
    COUNT(*) AS new_hires
FROM employee_profiles
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month;

-- ============================================================
-- Department Wise Employee Count View
-- ============================================================

CREATE VIEW dept_employee_count AS
SELECT
    d.department_name,
    COUNT(ep.id) AS employee_count
FROM departments d
LEFT JOIN employee_profiles ep ON ep.department_id = d.id
GROUP BY d.department_name;