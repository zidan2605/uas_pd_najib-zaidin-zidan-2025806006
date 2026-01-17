<?php
/**
 * Dashboard API
 * Provides statistics and data for dashboard
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'stats';

if ($method !== 'GET') {
    sendError(405, 'Method not allowed');
}

switch ($action) {
    case 'stats':
        getStatistics();
        break;
        
    case 'popular':
        getPopularEvents();
        break;
        
    case 'recent':
        getRecentEvents();
        break;
        
    default:
        sendError(400, 'Invalid action');
}

/**
 * Get dashboard statistics
 */
function getStatistics() {
    $conn = getConnection();
    
    // Total events
    $result = $conn->query('SELECT COUNT(*) as total FROM events');
    $totalEvents = $result->fetch_assoc()['total'];
    
    // Active events (open status)
    $result = $conn->query("SELECT COUNT(*) as total FROM events WHERE status = 'open'");
    $activeEvents = $result->fetch_assoc()['total'];
    
    // Total registrations
    $result = $conn->query("SELECT COUNT(*) as total FROM registrations WHERE status != 'cancelled'");
    $totalRegistrations = $result->fetch_assoc()['total'];
    
    // Upcoming events (future dates)
    $result = $conn->query("SELECT COUNT(*) as total FROM events WHERE event_date >= CURDATE()");
    $upcomingEvents = $result->fetch_assoc()['total'];
    
    // Total revenue
    $result = $conn->query("
        SELECT SUM(e.fee * e.registered_count) as total_revenue
        FROM events e
    ");
    $row = $result->fetch_assoc();
    $totalRevenue = $row['total_revenue'] ?? 0;
    
    // My registrations (if authenticated)
    $myRegistrations = 0;
    if (isAuthenticated()) {
        $user_id = getCurrentUserId();
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total 
            FROM registrations 
            WHERE user_id = ? AND status != 'cancelled'
        ");
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $myRegistrations = $result->fetch_assoc()['total'];
        $stmt->close();
    }
    
    // Pending registrations (for admin)
    $pendingRegistrations = 0;
    if (isAuthenticated() && ($_SESSION['role'] ?? '') === 'admin') {
        $result = $conn->query("SELECT COUNT(*) as total FROM registrations WHERE status = 'pending'");
        $pendingRegistrations = $result->fetch_assoc()['total'];
    }
    
    $conn->close();
    
    $stats = [
        'total_events' => (int)$totalEvents,
        'active_events' => (int)$activeEvents,
        'total_registrations' => (int)$totalRegistrations,
        'upcoming_events' => (int)$upcomingEvents,
        'total_revenue' => (float)$totalRevenue,
        'my_registrations' => (int)$myRegistrations,
        'pending_registrations' => (int)$pendingRegistrations
    ];
    
    sendSuccess($stats, 'Statistics retrieved successfully');
}

/**
 * Get popular events (sorted by registered_count)
 */
function getPopularEvents() {
    $conn = getConnection();
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 5;
    
    $stmt = $conn->prepare("
        SELECT e.*,
               (e.quota - e.registered_count) as available_slots,
               ROUND((e.registered_count / e.quota * 100), 2) as occupancy_percentage
        FROM events e
        WHERE e.status = 'open'
        ORDER BY e.registered_count DESC, e.event_date ASC
        LIMIT ?
    ");
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $events = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $stmt->close();
    $conn->close();
    
    sendSuccess($events, 'Popular events retrieved successfully');
}

/**
 * Get recent events
 */
function getRecentEvents() {
    $conn = getConnection();
    
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 5;
    
    $stmt = $conn->prepare("
        SELECT e.*,
               (e.quota - e.registered_count) as available_slots,
               u.fullname as creator_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.created_at DESC
        LIMIT ?
    ");
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $events = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $stmt->close();
    $conn->close();
    
    sendSuccess($events, 'Recent events retrieved successfully');
}
