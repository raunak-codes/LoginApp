-- ============================================================
-- PeopleDesk ERP — Migration: Add Database Views & Indexes
-- Run this to update schema for Module 14 and Module 15
-- ============================================================

-- 1. Database Indexes for Query Optimization (Module 14)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_department_id ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_asset_id ON asset_allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_employee_id ON asset_allocations(employee_id);

-- 2. Database Views (Module 15)

-- View 1: employee_dashboard_view
CREATE OR REPLACE VIEW employee_dashboard_view AS
SELECT 
    ep.id AS employee_profile_id,
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    d.department_name,
    ep.phone,
    ep.designation,
    ep.salary,
    ep.created_at AS joined_at
FROM employee_profiles ep
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN departments d ON ep.department_id = d.id;

-- View 2: leave_summary_view
CREATE OR REPLACE VIEW leave_summary_view AS
SELECT
    la.id AS leave_application_id,
    la.employee_id,
    u.name AS employee_name,
    u.email AS employee_email,
    la.leave_type_id,
    lt.leave_name,
    la.from_date,
    la.to_date,
    la.total_days,
    la.reason,
    la.status,
    la.created_at
FROM leave_applications la
INNER JOIN users u ON la.employee_id = u.id
INNER JOIN leave_types lt ON la.leave_type_id = lt.id;

-- View 3: asset_summary_view
CREATE OR REPLACE VIEW asset_summary_view AS
SELECT
    a.id AS asset_id,
    a.asset_code,
    a.asset_name,
    a.asset_type,
    a.purchase_date,
    a.purchase_cost,
    a.status AS asset_status,
    aa.id AS allocation_id,
    aa.employee_id AS allocated_to_user_id,
    u.name AS allocated_to_name,
    u.email AS allocated_to_email,
    aa.allocated_date,
    aa.return_date,
    aa.status AS allocation_status
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'active'
LEFT JOIN users u ON aa.employee_id = u.id;
