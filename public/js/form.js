/**
 * Form JavaScript
 * Create and Edit Events
 */

let eventId = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = await utils.checkAuth();
    if (!user) return;

    // Update user info & sidebar menu (handled by utils)
    // Note: utils.checkAuth calls updateUIWithUser internally, but we can call it explicitly if needed
    // utils.updateUIWithUser(user); 

    const isAdmin = user.role === 'admin';

    // Only admin can access this page
    if (!isAdmin) {
        utils.showNotification('Akses ditolak. Halaman ini hanya untuk admin.', 'error');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }

    // Initialize utils SETELAH menu di-set
    utils.initDarkMode();
    utils.initSidebar();

    // Check if edit mode
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('id');

    if (eventId) {
        isEditMode = true;
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Event';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> <span>Update Event</span>';
        loadEventData();
    } else {
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('event_date').value = tomorrow.toISOString().split('T')[0];
    }

    // Setup form validation
    setupForm();
});

async function loadEventData() {
    try {
        const data = await utils.apiRequest(`events.php?id=${eventId}`);

        if (data.success) {
            const event = data.data;

            // Fill form
            document.getElementById('title').value = event.title;
            document.getElementById('description').value = event.description;
            document.getElementById('event_date').value = event.event_date;
            document.getElementById('event_time').value = event.event_time;
            document.getElementById('location').value = event.location;
            document.getElementById('quota').value = event.quota;
            document.getElementById('fee').value = event.fee;
            document.getElementById('status').value = event.status;
        } else {
            utils.showNotification('Gagal memuat data event', 'error');
            setTimeout(() => window.location.href = 'list.html', 1000);
        }
    } catch (error) {
        console.error('Failed to load event:', error);
        utils.showNotification('Terjadi kesalahan saat memuat data', 'error');
    }
}

function setupForm() {
    const validationRules = {
        title: {
            required: true,
            minLength: 5,
            messages: {
                required: 'Judul event wajib diisi',
                minLength: 'Judul minimal 5 karakter'
            }
        },
        description: {
            required: true,
            minLength: 20,
            messages: {
                required: 'Deskripsi wajib diisi',
                minLength: 'Deskripsi minimal 20 karakter'
            }
        },
        event_date: {
            required: true,
            date: true,
            messages: {
                required: 'Tanggal event wajib diisi',
                date: 'Format tanggal tidak valid'
            }
        },
        event_time: {
            required: true,
            messages: {
                required: 'Waktu event wajib diisi'
            }
        },
        location: {
            required: true,
            minLength: 5,
            messages: {
                required: 'Lokasi wajib diisi',
                minLength: 'Lokasi minimal 5 karakter'
            }
        },
        quota: {
            required: true,
            number: true,
            min: 1,
            messages: {
                required: 'Kuota wajib diisi',
                number: 'Kuota harus berupa angka',
                min: 'Kuota minimal 1'
            }
        },
        fee: {
            required: true,
            number: true,
            min: 0,
            messages: {
                required: 'Biaya wajib diisi',
                number: 'Biaya harus berupa angka',
                min: 'Biaya tidak boleh negatif'
            }
        }
    };

    // Setup real-time validation
    utils.setupRealTimeValidation('eventForm', validationRules);

    // Handle form submission
    document.getElementById('eventForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        if (!utils.validateForm('eventForm', validationRules)) {
            utils.showNotification('Mohon perbaiki kesalahan pada form', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalHTML = submitBtn.innerHTML;

        // Disable and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Menyimpan...</span>';

        try {
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                event_date: document.getElementById('event_date').value,
                event_time: document.getElementById('event_time').value,
                location: document.getElementById('location').value,
                quota: parseInt(document.getElementById('quota').value),
                fee: parseFloat(document.getElementById('fee').value),
                status: document.getElementById('status').value
            };

            let url = 'events.php';
            let method = 'POST';

            if (isEditMode) {
                formData.id = parseInt(eventId);
                method = 'PUT';
            }

            const data = await utils.apiRequest(url, {
                method: method,
                body: JSON.stringify(formData)
            });

            if (data.success) {
                utils.showNotification(
                    isEditMode ? 'Event berhasil diupdate' : 'Event berhasil ditambahkan',
                    'success'
                );

                // Save activity
                utils.saveActivity(
                    isEditMode ? 'edit_event' : 'create_event',
                    {
                        event_id: data.data.id,
                        event_title: formData.title,
                        timestamp: new Date().toISOString()
                    }
                );

                // Redirect to list
                setTimeout(() => {
                    window.location.href = 'list.html';
                }, 1000);
            } else {
                utils.showNotification(data.message || 'Gagal menyimpan event', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            utils.showNotification('Terjadi kesalahan saat menyimpan', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin membatalkan?')) {
            window.location.href = 'list.html';
        }
    });
}
