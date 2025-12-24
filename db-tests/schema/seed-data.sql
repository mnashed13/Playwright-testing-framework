-- ============================================
-- Seed Data for Login Database
-- ============================================
-- This file contains sample test data for the login database
-- Use this to populate your test database with consistent data
-- ============================================

-- ============================================
-- SEED USERS
-- ============================================

-- Active users with different roles
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, created_at) VALUES
    ('admin_user', 'admin@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Admin', 'User', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days'),
    ('john_doe', 'john.doe@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'John', 'Doe', TRUE, CURRENT_TIMESTAMP - INTERVAL '25 days'),
    ('jane_smith', 'jane.smith@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Jane', 'Smith', TRUE, CURRENT_TIMESTAMP - INTERVAL '20 days'),
    ('bob_wilson', 'bob.wilson@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Bob', 'Wilson', TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days'),
    ('alice_johnson', 'alice.johnson@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Alice', 'Johnson', TRUE, CURRENT_TIMESTAMP - INTERVAL '10 days');

-- Inactive users (for testing inactive account scenarios)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, created_at) VALUES
    ('inactive_user', 'inactive@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Inactive', 'User', FALSE, CURRENT_TIMESTAMP - INTERVAL '60 days'),
    ('suspended_user', 'suspended@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Suspended', 'Account', FALSE, CURRENT_TIMESTAMP - INTERVAL '45 days');

-- Recently created users
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, created_at) VALUES
    ('new_user_1', 'newuser1@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'New', 'UserOne', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('new_user_2', 'newuser2@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'New', 'UserTwo', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('test_user', 'test@example.com', '$2b$10$hashedpassword123456789012345678901234567890123456', 'Test', 'User', TRUE, CURRENT_TIMESTAMP);

-- ============================================
-- SEED USER ROLES
-- ============================================

-- Assign roles to users
-- User 1: admin (all permissions)
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (1, 'admin', CURRENT_TIMESTAMP - INTERVAL '30 days');

-- User 2: regular user
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (2, 'user', CURRENT_TIMESTAMP - INTERVAL '25 days');

-- User 3: moderator
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (3, 'moderator', CURRENT_TIMESTAMP - INTERVAL '20 days'),
    (3, 'user', CURRENT_TIMESTAMP - INTERVAL '20 days');

-- User 4: regular user
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (4, 'user', CURRENT_TIMESTAMP - INTERVAL '15 days');

-- User 5: regular user
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (5, 'user', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- User 6 & 7: inactive users with guest role
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (6, 'guest', CURRENT_TIMESTAMP - INTERVAL '60 days'),
    (7, 'guest', CURRENT_TIMESTAMP - INTERVAL '45 days');

-- User 8, 9, 10: new users
INSERT INTO user_roles (user_id, role_name, granted_at) VALUES
    (8, 'user', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (9, 'user', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (10, 'user', CURRENT_TIMESTAMP);

-- ============================================
-- SEED LOGIN ATTEMPTS
-- ============================================

-- Successful login attempts for active users
INSERT INTO login_attempts (user_id, attempted_at, success, ip_address, user_agent) VALUES
    (1, CURRENT_TIMESTAMP - INTERVAL '1 hour', TRUE, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    (2, CURRENT_TIMESTAMP - INTERVAL '2 hours', TRUE, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
    (3, CURRENT_TIMESTAMP - INTERVAL '3 hours', TRUE, '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64)'),
    (4, CURRENT_TIMESTAMP - INTERVAL '4 hours', TRUE, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    (5, CURRENT_TIMESTAMP - INTERVAL '5 hours', TRUE, '192.168.1.104', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

-- Failed login attempts (wrong password)
INSERT INTO login_attempts (user_id, attempted_at, success, ip_address, user_agent, failure_reason) VALUES
    (2, CURRENT_TIMESTAMP - INTERVAL '6 hours', FALSE, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Invalid password'),
    (2, CURRENT_TIMESTAMP - INTERVAL '7 hours', FALSE, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Invalid password'),
    (4, CURRENT_TIMESTAMP - INTERVAL '8 hours', FALSE, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Invalid password');

-- Failed login attempts for inactive account
INSERT INTO login_attempts (user_id, attempted_at, success, ip_address, user_agent, failure_reason) VALUES
    (6, CURRENT_TIMESTAMP - INTERVAL '9 hours', FALSE, '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Account is inactive'),
    (7, CURRENT_TIMESTAMP - INTERVAL '10 hours', FALSE, '192.168.1.201', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Account is inactive');

-- Login attempts with suspicious activity (multiple failed attempts from same IP)
INSERT INTO login_attempts (user_id, attempted_at, success, ip_address, user_agent, failure_reason) VALUES
    (1, CURRENT_TIMESTAMP - INTERVAL '11 hours', FALSE, '10.0.0.1', 'curl/7.68.0', 'Invalid password'),
    (2, CURRENT_TIMESTAMP - INTERVAL '11 hours', FALSE, '10.0.0.1', 'curl/7.68.0', 'Invalid password'),
    (3, CURRENT_TIMESTAMP - INTERVAL '11 hours', FALSE, '10.0.0.1', 'curl/7.68.0', 'Invalid password'),
    (4, CURRENT_TIMESTAMP - INTERVAL '11 hours', FALSE, '10.0.0.1', 'curl/7.68.0', 'Invalid password'),
    (5, CURRENT_TIMESTAMP - INTERVAL '11 hours', FALSE, '10.0.0.1', 'curl/7.68.0', 'Invalid password');

-- Successful logins over time for testing date range queries
INSERT INTO login_attempts (user_id, attempted_at, success, ip_address, user_agent) VALUES
    (1, CURRENT_TIMESTAMP - INTERVAL '1 day', TRUE, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    (1, CURRENT_TIMESTAMP - INTERVAL '2 days', TRUE, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    (2, CURRENT_TIMESTAMP - INTERVAL '3 days', TRUE, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
    (3, CURRENT_TIMESTAMP - INTERVAL '5 days', TRUE, '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64)'),
    (4, CURRENT_TIMESTAMP - INTERVAL '7 days', TRUE, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- You can uncomment these to verify the data was inserted correctly
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as active_users FROM users WHERE is_active = TRUE;
-- SELECT COUNT(*) as total_roles FROM user_roles;
-- SELECT COUNT(*) as total_login_attempts FROM login_attempts;
-- SELECT COUNT(*) as successful_logins FROM login_attempts WHERE success = TRUE;
-- SELECT COUNT(*) as failed_logins FROM login_attempts WHERE success = FALSE;



