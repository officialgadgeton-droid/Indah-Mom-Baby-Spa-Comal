# Indah Mom & Baby Spa Comal (indahmombabyspa.com)

Aplikasi web modern, responsif, dan lengkap untuk klinik **Indah Mom & Baby Spa Comal** yang berlokasi di Comal, Pemalang. Aplikasi ini dibangun dengan standar profesional menggunakan **React, Vite, TypeScript, Tailwind CSS, Lucide Icons, dan Supabase**, serta dioptimalkan untuk performa cepat dan siap dideploy ke **Cloudflare Pages**.

---

## 🌸 Identitas Brand & Desain UI/UX
- **Brand:** Indah Mom & Baby Spa Comal
- **Domain Target:** `indahmombabyspa.com`
- **Logo:** `public/logo.png` digunakan pada Navbar, Footer, dan Favicon browser (file asli terjaga aman).
- **Format Layanan:** **Tanpa Tampilan Harga** di seluruh website publik, form reservasi, pesan WhatsApp, maupun panel admin (fokus pada kenyamanan konsultasi & edukasi manfaat perawatan).
- **Copywriting:** Menggunakan ejaan baku **"Treatment"** dengan sapaan hangat untuk *"Bunda"* dan *"Si Kecil"*.
- **Palet Warna:**
  - **Primary:** Deep Plum / Ungu Teratai (`#5B2C6F`)
  - **Secondary/Accent:** Warm Gold (`#C59B27`) untuk tombol CTA utama, highlight, dan badge
  - **Background:** Soft Cream (`#FDFBF7`) & Clean White (`#FFFFFF`)
  - **Text:** Dark Charcoal (`#1F2937`)

---

## 📋 Katalog Layanan Resmi (12 Layanan dalam 3 Kategori)

### 1. Baby & Kids Treatment
1. **Pijat Bayi Sehat** — Pijat lembut menyeluruh untuk relaksasi, melancarkan peredaran darah, dan meningkatkan kualitas tidur bayi.
2. **Baby Spa (Gymball, Swim, Massage)** — Rangkaian stimulasi motorik dengan gymball, berenang air hangat dengan pelampung aman, dan pijat relaksasi.
3. **Pijat Terapi (Bapil, Kolik, Diare, Sembelit, Nafsu Makan)** — Pijat pediatrik khusus untuk membantu meredakan keluhan batuk pilek, kembung/kolik, gangguan pencernaan, serta meningkatkan nafsu makan anak.
4. **Perawatan Newborn (Bayi Baru Lahir)** — Perawatan lembut khusus bayi baru lahir meliputi memandikan, perawatan tali pusat, dan pijat ringan yang aman.
5. **Tindik Steril (Minim Nyeri Tanpa Darah)** — Layanan tindik telinga higienis menggunakan alat steril sekali pakai yang minim nyeri dan tanpa pendarahan.
6. **Cukur Gundul** — Cukur rambut bayi bersih dan higienis oleh Bidan dengan peralatan steril serta penuh ketelitian.

### 2. Terapi & Paket Spesial
1. **Paket Bapil (Sinar, Massage, Uap)** — Paket perawatan lengkap untuk melegakan pernapasan Si Kecil saat batuk pilek dengan terapi sinar inframerah, pijat terapi, dan uap/nebulizer.
2. **Nebulizer / Uap** — Terapi inhalasi uap untuk membantu mengencerkan dahak dan melegakan saluran pernapasan bayi maupun anak.
3. **Sinar Inframerah** — Terapi hangat sinar inframerah untuk membantu melancarkan aliran darah, menghangatkan tubuh, dan meredakan gejala flu/bapil.
4. **Paket Mom & Baby Post Persalinan** — Perawatan pemulihan terpadu untuk Bunda pasca melahirkan sekaligus perawatan lembut untuk bayi baru lahir.

### 3. Mom Treatment
1. **Mom Treatment (Pijat Hamil, Nifas, Laktasi, Oksitosin)** — Rangkaian pijat khusus ibu: pijat ibu hamil untuk meredakan pegal, pijat nifas pemulihan pasca bersalin, serta pijat laktasi & oksitosin untuk melancarkan ASI.
2. **Facial, Totok Wajah & Masker** — Perawatan relaksasi wajah untuk menyegarkan kulit, melancarkan peredaran darah area wajah, dan mengurangi kelelahan Bunda.

---

## ✨ Fitur Utama Sistem

### 1. Landing Page Interaktif & Responsif
- **Navbar:** Logo klinik, link navigasi smooth scroll, tombol "Konsultasi WA", "Reservasi Sekarang", dan ikon akses area Bidan/Admin.
- **Hero Section:** Headline hangat, trust badges (Bidan bersertifikat, bahan 100% organik, ruang steril, homecare Comal & sekitarnya), tombol CTA booking jadwal & konsultasi WA.
- **Katalog Layanan (3 Kategori Tab):** Tab interaktif dengan hitungan layanan, badge kategori, manfaat lengkap, durasi, target usia, dan tombol *"Pilih Layanan Ini"* (tanpa nominal harga).
- **Profil Bidan & Keunggulan:** Kualifikasi medis Bidan Indah, pendekatan gentle care, kebersihan ruang klinik, dan jangkauan homecare (Comal, Ulujami, Ampelgading, Bodeh, Petarukan, Sragi).
- **Panduan Cara Reservasi & Testimoni:** 4 langkah mudah serta cerita kepuasan dari Bunda di Comal.
- **Lokasi & Kontak:** Alamat klinik, jam operasional (08:30 - 17:30 WIB), peta Google Maps embed, tombol navigasi rute, dan link WhatsApp & Instagram.
- **Footer:** Rangkuman layanan resmi, kontak, hak cipta, dan shortcut ke `/admin`.

### 2. Alur Reservasi Pintar (Multi-Step Wizard)
1. **Langkah 1 (Tipe & Layanan):** Pilih kunjungan *Datang ke Klinik* atau *Homecare - Bidan ke Rumah*, dan pilih paket layanan dari 12 treatment resmi.
2. **Langkah 2 (Tanggal & Slot Jam Real-Time):** Pilih tanggal (hari ini/masa depan) dan pilih jam (`08:30`, `10:00`, `11:30`, `13:30`, `15:00`, `16:30`). Jika slot sudah terisi (`confirmed`) atau ditutup libur admin, tombol otomatis nonaktif berlabel *"Penuh"* / *"Libur"*.
3. **Langkah 3 (Data Bunda & Si Kecil):** Input nama Bunda, nomor WhatsApp aktif, nama anak, usia anak, alamat lengkap (wajib jika homecare), dan catatan/keluhan khusus. Data tersimpan di `localStorage` untuk kemudahan pengisian otomatis berikutnya.
4. **Langkah 4 (Konfirmasi & WhatsApp):** Ringkasan pesanan (tanpa harga). Saat diklik:
   - Data tersimpan otomatis ke tabel `bookings` di Supabase dengan status `'pending'` dan kode booking unik (misal: `IMB-20261122-A1B2`).
   - Otomatis membuka chat WhatsApp resmi Bidan dengan format rincian pesanan yang rapi.
   - Menampilkan modal sukses dengan kode booking dan tombol cepat ke WA.

### 3. Panel Admin Khusus Bidan (`/admin`)
- **Proteksi PIN 6 Digit:** Dilindungi PIN angka tanpa registrasi email rumit (PIN bawaan: `123456`).
- **Keypad Virtual Anti-Password Prompt:** Mencegah browser memunculkan dialog simpan sandi.
- **Opsi "Ingat Sesi di Tab Ini"** via `sessionStorage` & tombol Keluar (Logout).
- **Tab 1: Daftar Reservasi & Jadwal:** Filter tanggal & status (`pending`, `confirmed`, `completed`, `cancelled`), tombol **Konfirmasi Jadwal** (kunci slot publik secara otomatis), **Selesai**, **Batalkan**, tombol **"Kirim Pengingat WA"** (pesan pengingat jadwal H-1 ke Bunda), serta **"+ Tambah Booking Manual"**.
- **Tab 2: Kelola Layanan:** CRUD lengkap (Tambah layanan baru, edit durasi/usia/deskripsi, toggle aktif/nonaktif, dan hapus layanan).
- **Tab 3: Tutup Jadwal / Hari Libur (`blocked_slots`):** Form untuk memblokir tanggal tertentu (seharian penuh atau jam spesifik) saat Bidan cuti/praktik luar.
- **Tab 4: Pengaturan Klinik:** Ubah nomor WhatsApp resmi klinik, alamat, dan ganti PIN Admin 6 digit.

---

## 🗄️ Database Supabase (`supabase/schema.sql`)

Skrip SQL lengkap yang telah ditulis ulang dari awal tersedia di:
👉 [supabase/schema.sql](file:///d:/PROJEK%20INDAH%20MOM%20BABY%26SPA/supabase/schema.sql)

### Struktur Tabel:
1. `services`: Data 12 katalog treatment resmi, durasi, target usia, `price` opsional (default 0), dan status aktif.
2. `bookings`: Data reservasi pasien, kode booking unik, nama Bunda, kontak WA, anak, tanggal, jam, status, dan alamat.
3. `blocked_slots`: Data tanggal/jam libur yang ditutup oleh Bidan.
4. `app_settings`: Pengaturan nama klinik, nomor WhatsApp, alamat, dan PIN Admin.

### Keamanan & RPC Functions:
- **Row Level Security (RLS)** aktif di seluruh tabel.
- Publik hanya bisa `SELECT` layanan aktif, `SELECT` slot libur, dan `INSERT` reservasi baru.
- Fungsi RPC `get_booked_slots(target_date)` dengan `SECURITY DEFINER` mengembalikan jam yang telah terkonfirmasi/libur tanpa mengekspos data pribadi pasien lain.
- Fungsi RPC Admin memvalidasi PIN di sisi database sebelum melakukan perubahan data.

---

## 🚀 Panduan Eksekusi di Supabase & Cloudflare Pages

### 1. Terapkan SQL ke Supabase:
1. Buka dashboard [supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Buka file [supabase/schema.sql](file:///d:/PROJEK%20INDAH%20MOM%20BABY%26SPA/supabase/schema.sql), salin seluruh kodenya, lalu klik tombol **Run**.
4. Semua 4 tabel, RLS, 8 RPC functions, dan 12 data layanan resmi akan langsung terbuat dengan sukses.

### 2. Hubungkan Proyek ke Supabase:
Buat file `.env` di root project berdasarkan `.env.example`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Deploy ke Cloudflare Pages:
1. Push proyek ke GitHub / GitLab.
2. Buka dashboard Cloudflare Pages > **Create application** > **Pages** > **Connect to Git**.
3. Konfigurasi build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. File `public/_redirects` (`/* /index.html 200`) telah tersedia sehingga navigasi `/admin` bekerja lancar tanpa error 404.
