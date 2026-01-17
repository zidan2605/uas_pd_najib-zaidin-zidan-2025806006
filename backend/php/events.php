<?php
/**
 * Events API
 * Handles CRUD operations for events
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
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
 * Get events (list or single)
 */
function handleGet() {
    $conn = getConnection();
    
    // Get single event by ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $stmt = $conn->prepare('
            SELECT e.*, u.fullname as creator_name, u.username as creator_username,
                   (e.quota - e.registered_count) as available_slots
            FROM events e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE e.id = ?
        ');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError(404, 'Event not found');
        }
        
        $event = $result->fetch_assoc();
        
        // Get registrations for this event
        $stmt2 = $conn->prepare('
            SELECT r.*, u.fullname, u.email, u.username
            FROM registrations r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.registration_date DESC
        ');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $registrations = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $event['registrations'] = $registrations;
        
        $stmt->close();
        $stmt2->close();
        $conn->close();
        
        sendSuccess($event, 'Event retrieved successfully');
    }
    
    // Get list of events with filters
    $where = [];
    $params = [];
    $types = '';
    
    // Filter by status
    if (isset($_GET['status']) && $_GET['status'] !== '') {
        $where[] = 'e.status = ?';
        $params[] = $_GET['status'];
        $types .= 's';
    }
    
    // Search by title
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = '(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)';
        $searchTerm = '%' . $_GET['search'] . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= 'sss';
    }
    
    // Build WHERE clause
    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Sorting
    $sortBy = $_GET['sort'] ?? 'event_date';
    $sortOrder = $_GET['order'] ?? 'ASC';
    
    $allowedSort = ['event_date', 'title', 'quota', 'registered_count', 'fee', 'created_at'];
    if (!in_array($sortBy, $allowedSort)) {
        $sortBy = 'event_date';
    }
    
    if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) {
        $sortOrder = 'ASC';
    }
    
    $query = "
        SELECT e.*, u.fullname as creator_name,
               (e.quota - e.registered_count) as available_slots,
               CASE 
                   WHEN e.registered_count >= e.quota THEN 'full'
                   WHEN e.registered_count >= e.quota * 0.8 THEN 'almost_full'
                   ELSE 'available'
               END as availability_status
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        $whereClause
        ORDER BY e.$sortBy $sortOrder
    ";
    
    if (!empty($params)) {
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($query);
    }
    
    $events = $result->fetch_all(MYSQLI_ASSOC);
    
    if (!empty($params)) {
        $stmt->close();
    }
    $conn->close();
    
    sendSuccess($events, 'Events retrieved successfully');
}

/**
 * Create new event
 */
function handlePost() {
    $data = getRequestBody();
    
    // Validate required fields
    $required = ['title', 'description', 'event_date', 'event_time', 'location', 'quota', 'fee'];
    $missing = validateRequired($data, $required);
    if ($missing) {
        sendError(400, 'Missing required fields', $missing);
    }
    
    // Validate data types and formats
    $errors = [];
    
    if (!validateDate($data['event_date'])) {
        $errors[] = 'Invalid event_date format (use YYYY-MM-DD)';
    }
    
    if (!validateTime($data['event_time'])) {
        $errors[] = 'Invalid event_time format (use HH:MM)';
    }
    
    if (!is_numeric($data['quota']) || intval($data['quota']) <= 0) {
        $errors[] = 'Quota must be a positive number';
    }
    
    if (!is_numeric($data['fee']) || floatval($data['fee']) < 0) {
        $errors[] = 'Fee must be a non-negative number';
    }
    
    if (!empty($errors)) {
        sendError(400, 'Validation failed', $errors);
    }
    
    $conn = getConnection();
    
    $stmt = $conn->prepare('
        INSERT INTO events (title, description, event_date, event_time, location, quota, fee, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $title = sanitizeInput($data['title']);
    $description = sanitizeInput($data['description']);
    $event_date = $data['event_date'];
    $event_time = $data['event_time'];
    $location = sanitizeInput($data['location']);
    $quota = intval($data['quota']);
    $fee = floatval($data['fee']);
    $status = $data['status'] ?? 'open';
    $created_by = getCurrentUserId();
    
    $stmt->bind_param(
        'sssssidsi',
        $title,
        $description,
        $event_date,
        $event_time,
        $location,
        $quota,
        $fee,
        $status,
        $created_by
    );
    
    if ($stmt->execute()) {
        $eventId = $conn->insert_id;
        
        // Get the created event
        $stmt2 = $conn->prepare('SELECT * FROM events WHERE id = ?');
        $stmt2->bind_param('i', $eventId);
        $stmt2->execute();
        $event = $stmt2->get_result()->fetch_assoc();
        
        $stmt2->close();
        $stmt->close();
        $conn->close();
        
        sendSuccess($event, 'Event created successfully', 201);
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to create event', $error);
    }
}

/**
 * Update event
 */
function handlePut() {
    $data = getRequestBody();
    
    if (!isset($data['id'])) {
        sendError(400, 'Event ID is required');
    }
    
    $id = intval($data['id']);
    $conn = getConnection();
    
    // Check if event exists
    $stmt = $conn->prepare('SELECT created_by FROM events WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(404, 'Event not found');
    }
    
    $stmt->close();
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    $types = '';
    
    $allowedFields = [
        'title' => 's',
        'description' => 's',
        'event_date' => 's',
        'event_time' => 's',
        'location' => 's',
        'quota' => 'i',
        'fee' => 'd',
        'status' => 's'
    ];
    
    foreach ($allowedFields as $field => $type) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            
            if ($type === 's') {
                $params[] = sanitizeInput($data[$field]);
            } elseif ($type === 'i') {
                $params[] = intval($data[$field]);
            } elseif ($type === 'd') {
                $params[] = floatval($data[$field]);
            }
            
            $types .= $type;
        }
    }
    
    if (empty($updates)) {
        sendError(400, 'No fields to update');
    }
    
    $params[] = $id;
    $types .= 'i';
    
    $query = 'UPDATE events SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated event
        $stmt2 = $conn->prepare('SELECT * FROM events WHERE id = ?');
        $stmt2->bind_param('i', $id);
        $stmt2->execute();
        $event = $stmt2->get_result()->fetch_assoc();
        
        $stmt2->close();
        $stmt->close();
        $conn->close();
        
        sendSuccess($event, 'Event updated successfully');
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to update event', $error);
    }
}

/**
 * Delete event
 */
function handleDelete() {
    if (!isset($_GET['id'])) {
        sendError(400, 'Event ID is required');
    }
    
    $id = intval($_GET['id']);
    $conn = getConnection();
    
    // Check if event exists
    $stmt = $conn->prepare('SELECT id FROM events WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError(404, 'Event not found');
    }
    
    $stmt->close();
    
    // Delete event (cascades to registrations)
    $stmt = $conn->prepare('DELETE FROM events WHERE id = ?');
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        sendSuccess(null, 'Event deleted successfully');
    } else {
        $error = $conn->error;
        $stmt->close();
        $conn->close();
        sendError(500, 'Failed to delete event', $error);
    }
}
