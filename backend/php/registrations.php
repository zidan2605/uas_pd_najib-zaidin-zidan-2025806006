<?php
/**
 * Registrations API
 * Handles event registration operations
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        requireAuth();
        handleGet();
        break;
        
    case 'POST':
        requireAuth();
        handlePost();
        break;
        
    case 'PUT':
        requireAuth();
        handlePut();
        break;
        
    case 'DELETE':
        requireAuth();
        handleDelete();
        break;
        
    default:
        sendError(405, 'Method not allowed');
}

/**
 * Get registrations
 */
function handleGet() {
    $conn = getConnection();
    $userRole = $_SESSION['role'] ?? 'user';
    
    // Admin: Get all registrations (with optional filters)
    if ($userRole === 'admin' && isset($_GET['all'])) {
        $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
        
        $query = '
            SELECT r.*, 
                   u.fullname, u.username, u.email,
                   e.title as event_title,
                   e.event_date,
                   e.event_time,
                   e.location,
                   e.fee
            FROM registrations r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN events e ON r.event_id = e.id
        ';
        
        if ($status && in_array($status, ['pending', 'approved', 'cancelled'])) {
            $query .= ' WHERE r.status = ?';
            $stmt = $conn->prepare($query . ' ORDER BY r.registration_date DESC');
            $stmt->bind_param('s', $status);
        } else {
            $stmt = $conn->prepare($query . ' ORDER BY r.registration_date DESC');
        }
        
        $stmt->execute();
        $registrations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $stmt->close();
        $conn->close();
        
        sendSuccess($registrations, 'All registrations retrieved successfully');
    }
    
    // Get registrations by event ID
    if (isset($_GET['event_id'])) {
        $event_id = intval($_GET['event_id']);
        
        $stmt = $conn->prepare('
            SELECT r.*, u.fullname, u.username, u.email
            FROM registrations r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.registration_date DESC
        ');
        $stmt->bind_param('i', $event_id);
        $stmt->execute();
        $registrations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $stmt->close();
        $conn->close();
        
        sendSuccess($registrations, 'Registrations retrieved successfully');
    }
    
    // Get registrations by current user
    $user_id = getCurrentUserId();
    
    $stmt = $conn->prepare('
        SELECT r.*, 
               e.title as event_title,
               e.event_date,
               e.event_time,
               e.location,
               e.fee,
               e.status as event_status
        FROM registrations r
        LEFT JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        ORDER BY r.registration_date DESC
    ');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $registrations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $stmt->close();
    $conn->close();
    
    sendSuccess($registrations, 'Your registrations retrieved successfully');
}

/**
 * Create new registration
 */
function handlePost() {
    $data = getRequestBody();
    
    if (!isset($data['event_id'])) {
        sendError(400, 'Event ID is required');
    }
    
    $event_id = intval($data['event_id']);
    $user_id = getCurrentUserId();
    $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : '';
    
    $conn = getConnection();
    
    // Check if event exists and has available slots
    $stmt = $conn->prepare('
        SELECT id, title, quota, registered_count, status
        FROM events
        WHERE id = ?
    ');
    $stmt->bind_param('i', $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(404, 'Event not found');
    }
    
    $event = $result->fetch_assoc();
    $stmt->close();
    
    // Check if event is open
    if ($event['status'] !== 'open') {
        sendError(400, 'Event is not open for registration');
    }
    
    // Check if quota is available
    if ($event['registered_count'] >= $event['quota']) {
        sendError(400, 'Event is fully booked');
    }
    
    // Check if user already registered
    $stmt = $conn->prepare('
        SELECT id FROM registrations
        WHERE event_id = ? AND user_id = ?
    ');
    $stmt->bind_param('ii', $event_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendError(400, 'You have already registered for this event');
    }
    
    $stmt->close();
    
    // Create registration
    $stmt = $conn->prepare('
        INSERT INTO registrations (event_id, user_id, status, notes)
        VALUES (?, ?, ?, ?)
    ');
    
    $status = 'pending';  // Default pending, perlu approval admin
    $stmt->bind_param('iiss', $event_id, $user_id, $status, $notes);
    
    if ($stmt->execute()) {
        $registration_id = $conn->insert_id;
        
        // Get the created registration with event details
        $stmt2 = $conn->prepare('
            SELECT r.*, 
                   e.title as event_title,
                   e.event_date,
                   e.event_time,
                   e.location,
                   e.fee
            FROM registrations r
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.id = ?
        ');
        $stmt2->bind_param('i', $registration_id);
        $stmt2->execute();
        $registration = $stmt2->get_result()->fetch_assoc();
        
        $stmt2->close();
        $stmt->close();
        $conn->close();
        
        sendSuccess($registration, 'Registration successful', 201);
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to register', $error);
    }
}

/**
 * Update registration status
 */
function handlePut() {
    $data = getRequestBody();
    
    if (!isset($data['id'])) {
        sendError(400, 'Registration ID is required');
    }
    
    if (!isset($data['status'])) {
        sendError(400, 'Status is required');
    }
    
    $id = intval($data['id']);
    $status = $data['status'];
    
    // Validate status
    $allowedStatuses = ['pending', 'approved', 'cancelled'];
    if (!in_array($status, $allowedStatuses)) {
        sendError(400, 'Invalid status');
    }
    
    $conn = getConnection();
    
    // Check if registration exists
    $stmt = $conn->prepare('SELECT id, user_id FROM registrations WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(404, 'Registration not found');
    }
    
    $stmt->close();
    
    // Update registration
    $stmt = $conn->prepare('UPDATE registrations SET status = ? WHERE id = ?');
    $stmt->bind_param('si', $status, $id);
    
    if ($stmt->execute()) {
        // Get updated registration
        $stmt2 = $conn->prepare('
            SELECT r.*, 
                   e.title as event_title,
                   e.event_date,
                   e.event_time,
                   e.location,
                   e.fee
            FROM registrations r
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.id = ?
        ');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $registration = $stmt2->get_result()->fetch_assoc();
        
        $stmt2->close();
        $stmt->close();
        $conn->close();
        
        sendSuccess($registration, 'Registration updated successfully');
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to update registration', $error);
    }
}

/**
 * Delete registration (cancel)
 */
function handleDelete() {
    if (!isset($_GET['id'])) {
        sendError(400, 'Registration ID is required');
    }
    
    $id = intval($_GET['id']);
    $user_id = getCurrentUserId();
    
    $conn = getConnection();
    
    // Check if registration exists and belongs to user
    $stmt = $conn->prepare('SELECT id, user_id FROM registrations WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(404, 'Registration not found');
    }
    
    $registration = $result->fetch_assoc();
    $stmt->close();
    
    // Delete registration
    $stmt = $conn->prepare('DELETE FROM registrations WHERE id = ?');
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        sendSuccess(null, 'Registration cancelled successfully');
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to cancel registration', $error);
    }
}
