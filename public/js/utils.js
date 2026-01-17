/**
 * Utility Functions
 * Event Registration System
 */

// ============ API Configuration ============
const API_BASE_URL = '../backend/php';

// ============ Authentication ============
async function checkAuth() {
    // 1. Coba ambil dari localStorage untuk render UI cepat (Optimistic UI)
    const cachedUser = getUserFromStorage();
    if (cachedUser) {
        // Render UI dengan data cache dulu
        updateUIWithUser(cachedUser);
    }

    try {
        // 2. Validasi ke server (Silent check)
        const response = await fetch(`${API_BASE_URL}/auth.php?action=check`);
        const data = await response.json();

        if (data.success) {
            const user = data.data;
            // Update localStorage jika ada perubahan data
            if (JSON.stringify(user) !== JSON.stringify(cachedUser)) {
                saveUserToStorage(user);
                updateUIWithUser(user);
                
                // Show welcome message if just logged in (session storage flag)
                if (!sessionStorage.getItem('welcomeShown')) {
                    showNotification(`Selamat datang, ${user.fullname}`, 'success');
                    sessionStorage.setItem('welcomeShown', 'true');
                }
            }
            return user;
        }

        // Jika server bilang tidak valid, tapi kita punya cache -> hapus cache & redirect
        if (cachedUser) {
            clearUserStorage();
        }

        // Redirect to login if not authenticated (except on login page and public pages)
        const publicPages = ['login.html', 'register.html', 'index.html', 'list.html', 'detail.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!publicPages.includes(currentPage) && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return null;
    } catch (error) {
        console.error('Auth check failed:', error);
        // Jika offline/error, gunakan cache jika ada
        return cachedUser;
    }
}

function saveUserToStorage(user) {
    localStorage.setItem('user_session', JSON.stringify(user));
}

function getUserFromStorage() {
    const data = localStorage.getItem('user_session');
    return data ? JSON.parse(data) : null;
}

function clearUserStorage() {
    localStorage.removeItem('user_session');
    sessionStorage.removeItem('welcomeShown');
}

function updateUIWithUser(user) {
    if (!user) return;

    // Update User Info di Sidebar
    const nameEl = document.getElementById('userName');
    const roleEl = document.getElementById('userRole');
    const avatarEl = document.getElementById('userAvatar');

    if (nameEl) nameEl.textContent = user.fullname || user.username;
    if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Peserta';
    if (avatarEl) avatarEl.textContent = (user.fullname || user.username).charAt(0).toUpperCase();

    // Render Sidebar Menu berdasarkan Role
    renderSidebarMenu(user.role);
}

function renderSidebarMenu(role) {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    // Define Menus
    const menus = [
        {
            href: 'index.html',
            icon: 'home',
            text: 'Dashboard',
            roles: ['admin', 'user']
        },
        {
            href: 'list.html',
            icon: 'calendar-alt',
            text: 'Daftar Event',
            roles: ['admin', 'user']
        },
        {
            href: 'my-registrations.html',
            icon: 'clipboard-list',
            text: 'Pendaftaran Saya',
            roles: ['user']
        },
        {
            href: 'form.html',
            icon: 'plus-circle',
            text: 'Tambah Event',
            roles: ['admin']
        },
        {
            href: 'admin-registrations.html',
            icon: 'user-check',
            text: 'Kelola Pendaftaran',
            roles: ['admin']
        }
    ];

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Generate HTML
    const html = menus
        .filter(menu => menu.roles.includes(role))
        .map(menu => {
            const isActive = currentPage === menu.href;
            return `
            <a href="${menu.href}" class="nav-link ${isActive ? 'active' : ''}" onclick="event.stopPropagation()">
                <i class="fas fa-${menu.icon}"></i>
                <span>${menu.text}</span>
            </a>`;
        })
        .join('');

    nav.innerHTML = html;
}

async function logout() {
    // Konfirmasi sebelum logout
    if (!confirm('Apakah Anda yakin ingin logout?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            // Save logout activity
            saveActivity('logout', { timestamp: new Date().toISOString() });
            
            // Clear local storage
            clearUserStorage();

            // Redirect to login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
        showNotification('Logout gagal', 'error');
    }
}

// ============ LocalStorage Management ============
function saveActivity(type, activityData) {
    try {
        // Get existing activities
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');

        // Add new activity
        activities.push({
            type: type,
            timestamp: new Date().toISOString(),
            data: activityData
        });

        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.shift();
        }

        localStorage.setItem('user_activities', JSON.stringify(activities));
    } catch (error) {
        console.error('Failed to save activity:', error);
    }
}

function getActivities(type = null) {
    try {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');

        if (type) {
            return activities.filter(activity => activity.type === type);
        }

        return activities;
    } catch (error) {
        console.error('Failed to get activities:', error);
        return [];
    }
}

function savePreference(key, value) {
    try {
        const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
        preferences[key] = value;
        localStorage.setItem('preferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('Failed to save preference:', error);
    }
}

function getPreference(key, defaultValue = null) {
    try {
        const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    } catch (error) {
        console.error('Failed to get preference:', error);
        return defaultValue;
    }
}

// ============ Dark Mode ============
function initDarkMode() {
    const darkMode = getPreference('darkMode', false);

    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Setup dark mode toggle buttons
    const toggleButtons = document.querySelectorAll('.dark-mode-toggle');
    toggleButtons.forEach(button => {
        button.addEventListener('click', toggleDarkMode);
        updateDarkModeIcon(button, darkMode);
    });
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    savePreference('darkMode', newTheme === 'dark');

    // Update icons
    const toggleButtons = document.querySelectorAll('.dark-mode-toggle');
    toggleButtons.forEach(button => {
        updateDarkModeIcon(button, newTheme === 'dark');
    });

    // Save activity
    saveActivity('toggle_dark_mode', { mode: newTheme });
}

function updateDarkModeIcon(button, isDark) {
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============ Sidebar ============
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar || !toggleBtn) return;

    // Check if already initialized
    if (sidebar.dataset.initialized === 'true') return;
    sidebar.dataset.initialized = 'true';

    // Prevent transition on load
    sidebar.classList.add('no-transition');
    if (mainContent) mainContent.classList.add('no-transition');

    // Load sidebar state from preferences (only for desktop)
    const isCollapsed = getPreference('sidebarCollapsed', false);

    if (isCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('sidebar-collapsed');
        }
    }

    // Remove no-transition class after a short delay
    setTimeout(() => {
        sidebar.classList.remove('no-transition');
        if (mainContent) mainContent.classList.remove('no-transition');
    }, 100);

    // Toggle sidebar (desktop collapse)
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        
        if (window.innerWidth <= 768) {
            // Mobile: close sidebar
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        } else {
            // Desktop: collapse/expand
            const isCurrentlyCollapsed = sidebar.classList.toggle('collapsed');

            if (mainContent) {
                mainContent.classList.toggle('sidebar-collapsed');
            }

            // Update icon direction
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = isCurrentlyCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
            }

            // Save preference
            savePreference('sidebarCollapsed', isCurrentlyCollapsed);

            // Save activity
            saveActivity('toggle_sidebar', { collapsed: isCurrentlyCollapsed });
        }
    });

    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    // Overlay click to close
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Set active nav link
    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// ============ Formatting ============
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Rp 0';

    const number = parseFloat(amount);

    if (isNaN(number)) return 'Rp 0';

    return 'Rp ' + number.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '-';

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return date.toLocaleDateString('id-ID', options);
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';

    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) return '-';

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('id-ID', options);
}

function formatTime(timeString) {
    if (!timeString) return '-';

    // Handle both HH:MM:SS and HH:MM format
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }

    return timeString;
}

// ============ Notifications ============
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? 'check-circle' :
        type === 'error' ? 'exclamation-circle' :
            type === 'warning' ? 'exclamation-triangle' :
                'info-circle';

    notification.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation for notification removal
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============ Form Validation ============
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const errorElement = form.querySelector(`#${fieldName}-error`);
        const fieldRules = rules[fieldName];

        if (!field) return;

        let error = '';

        // Required validation
        if (fieldRules.required && !field.value.trim()) {
            error = fieldRules.messages?.required || 'Field ini wajib diisi';
            isValid = false;
        }

        // Min length validation
        if (fieldRules.minLength && field.value.length < fieldRules.minLength) {
            error = fieldRules.messages?.minLength || `Minimal ${fieldRules.minLength} karakter`;
            isValid = false;
        }

        // Email validation
        if (fieldRules.email && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                error = fieldRules.messages?.email || 'Format email tidak valid';
                isValid = false;
            }
        }

        // Number validation
        if (fieldRules.number && field.value) {
            if (isNaN(field.value)) {
                error = fieldRules.messages?.number || 'Harus berupa angka';
                isValid = false;
            }
        }

        // Min value validation
        if (fieldRules.min !== undefined && parseFloat(field.value) < fieldRules.min) {
            error = fieldRules.messages?.min || `Minimal ${fieldRules.min}`;
            isValid = false;
        }

        // Date validation
        if (fieldRules.date && field.value) {
            const date = new Date(field.value);
            if (isNaN(date.getTime())) {
                error = fieldRules.messages?.date || 'Format tanggal tidak valid';
                isValid = false;
            }
        }

        // Display or hide error
        if (error) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = error;
                errorElement.classList.add('show');
            }
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }
    });

    return isValid;
}

function setupRealTimeValidation(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Validate on blur
        field.addEventListener('blur', () => {
            validateForm(formId, rules);
        });

        // Clear error on input
        field.addEventListener('input', () => {
            const errorElement = form.querySelector(`#${fieldName}-error`);
            if (errorElement && errorElement.classList.contains('show')) {
                validateForm(formId, rules);
            }
        });
    });
}

// ============ API Helpers ============
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan pada server'
        };
    }
}

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initSidebar();
});

// Export functions for use in other scripts
window.utils = {
    checkAuth,
    logout,
    saveActivity,
    getActivities,
    savePreference,
    getPreference,
    initDarkMode,
    initSidebar,
    toggleDarkMode,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTime,
    showNotification,
    validateForm,
    setupRealTimeValidation,
    apiRequest,
    renderSidebarMenu,
    updateUIWithUser,
    getUserFromStorage,
    saveUserToStorage,
    clearUserStorage
};
