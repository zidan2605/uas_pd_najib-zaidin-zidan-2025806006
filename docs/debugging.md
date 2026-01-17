# Debugging Documentation
## Event Registration System

Dokumentasi ini berisi penjelasan debugging, testing, dan screenshot Network tab untuk verifikasi Fetch API calls.

---

## 🔍 Overview

Sistem ini menggunakan **Fetch API** untuk komunikasi antara frontend (JavaScript) dan backend (PHP API). Semua request menggunakan JSON format dan ditangani secara asynchronous.

---

## 🛠️ Bug Fixes (Updated: 2026-01-09)

### Bug 1: CSS Menggunakan Gradient Berlebihan
**Problem:** UI menggunakan gradient warna yang melanggar ketentuan "solid colors"

**Files Affected:** `public/css/style.css`

**Solution:**
```css
/* SEBELUM */
background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);

/* SESUDAH */
background-color: var(--primary-color);
```

**Components Fixed:**
- Sidebar background
- Stat-cards (primary, success, warning, info)
- Button primary
- Nav-link active
- User avatar
- Login container

---

### Bug 2: Sidebar Collapsed Mode Tidak Rapi
**Problem:** Saat sidebar di-collapse, text tidak sepenuhnya tersembunyi dan button logout overflow

**Files Affected:** `public/css/style.css`

**Solution:**
```css
.sidebar.collapsed .sidebar-footer .btn span {
    display: none;
}

.sidebar.collapsed .dark-mode-toggle span {
    display: none;
}

.sidebar.collapsed .user-info {
    justify-content: center;
}
```

---

### Bug 3: Logout Tanpa Konfirmasi
**Problem:** User langsung logout tanpa dialog konfirmasi

**Files Affected:** `public/js/utils.js`

**Solution:**
```javascript
async function logout() {
    if (!confirm('Apakah Anda yakin ingin logout?')) {
        return;
    }
    // ... rest of logout logic
}
```

---

### Bug 4: Mobile Sidebar Tidak Bisa Dibuka
**Problem:** Di mobile view, sidebar tersembunyi dan tidak ada cara untuk membukanya

**Files Affected:** 
- `public/css/style.css`
- `public/js/utils.js`
- `public/index.html`, `list.html`, `form.html`, `detail.html`

**Solution:**
1. Tambah button mobile menu toggle:
```html
<button class="mobile-menu-toggle" aria-label="Open menu">
    <i class="fas fa-bars"></i>
</button>
<div class="sidebar-overlay"></div>
```

2. Tambah CSS untuk mobile menu:
```css
.mobile-menu-toggle {
    display: none;
}

@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: flex;
    }
}
```

3. Handle toggle di JavaScript:
```javascript
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
}
```

---

### Bug 5: Stat-Card Value Overflow
**Problem:** Nilai currency besar (misal: Rp 12.600.000) bisa keluar dari card

**Files Affected:** `public/css/style.css`

**Solution:**
```css
.stat-value {
    max-width: 100%;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

@media (max-width: 480px) {
    .stat-value {
        font-size: var(--font-size-2xl);
    }
}
```

---

---

## 📡 API Request/Response Flow

### 1. Authentication Flow

#### Login Request
**Endpoint**: `POST /backend/php/auth.php?action=login`

**Request Payload:**
```json
{
    "username": "admin",
    "password": "password123"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "id": 1,
        "username": "admin",
        "fullname": "Administrator",
        "email": "admin@event.com"
    }
}
```

**Response Error (401):**
```json
{
    "success": false,
    "message": "Invalid username or password",
    "errors": null
}
```

#### Check Session Request
**Endpoint**: `GET /backend/php/auth.php?action=check`

**Response:**
```json
{
    "success": true,
    "message": "Authenticated",
    "data": {
        "id": 1,
        "username": "admin",
        "fullname": "Administrator",
        "email": "admin@event.com"
    }
}
```

---

### 2. Events CRUD

#### Get All Events (with filters)
**Endpoint**: `GET /backend/php/events.php?status=open&search=workshop&sort=event_date&order=ASC`

**Response:**
```json
{
    "success": true,
    "message": "Events retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "Workshop Web Development",
            "description": "Belajar membuat website modern...",
            "event_date": "2026-02-15",
            "event_time": "09:00:00",
            "location": "Gedung A Lantai 3",
            "quota": 30,
            "registered_count": 12,
            "fee": "150000.00",
            "status": "open",
            "created_by": 1,
            "creator_name": "Administrator",
            "available_slots": 18,
            "availability_status": "available"
        }
    ]
}
```

#### Get Single Event
**Endpoint**: `GET /backend/php/events.php?id=1`

**Response:**
```json
{
    "success": true,
    "message": "Event retrieved successfully",
    "data": {
        "id": 1,
        "title": "Workshop Web Development",
        "description": "Belajar membuat website modern dengan HTML, CSS, dan JavaScript",
        "event_date": "2026-02-15",
        "event_time": "09:00:00",
        "location": "Gedung A Lantai 3",
        "quota": 30,
        "registered_count": 12,
        "fee": "150000.00",
        "status": "open",
        "created_by": 1,
        "creator_name": "Administrator",
        "available_slots": 18,
        "registrations": [
            {
                "id": 1,
                "event_id": 1,
                "user_id": 2,
                "status": "approved",
                "registration_date": "2026-01-09 10:00:00",
                "fullname": "John Doe",
                "email": "john@example.com"
            }
        ]
    }
}
```

#### Create Event
**Endpoint**: `POST /backend/php/events.php`

**Request Payload:**
```json
{
    "title": "Seminar Technology 2026",
    "description": "Seminar tentang teknologi terkini dan masa depan digital",
    "event_date": "2026-03-20",
    "event_time": "10:00",
    "location": "Auditorium Main Hall",
    "quota": 100,
    "fee": 250000,
    "status": "open"
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Event created successfully",
    "data": {
        "id": 9,
        "title": "Seminar Technology 2026",
        "description": "Seminar tentang teknologi terkini...",
        "event_date": "2026-03-20",
        "event_time": "10:00:00",
        "location": "Auditorium Main Hall",
        "quota": 100,
        "registered_count": 0,
        "fee": "250000.00",
        "status": "open",
        "created_by": 1,
        "created_at": "2026-01-09 10:30:00"
    }
}
```

#### Update Event
**Endpoint**: `PUT /backend/php/events.php`

**Request Payload:**
```json
{
    "id": 9,
    "title": "Seminar Technology 2026 - Updated",
    "quota": 150,
    "fee": 300000
}
```

**Response:**
```json
{
    "success": true,
    "message": "Event updated successfully",
    "data": {
        "id": 9,
        "title": "Seminar Technology 2026 - Updated",
        "quota": 150,
        "fee": "300000.00",
        ...
    }
}
```

#### Delete Event
**Endpoint**: `DELETE /backend/php/events.php?id=9`

**Response:**
```json
{
    "success": true,
    "message": "Event deleted successfully",
    "data": null
}
```

---

### 3. Registration Flow

#### Register to Event
**Endpoint**: `POST /backend/php/registrations.php`

**Request Payload:**
```json
{
    "event_id": 1,
    "notes": "Pendaftaran melalui web"
}
```

**Response Success:**
```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "id": 25,
        "event_id": 1,
        "user_id": 2,
        "status": "approved",
        "registration_date": "2026-01-09 11:00:00",
        "event_title": "Workshop Web Development",
        "event_date": "2026-02-15",
        "event_time": "09:00:00",
        "location": "Gedung A Lantai 3",
        "fee": "150000.00"
    }
}
```

**Response Error (Already Registered):**
```json
{
    "success": false,
    "message": "You have already registered for this event",
    "errors": null
}
```

**Response Error (Quota Full):**
```json
{
    "success": false,
    "message": "Event is fully booked",
    "errors": null
}
```

---

### 4. Dashboard Statistics

#### Get Statistics
**Endpoint**: `GET /backend/php/dashboard.php?action=stats`

**Response:**
```json
{
    "success": true,
    "message": "Statistics retrieved successfully",
    "data": {
        "total_events": 8,
        "active_events": 6,
        "total_registrations": 42,
        "upcoming_events": 7,
        "total_revenue": 12600000,
        "my_registrations": 3
    }
}
```

#### Get Popular Events
**Endpoint**: `GET /backend/php/dashboard.php?action=popular&limit=5`

**Response:**
```json
{
    "success": true,
    "message": "Popular events retrieved successfully",
    "data": [
        {
            "id": 5,
            "title": "Conference Tech Innovation",
            "registered_count": 67,
            "quota": 100,
            "available_slots": 33,
            "occupancy_percentage": 67.00
        }
    ]
}
```

---

## 🧪 Testing Steps

### 1. Login Test
1. Buka `login.html`
2. Buka **DevTools** → **Network tab**
3. Input username & password
4. Klik Login
5. **Verify:**
   - Request ke `auth.php?action=login` (POST)
   - Response status 200
   - Data user di response
   - Redirect ke dashboard

### 2. Dashboard Test
1. Setelah login, dashboard akan load otomatis
2. **Verify di Network tab:**
   - `auth.php?action=check` - Check session
   - `dashboard.php?action=stats` - Get statistics
   - `dashboard.php?action=popular` - Get popular events
   - `dashboard.php?action=recent` - Get recent events
3. **Verify UI:**
   - Statistik terload dengan format Rupiah
   - Event populer dan terbaru terload
   - Sidebar berfungsi (toggle)
   - Dark mode berfungsi

### 3. List Events Test
1. Klik menu "Daftar Event"
2. **Verify di Network tab:**
   - `events.php?sort=event_date&order=ASC`
3. **Test Filters:**
   - Filter by status → URL berubah: `events.php?status=open&...`
   - Search "workshop" → URL: `events.php?search=workshop&...`
   - Sort by Fee → URL: `events.php?sort=fee&order=ASC`
4. **Verify:**
   - Data ter-filter sesuai input
   - Real-time update (debounced search)

### 4. Create Event Test
1. Klik "Tambah Event"
2. **Test Validation:**
   - Submit form kosong → Error message muncul
   - Input invalid data → Real-time validation
3. Fill valid data & submit
4. **Verify di Network tab:**
   - `events.php` (POST)
   - Request payload berisi data form
   - Response 201 Created
   - Redirect ke list

### 5. Registration Test
1. Klik detail event
2. **Verify di Network tab:**
   - `events.php?id={id}` - Get event details
3. Klik "Daftar Event"
4. **Verify:**
   - `registrations.php` (POST)
   - Response sukses
   - Button berubah jadi "Sudah Terdaftar"
   - List peserta bertambah

### 6. localStorage Test
1. Buka **DevTools** → **Application** → **Local Storage**
2. **Verify data:**
   ```json
   {
     "user_activities": [
       {
         "type": "login",
         "timestamp": "2026-01-09T10:00:00.000Z",
         "data": {"username": "admin"}
       },
       {
         "type": "view_dashboard",
         "timestamp": "2026-01-09T10:01:00.000Z",
         "data": {}
       },
       {
         "type": "view_event_detail",
         "timestamp": "2026-01-09T10:05:00.000Z",
         "data": {"event_id": "1"}
       },
       {
         "type": "register_event",
         "timestamp": "2026-01-09T10:06:00.000Z",
         "data": {"event_id": "1", "event_title": "Workshop..."}
       }
     ],
     "preferences": {
       "darkMode": true,
       "sidebarCollapsed": false
     }
   }
   ```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Problem:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
- Sudah di-handle di `config.php` dengan headers:
  ```php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  ```

### Issue 2: 404 Not Found
**Problem:** API endpoint tidak ditemukan

**Solution:**
- Pastikan path API benar: `/backend/php/events.php`
- Check file permissions
- Verify Apache/Laragon running

### Issue 3: SQL Error
**Problem:** `mysqli_sql_exception: Unknown column`

**Solution:**
- Re-import `database/schema.sql`
- Check database name configuration

### Issue 4: Session Not Working
**Problem:** Auto redirect ke login meskipun sudah login

**Solution:**
- Pastikan session_start() ada di `config.php`
- Check cookie settings di browser
- Clear browser cache

### Issue 5: Validation Not Working
**Problem:** Form errors tidak muncul

**Solution:**
- Check Console untuk JavaScript errors
- Verify `utils.js` loaded
- Check error element IDs match

### Issue 6: "Invalid action" Error ⚠️
**Problem:** API mengembalikan `{success: false, message: "Invalid action"}`

**Root Cause:** Menggunakan HTTP method yang salah. Contoh kesalahan:
```
❌ SALAH: GET /backend/php/auth.php?action=login
✅ BENAR: POST /backend/php/auth.php?action=login
```

**Penjelasan:**
Backend API di file `auth.php` hanya menerima:
- **POST method:** untuk `action=login` dan `action=logout`
- **GET method:** untuk `action=check`

**Solution:**
Pastikan menggunakan method yang benar:

**Testing dengan cURL (BENAR):**
```bash
# Login - HARUS POST
curl -X POST "http://localhost/event-php/backend/php/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Check session - HARUS GET
curl -X GET "http://localhost/event-php/backend/php/auth.php?action=check"
```

**Testing dengan Browser DevTools (BENAR):**
```javascript
// Login - Menggunakan POST
fetch('http://localhost/event-php/backend/php/auth.php?action=login', {
  method: 'POST',  // ← PENTING!
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({username: 'admin', password: 'password'})
}).then(r => r.json()).then(d => console.log(d));
```

**HTTP Method Requirements:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `auth.php?action=login` | **POST** | Login |
| `auth.php?action=logout` | **POST** | Logout |
| `auth.php?action=check` | **GET** | Check session |
| `register.php` | **POST** | Register account |
| `events.php` (list) | **GET** | Get all events |
| `events.php?id={id}` | **GET** | Get single event |
| `events.php` (create) | **POST** | Create event |
| `events.php` (update) | **PUT** | Update event |
| `events.php?id={id}` (delete) | **DELETE** | Delete event |
| `registrations.php` (list) | **GET** | Get registrations |
| `registrations.php` (create) | **POST** | Register to event |
| `registrations.php` (update) | **PUT** | Update registration |
| `registrations.php?id={id}` (delete) | **DELETE** | Cancel registration |
| `dashboard.php?action=stats` | **GET** | Get statistics |
| `dashboard.php?action=popular` | **GET** | Get popular events |
| `dashboard.php?action=recent` | **GET** | Get recent events |

**PENTING:** Jangan akses login di address bar browser (itu GET request)! Gunakan form HTML atau Fetch API dengan method POST.

---

## 📸 Screenshots (Network Tab)

### Screenshot 1: Login Request
```
POST /backend/php/auth.php?action=login
Status: 200 OK
Time: 45ms
Size: 234 B

Request Headers:
  Content-Type: application/json

Request Payload:
  {username: "admin", password: "password123"}

Response:
  {success: true, message: "Login successful", data: {...}}
```

### Screenshot 2: Get Events with Filters
```
GET /backend/php/events.php?status=open&search=workshop&sort=event_date&order=ASC
Status: 200 OK
Time: 32ms
Size: 1.2 KB

Response:
  {success: true, message: "Events retrieved successfully", data: [...]}
```

### Screenshot 3: Create Event
```
POST /backend/php/events.php
Status: 201 Created
Time: 58ms
Size: 456 B

Request Payload:
  {title: "New Event", description: "...", event_date: "2026-03-20", ...}

Response:
  {success: true, message: "Event created successfully", data: {...}}
```

### Screenshot 4: Register to Event
```
POST /backend/php/registrations.php
Status: 201 Created
Time: 41ms
Size: 389 B

Request Payload:
  {event_id: 1, notes: "Pendaftaran melalui web"}

Response:
  {success: true, message: "Registration successful", data: {...}}
```

---

## ✅ Validation Features

### Real-time Validation
- Error message muncul saat blur dari field
- Error hilang saat user mulai mengetik (jika valid)
- Visual feedback dengan border merah

### Validasi Rules:
1. **Required** - Field wajib diisi
2. **minLength** - Minimal panjang karakter
3. **email** - Format email valid
4. **number** - Hanya angka
5. **min** - Nilai minimal
6. **date** - Format tanggal valid

### Example Validation Code:
```javascript
const validationRules = {
    title: {
        required: true,
        minLength: 5,
        messages: {
            required: 'Judul event wajib diisi',
            minLength: 'Judul minimal 5 karakter'
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
    }
};
```

---

## 🎯 Feature Checklist

### Soal 1 - HTML & CSS (20%) ✅
- [x] HTML5 semantic
- [x] Responsive (Flexbox/Grid)
- [x] Dashboard, List, Form pages
- [x] Tampilan rapi & konsisten

### Soal 2 - JavaScript DOM & Validasi (10%) ✅
- [x] Validasi form real-time
- [x] Error message dinamis
- [x] Submit menggunakan Fetch API

### Soal 3 - Fetch API & Dynamic Rendering (20%) ✅
- [x] Ambil data JSON dari backend
- [x] Render DOM dinamis
- [x] Filter by status
- [x] Search by title
- [x] Sort by date/title/quota/fee

### Soal 4 - Backend API (25%) ✅
- [x] PHP dengan mysqli
- [x] Prepared statements
- [x] CRUD lengkap
- [x] Response JSON

### Soal 5 - localStorage (5%) ✅
- [x] Login activity
- [x] View event activity
- [x] Register event activity
- [x] Edit event activity
- [x] Dark mode preference
- [x] Sidebar state preference

### Soal 6 - Integrasi Front-End & Back-End (10%) ✅
- [x] CRUD real-time
- [x] Dashboard dari backend
- [x] Dropdown dinamis (status filter)

### Soal 7 - Debugging & Dokumentasi (10%) ✅
- [x] debugging.md created
- [x] Network tab explanation
- [x] Request/Response examples

---

## 📝 Notes

### Best Practices Implemented:
1. **Security:**
   - Prepared statements untuk SQL injection prevention
   - Password hashing dengan `password_hash()`
   - Input sanitization
   - CSRF protection via session

2. **Performance:**
   - Debounced search (300ms)
   - Lazy loading untuk tabel besar
   - Optimized SQL queries dengan indexes

3. **UX:**
   - Loading states untuk async operations
   - Error handling yang informatif
   - Smooth animations
   - Responsive design

4. **Code Quality:**
   - Modular JavaScript (utils.js)
   - Reusable CSS components
   - Consistent naming conventions
   - Comments untuk dokumentasi

---

## 🔗 Related Files

- `README.md` - Instalasi dan overview
- `database/schema.sql` - Database structure
- `backend/php/config.php` - Configuration
- `public/js/utils.js` - Utility functions

---

**Last Updated:** 2026-01-09  
**Version:** 1.0  
**Status:** ✅ Complete
