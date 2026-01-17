/**
 * List Events JavaScript
 * Fetch, filter, search,, and sort events
 */

// Save to global so form.js can access
window.listState = {
    events: [],
    filteredEvents: [],
    currentFilter: {
        status: '',
        search: '',
        sortBy: 'event_date',
        sortOrder: 'ASC'
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = await utils.checkAuth();
    if (!user) return;

    // User info & Sidebar menu are handled by utils.checkAuth -> utils.updateUIWithUser

    // Load events
    await loadEvents();

    // Setup event listeners
    setupFilters();

    // Save activity
    utils.saveActivity('view_list', {
        timestamp: new Date().toISOString()
    });
});

async function loadEvents() {
    try {
        const { status, search, sortBy, sortOrder } = window.listState.currentFilter;

        let url = 'events.php?';
        if (status) url += `status=${status}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        url += `sort=${sortBy}&order=${sortOrder}`;

        const data = await utils.apiRequest(url);

        if (data.success) {
            window.listState.events = data.data;
            window.listState.filteredEvents = data.data;
            renderEvents();
        } else {
            utils.showNotification('Gagal memuat data event', 'error');
        }
    } catch (error) {
        console.error('Failed to load events:', error);
        utils.showNotification('Terjadi kesalahan saat memuat data', 'error');
    }
}

function renderEvents() {
    const tbody = document.querySelector('#eventsTable tbody');
    const events = window.listState.filteredEvents;

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tidak ada event ditemukan</td></tr>';
        return;
    }

    const html = events.map(event => {
        const statusClass = event.status === 'open' ? 'success' :
            event.status === 'closed' ? 'danger' : 'warning';
        const statusText = event.status === 'open' ? 'Open' :
            event.status === 'closed' ? 'Closed' : 'Cancelled';

        const availabilityClass = event.availability_status === 'full' ? 'danger' :
            event.availability_status === 'almost_full' ? 'warning' : 'success';

        return `
            <tr>
                <td><strong>${event.title}</strong></td>
                <td>${utils.formatDate(event.event_date)}<br/><small>${utils.formatTime(event.event_time)}</small></td>
                <td>${event.location}</td>
                <td>
                    <span class="badge badge-${availabilityClass}">
                        ${event.registered_count} / ${event.quota}
                    </span>
                </td>
                <td>${utils.formatCurrency(event.fee)}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-primary" onclick="viewEvent(${event.id})" title="Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="editEvent(${event.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}')" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;

    // Update count
    document.getElementById('eventCount').textContent = `${events.length} event ditemukan`;
}

function setupFilters() {
    // Filter by status
    document.getElementById('filterStatus').addEventListener('change', (e) => {
        window.listState.currentFilter.status = e.target.value;
        loadEvents();
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            window.listState.currentFilter.search = e.target.value;
            loadEvents();
        }, 300);
    });

    // Sort
    document.getElementById('sortBy').addEventListener('change', (e) => {
        window.listState.currentFilter.sortBy = e.target.value;
        loadEvents();
    });

    document.getElementById('sortOrder').addEventListener('change', (e) => {
        window.listState.currentFilter.sortOrder = e.target.value;
        loadEvents();
    });
}

function viewEvent(id) {
    window.location.href = `detail.html?id=${id}`;
}

function editEvent(id) {
    window.location.href = `form.html?id=${id}`;

    // Save activity
    utils.saveActivity('edit_event', {
        event_id: id,
        timestamp: new Date().toISOString()
    });
}

async function deleteEvent(id, title) {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}"?`)) {
        return;
    }

    try {
        const data = await utils.apiRequest(`events.php?id=${id}`, {
            method: 'DELETE'
        });

        if (data.success) {
            utils.showNotification('Event berhasil dihapus', 'success');

            // Save activity
            utils.saveActivity('delete_event', {
                event_id: id,
                event_title: title,
                timestamp: new Date().toISOString()
            });

            // Reload events
            loadEvents();
        } else {
            utils.showNotification(data.message || 'Gagal menghapus event', 'error');
        }
    } catch (error) {
        console.error('Failed to delete event:', error);
        utils.showNotification('Terjadi kesalahan saat menghapus event', 'error');
    }
}
