# Event Registration System

Sistem Informasi Pendaftaran Event berbasis web menggunakan HTML5, CSS, JavaScript (Vanilla), PHP, dan MySQL.

## 📋 Deskripsi

Sistem ini memungkinkan pengguna untuk:
- Mengelola event (CRUD)
- Mendaftar sebagai peserta event
- Melihat kuota dan status pendaftaran
- Tracking riwayat pendaftaran
- Login dan Logout dengan autentikasi

## 🛠️ Teknologi yang Digunakan

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design dengan Flexbox & Grid
- **JavaScript (ES6+)** - DOM manipulation & Fetch API
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

### Backend
- **PHP** - Server-side logic
- **MySQL** - Database
- **mysqli** - Database connection dengan prepared statements

## 📁 Struktur Folder

```
event-php/
├── public/
│   ├── index.html                  # Dashboard
│   ├── login.html                  # Halaman login
│   ├── register.html               # Halaman registrasi akun baru
│   ├── public.html                 # Halaman publik (tanpa login)
│   ├── list.html                   # List event dengan filter & search
│   ├── form.html                   # Form tambah/edit event
│   ├── detail.html                 # Detail event & pendaftaran
│   ├── my-registrations.html       # Riwayat pendaftaran user
│   ├── admin-registrations.html    # Kelola pendaftaran (admin only)
│   ├── css/
│   │   └── style.css               # Main stylesheet
│   └── js/
│       ├── utils.js                # Utility functions
│       ├── list.js                 # List events logic
│       ├── form.js                 # Form validation & submit
│       └── detail.js               # Event detail & registration
├── backend/
│   └── php/
│       ├── config.php              # Database config
│       ├── auth.php                # Authentication API
│       ├── register.php            # Registration API
│       ├── events.php              # Events CRUD API
│       ├── registrations.php       # Registrations API
│       └── dashboard.php           # Dashboard stats API
├── database/
│   └── schema.sql                  # Database schema
├── docs/
│   └── debugging.md                # Debugging documentation
└── README.md                       # This file
```

## 🚀 Cara Instalasi

### 1. Prerequisites
- XAMPP / Laragon / WAMP (PHP 7.4+ dan MySQL)
- Web browser modern (Chrome, Firefox, Edge)

### 2. Clone / Download Project
```bash
# Download project ke folder htdocs/www
cd c:/laragon/www
# atau
cd c:/xampp/htdocs
```

### 3. Setup Database

1. Buka **phpMyAdmin** (http://localhost/phpmyadmin)
2. Import file `database/schema.sql`
3. Database `event_php` akan otomatis dibuat

**Atau jalankan via MySQL CLI:**
```bash
mysql -u root -p < database/schema.sql
```

### 4. Konfigurasi Database

Edit file `backend/php/config.php` jika perlu:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // default kosong
define('DB_NAME', 'event_php');
```

### 5. Jalankan Aplikasi

1. Start Apache dan MySQL
2. Buka browser:
   ```
   http://localhost/event-php/public/login.html
   ```

### 6. Login

**Akun Demo:**
- Username: `admin`
- Password: `password`

**Atau buat akun baru** (via phpMyAdmin):
```sql
INSERT INTO users (username, password, fullname, email) 
VALUES ('yourname', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Your Name', 'your@email.com');
```

## ✨ Fitur Utama

### 1. Authentication
- ✅ Registrasi akun baru
- ✅ Login dengan username & password
- ✅ Session management
- ✅ Logout
- ✅ Auto redirect jika belum login
- ✅ Halaman publik (dapat diakses tanpa login)

### 2. Dashboard
- ✅ Statistik: Total Event, Event Aktif, Total Pendaftar, Total Pendapatan
- ✅ Event Populer (berdasarkan jumlah pendaftar)
- ✅ Event Terbaru
- ✅ Format Rupiah yang rapi

### 3. Manajemen Event (CRUD)
- ✅ Tambah event baru
- ✅ Edit event existing
- ✅ Hapus event (dengan konfirmasi)
- ✅ Lihat detail event
- ✅ Filter by status (Open/Closed/Cancelled)
- ✅ Search by title/description/location
- ✅ Sort by tanggal/nama/kuota/biaya

### 4. Pendaftaran Event
- ✅ Daftar ke event yang tersedia
- ✅ Check kuota otomatis
- ✅ Validasi duplicate registration
- ✅ List peserta yang sudah daftar
- ✅ Auto update registered_count (via trigger)
- ✅ Riwayat pendaftaran user (My Registrations)
- ✅ Kelola semua pendaftaran (Admin only)
- ✅ Approve/reject pendaftaran (Admin only)
- ✅ Cancel pendaftaran

### 5. Form Validation
- ✅ Real-time validation
- ✅ Error message dinamis
- ✅ Validasi: required, minLength, email, number, date, min value

### 6. localStorage
- ✅ Login activity
- ✅ View event activity
- ✅ Registration activity
- ✅ Edit event activity
- ✅ Dark mode preference
- ✅ Sidebar state preference

### 7. UI/UX
- ✅ Sidebar dengan smooth animation (open/close)
- ✅ Sidebar rapi saat collapsed (icon only)
- ✅ Dark mode yang nyaman dibaca
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Simbol Rupiah (Rp), bukan $
- ✅ Angka tidak overflow dari card

## 🎨 Design Highlights

- **Modern UI** dengan gradient dan glassmorphism
- **Dark Mode** support penuh
- **Responsive** - Mobile-first design
- **Smooth animations** untuk transisi
- **Premium card layouts** untuk statistik
- **Clean typography** menggunakan Inter font

## 📊 Database Schema

### Tabel `users`
- id, username, password, fullname, email, created_at

### Tabel `events`
- id, title, description, event_date, event_time, location
- quota, registered_count, fee, status, created_by, created_at

### Tabel `registrations`
- id, event_id, user_id, status, registration_date, notes

**Triggers:**
- Auto update `registered_count` saat pendaftaran
- Auto close event jika kuota penuh
- Auto reopen event jika ada pembatalan

## 🔧 API Endpoints

### Authentication
- `POST /auth.php?action=login` - Login
- `POST /auth.php?action=logout` - Logout
- `GET /auth.php?action=check` - Check session
- `POST /register.php` - Register new account

### Events
- `GET /events.php` - Get all events (with filter, search, sort)
- `GET /events.php?id={id}` - Get single event
- `POST /events.php` - Create event
- `PUT /events.php` - Update event
- `DELETE /events.php?id={id}` - Delete event

### Registrations
- `GET /registrations.php` - Get user's registrations
- `GET /registrations.php?event_id={id}` - Get event's registrations
- `GET /registrations.php?all=1` - Get all registrations (Admin only)
- `GET /registrations.php?all=1&status={status}` - Get all registrations filtered by status (Admin only)
- `POST /registrations.php` - Register to event
- `PUT /registrations.php` - Update registration status
- `DELETE /registrations.php?id={id}` - Cancel registration

### Dashboard
- `GET /dashboard.php?action=stats` - Get statistics
- `GET /dashboard.php?action=popular` - Get popular events
- `GET /dashboard.php?action=recent` - Get recent events

## 🐛 Debugging & Testing

Lihat dokumentasi lengkap di `docs/debugging.md`

**Quick Test:**
1. Login dengan akun demo
2. Lihat dashboard - statistik terload
3. Buka list event - filter, search, sort berfungsi
4. Tambah event baru - validasi real-time
5. Lihat detail event - button pendaftaran smart
6. Daftar event - check kuota & duplicate
7. Check localStorage - minimal 4 activity tersimpan
8. Toggle dark mode - preferensi tersimpan
9. Toggle sidebar - state tersimpan

## 📸 Screenshots

*Akan ditambahkan di debugging.md*

## 👨‍💻 Developer

- **Nama**: [Your Name]
- **NIM**: [Your NIM]
- **Mata Kuliah**: Pemrograman Web / UAS

## 📝 License

Project ini dibuat untuk keperluan akademik (UAS).

## 🙏 Credits

- Font Awesome untuk icons
- Google Fonts untuk typography
- Inspiration dari modern web design trends
# uas_event-php-najib-zaidin-zidan-2025806006
