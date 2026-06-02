-- Run these commands in PostgreSQL Query Tool

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
