<?php
/**
 * User Registration API
 * Handles new user registration
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError(405, 'Method not allowed');
}

handleRegister();

/**
 * Handle user registration
 */
function handleRegister() {
    $data = getRequestBody();
    
    // Validate required fields
    $missing = validateRequired($data, ['username', 'password', 'fullname', 'email']);
    if ($missing) {
        sendError(400, 'Missing required fields', $missing);
    }
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    $fullname = sanitizeInput($data['fullname']);
    $email = sanitizeInput($data['email']);
    
    // Validate username length
    if (strlen($username) < 3 || strlen($username) > 50) {
        sendError(400, 'Username harus 3-50 karakter');
    }
    
    // Validate email format
    if (!validateEmail($email)) {
        sendError(400, 'Format email tidak valid');
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        sendError(400, 'Password minimal 6 karakter');
    }
    
    // Validate confirm password if provided
    if (isset($data['confirm_password']) && $password !== $data['confirm_password']) {
        sendError(400, 'Password dan konfirmasi tidak sama');
    }
    
    $conn = getConnection();
    
    // Check if username already exists
    $stmt = $conn->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();
        sendError(400, 'Username sudah digunakan');
    }
    $stmt->close();
    
    // Check if email already exists
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();
        sendError(400, 'Email sudah digunakan');
    }
    $stmt->close();
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare('INSERT INTO users (username, password, fullname, email, role) VALUES (?, ?, ?, ?, ?)');
    $role = 'user';
    $stmt->bind_param('sssss', $username, $hashedPassword, $fullname, $email, $role);
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        
        $stmt->close();
        $conn->close();
        
        // Return success without password
        sendSuccess([
            'id' => $userId,
            'username' => $username,
            'fullname' => $fullname,
            'email' => $email,
            'role' => $role
        ], 'Registrasi berhasil', 201);
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Registrasi gagal', $error);
    }
}
