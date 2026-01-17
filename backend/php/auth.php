<?php
/**
 * Authentication API
 * Handles login, logout, and session checking
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        if ($action === 'login') {
            handleLogin();
        } elseif ($action === 'logout') {
            handleLogout();
        } else {
            sendError(400, 'Invalid action');
        }
        break;
        
    case 'GET':
        if ($action === 'check') {
            checkSession();
        } else {
            sendError(400, 'Invalid action');
        }
        break;
        
    default:
        sendError(405, 'Method not allowed');
}

/**
 * Handle user login
 */
function handleLogin() {
    $data = getRequestBody();
    
    // Validate required fields
    $missing = validateRequired($data, ['username', 'password']);
    if ($missing) {
        sendError(400, 'Missing required fields', $missing);
    }
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    
    $conn = getConnection();
    
    // Prepare statement to prevent SQL injection
    $stmt = $conn->prepare('SELECT id, username, password, fullname, email, role FROM users WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(401, 'Username atau password salah');
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendError(401, 'Username atau password salah');
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['fullname'] = $user['fullname'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'] ?? 'user';
    
    // Return user data (without password)
    unset($user['password']);
    
    $stmt->close();
    $conn->close();
    
    sendSuccess($user, 'Login berhasil');
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Destroy session
    session_unset();
    session_destroy();
    
    sendSuccess(null, 'Logout successful');
}

/**
 * Check session status
 */
function checkSession() {
    if (isAuthenticated()) {
        $userData = [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'fullname' => $_SESSION['fullname'],
            'email' => $_SESSION['email'],
            'role' => $_SESSION['role'] ?? 'user'
        ];
        sendSuccess($userData, 'Authenticated');
    } else {
        sendError(401, 'Not authenticated');
    }
}
