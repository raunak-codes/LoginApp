
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

-- 4. Create password_reset table (Phase 4)
CREATE TABLE password_reset (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT,
    expires_at TIMESTAMP
);

-- 5. Create refresh_tokens table (Phase 6)
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

-- 10. Create employee_skils (many-to-many)
CREATE TABLE employee_skills (
	id SERIAL PRIMARY KEY,
	employee_id INT REFERENCES employee_profiles(id),
	skill_id INT REFERENCES skills(id)
);

