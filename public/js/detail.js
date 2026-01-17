/**
 * Detail Event JavaScript
 * View event details and register
 */

let eventId = null;
let currentUser = null;
let eventData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    currentUser = await utils.checkAuth();
    if (!currentUser) return;

    // User info & Sidebar menu are handled by utils.checkAuth -> utils.updateUIWithUser

    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('id');

    if (!eventId) {
        utils.showNotification('Event tidak ditemukan', 'error');
        setTimeout(() => window.location.href = 'list.html', 1000);
        return;
    }

    // Load event data
    await loadEvent();

    // Save activity
    utils.saveActivity('view_event_detail', {
        event_id: eventId,
        timestamp: new Date().toISOString()
    });
});

async function loadEvent() {
    try {
        const data = await utils.apiRequest(`events.php?id=${eventId}`);

        if (data.success) {
            eventData = data.data;
            renderEvent();
            renderRegistrations();
        } else {
            utils.showNotification('Event tidak ditemukan', 'error');
            setTimeout(() => window.location.href = 'list.html', 1000);
        }
    } catch (error) {
        console.error('Failed to load event:', error);
        utils.showNotification('Terjadi kesalahan saat memuat data', 'error');
    }
}

function renderEvent() {
    const event = eventData;

    // Event title
    document.getElementById('eventTitle').textContent = event.title;

    // Event details
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventDate').textContent = utils.formatDate(event.event_date);
    document.getElementById('eventTime').textContent = utils.formatTime(event.event_time);
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventFee').textContent = utils.formatCurrency(event.fee);
    document.getElementById('creatorName').textContent = event.creator_name || 'Unknown';

    // Quota and status
    const quotaText = `${event.registered_count} / ${event.quota}`;
    const availableSlots = event.available_slots;

    document.getElementById('eventQuota').textContent = quotaText;
    document.getElementById('availableSlots').textContent = availableSlots;

    const statusClass = event.status === 'open' ? 'success' :
        event.status === 'closed' ? 'danger' : 'warning';
    const statusText = event.status === 'open' ? 'Open' :
        event.status === 'closed' ? 'Closed' : 'Cancelled';

    document.getElementById('eventStatus').innerHTML = `<span class="badge badge-${statusClass}">${statusText}</span>`;

    // Registration button
    const registerBtn = document.getElementById('registerBtn');
    const editBtn = document.getElementById('editBtn');

    if (event.status !== 'open') {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-ban"></i> Event Tidak Tersedia';
    } else if (availableSlots <= 0) {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-users"></i> Kuota Penuh';
    } else {
        // Check if user already registered
        const userRegistration = event.registrations.find(r => r.user_id == currentUser.id);

        if (userRegistration) {
            if (userRegistration.status === 'cancelled') {
                registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Event';
            } else {
                registerBtn.disabled = true;
                registerBtn.innerHTML = '<i class="fas fa-check"></i> Sudah Terdaftar';
            }
        } else {
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Event';
        }
    }

    // Edit button - only for event creator
    if (event.created_by == currentUser.id) {
        editBtn.style.display = 'inline-flex';
    } else {
        editBtn.style.display = 'none';
    }
}

function renderRegistrations() {
    const registrations = eventData.registrations;
    const tbody = document.querySelector('#registrationsTable tbody');

    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada pendaftar</td></tr>';
        return;
    }

    const html = registrations.map(registration => {
        const statusClass = registration.status === 'approved' ? 'success' :
            registration.status === 'pending' ? 'warning' : 'danger';
        const statusText = registration.status === 'approved' ? 'Approved' :
            registration.status === 'pending' ? 'Pending' : 'Cancelled';

        return `
            <tr>
                <td><strong>${registration.fullname}</strong></td>
                <td>${registration.email}</td>
                <td>${utils.formatDateTime(registration.registration_date)}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;

    // Update count
    document.getElementById('registrationCount').textContent =
        `${registrations.filter(r => r.status !== 'cancelled').length} peserta terdaftar`;
}

async function registerEvent() {
    if (!confirm('Apakah Anda yakin ingin mendaftar event ini?')) {
        return;
    }

    const registerBtn = document.getElementById('registerBtn');
    const originalHTML = registerBtn.innerHTML;

    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';

    try {
        const data = await utils.apiRequest('registrations.php', {
            method: 'POST',
            body: JSON.stringify({
                event_id: parseInt(eventId),
                notes: 'Pendaftaran melalui web'
            })
        });

        if (data.success) {
            utils.showNotification('Pendaftaran berhasil!', 'success');

            // Save activity
            utils.saveActivity('register_event', {
                event_id: eventId,
                event_title: eventData.title,
                timestamp: new Date().toISOString()
            });

            // Reload event data
            setTimeout(() => loadEvent(), 500);
        } else {
            utils.showNotification(data.message || 'Pendaftaran gagal', 'error');
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalHTML;
        }
    } catch (error) {
        console.error('Registration failed:', error);
        utils.showNotification('Terjadi kesalahan saat mendaftar', 'error');
        registerBtn.disabled = false;
        registerBtn.innerHTML = originalHTML;
    }
}

function editEvent() {
    window.location.href = `form.html?id=${eventId}`;
}
