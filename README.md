# Indah Mom & Baby Spa Comal (indahmombabyspa.com)

Aplikasi web modern, responsif, dan lengkap untuk klinik **Indah Mom & Baby Spa Comal** yang berlokasi di Comal, Pemalang. Aplikasi ini dibangun dengan standar profesional menggunakan **React, Vite, TypeScript, Tailwind CSS, Lucide Icons, dan Supabase**, serta dioptimalkan untuk performa cepat dan arsitektur **Dual-Build Mode di Cloudflare Pages**.

---

## 🌸 Identitas Brand & Desain UI/UX
- **Brand:** Indah Mom & Baby Spa Comal
- **Domain Publik:** `indahmombabyspa.com`
- **Domain Portal Bidan:** `admin-indahspa.pages.dev` (atau subdomain custom)
- **Logo:** `public/logo.png` digunakan pada Navbar, Footer, dan Favicon browser (file asli terjaga aman).
- **Format Layanan:** **Tanpa Tampilan Harga** di seluruh website publik, form reservasi, pesan WhatsApp, maupun panel admin (fokus pada kenyamanan konsultasi & edukasi manfaat perawatan).
- **Copywriting:** Menggunakan ejaan baku **"Treatment"** dengan sapaan hangat untuk *"Bunda"* dan *"Si Kecil"*.
- **Palet Warna:**
  - **Primary:** Deep Plum / Ungu Teratai (`#5B2C6F`)
  - **Secondary/Accent:** Warm Gold (`#C59B27`) untuk tombol CTA utama, highlight, dan badge
  - **Background:** Soft Cream (`#FDFBF7`) & Clean White (`#FFFFFF`)
  - **Text:** Dark Charcoal (`#1F2937`)

---

## 🏗️ Arsitektur Dual-Build Mode (`VITE_APP_MODE`)

Proyek ini menggunakan arsitektur **Dual-Build Mode** dari satu repositori GitHub yang sama untuk menghasilkan dua aplikasi web terpisah secara fisik di Cloudflare Pages:

| Pengaturan | Mode `'public'` | Mode `'admin'` | Mode `'all'` (Default) |
| :--- | :--- | :--- | :--- |
| **Target URL** | `indahmombabyspa.com` | `admin-indahspa.pages.dev` | `localhost:5173` / Preview |
| **Fokus Pengguna** | Bunda / Pelanggan Publik | Khusus Bidan Indah & Staf | Pengembang / Local Dev |
| **Rute Root `/`** | Landing Page & Reservasi | Verifikasi PIN & Dashboard Admin | Landing Page Publik |
| **Rute Admin** | Tidak ada (redirect ke `/`) | Langsung di rute utama `/` | Akses via `/portal-bidan-indah` |
| **Isolasi Bundel JS** | Kode Admin tereliminasi 100% | Hanya modul admin & login | Memuat kedua modul |
| **SEO Indexing** | Terindeks (`index, follow`) | Disembunyikan (`noindex, nofollow`) | Sesuai rute |

### Keunggulan Arsitektur:
1. **Keamanan Maksimal:** Kode dashboard admin, fungsi manipulasi data, dan komponen sensitif dihilangkan dari bundel JS web publik melalui tree-shaking Rollup & dynamic lazy import.
2. **Kenyamanan Bidan:** Bidan tidak perlu mengetik path rahasia yang panjang di browser HP; cukup membuka URL portal admin dan langsung disambut keypad PIN.
3. **Privasi dari Search Engine:** Tag `<meta name="robots" content="noindex, nofollow" />` ditambahkan secara otomatis pada mode admin.
4. **Satu Repositori:** Pembaruan tipe data, skema database, atau komponen bersama tetap terpusat dalam satu repo GitHub tanpa sinkronisasi ganda.

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
- **Navbar:** Logo klinik, link navigasi smooth scroll, tombol "Konsultasi WA", dan "Reservasi Sekarang" (tanpa ada tautan/tombol admin).
- **Hero Section:** Headline hangat, trust badges (Bidan bersertifikat, bahan 100% organik, ruang steril, homecare Comal & sekitarnya), tombol CTA booking jadwal & konsultasi WA.
- **Katalog Layanan (3 Kategori Tab):** Tab interaktif dengan hitungan layanan, badge kategori, manfaat lengkap, durasi, target usia, dan tombol *"Pilih Layanan Ini"* (tanpa nominal harga).
- **Profil Bidan & Keunggulan:** Kualifikasi medis Bidan Indah, pendekatan gentle care, kebersihan ruang klinik, dan jangkauan homecare (Comal, Ulujami, Ampelgading, Bodeh, Petarukan, Sragi).
- **Panduan Cara Reservasi & Testimoni:** 4 langkah mudah serta cerita kepuasan dari Bunda di Comal dengan filter kategori ulasan.
- **Lokasi & Kontak:** Alamat klinik, jam operasional, peta Google Maps embed, tombol navigasi rute, dan link WhatsApp & Instagram.
- **Footer:** Rangkuman layanan resmi, kontak, dan hak cipta.

### 2. Alur Reservasi Pintar (Multi-Step Wizard)
1. **Langkah 1 (Tipe & Layanan):** Pilih kunjungan *Datang ke Klinik* atau *Homecare - Bidan ke Rumah*, dan pilih paket layanan dari 12 treatment resmi.
2. **Langkah 2 (Tanggal & Slot Jam Real-Time):** Pilih tanggal dan jam operasional. Slot yang telah terisi (`confirmed`) atau ditutup libur admin otomatis nonaktif berlabel *"Penuh"* / *"Libur"*.
3. **Langkah 3 (Data Bunda & Si Kecil):** Input nama Bunda, kontak WA, anak, usia, alamat lengkap, dan catatan khusus (tersimpan di `localStorage` untuk kemudahan order berikutnya).
4. **Langkah 4 (Konfirmasi & WhatsApp):** Ringkasan pesanan disimpan ke tabel `bookings` Supabase dengan status `'pending'` dan langsung membuka chat WhatsApp resmi Bidan.

### 3. Panel Admin Khusus Bidan
- **Proteksi PIN Berbasis Hash SHA-256:** Verifikasi PIN menggunakan Web Crypto API (`crypto.subtle.digest`) terhadap `VITE_ADMIN_PIN_HASH` tanpa mengekspos PIN mentah dalam kode UI browser.
- **Sistem Anti-Brute-Force:** Kunci keypad virtual secara otomatis selama **15 menit** jika terjadi **5 kali** kesalahan input PIN berturut-turut, lengkap dengan indikator hitung mundur waktu tunggu (`mm:ss`).
- **Keamanan Sesi & Auto-Lock:** Status login disimpan di `sessionStorage` dengan batas waktu sesi aktif maksimal **2 jam** serta *idle auto-lock* setelah **30 menit** tanpa interaksi mouse/keyboard.
- **Tab 1: Reservasi & Jadwal:** Filter tanggal & status, konfirmasi slot, batalkan, selesaikan, kirim pengingat WA H-1, dan input booking manual.
- **Tab 2: Kelola Layanan:** CRUD katalog layanan (tambah, edit, toggle aktif/nonaktif, hapus).
- **Tab 3: Ulasan & Testimoni:** Kelola ulasan pelanggan, moderasi foto, edit testimoni, dan tambah ulasan manual.
- **Tab 4: Tutup Jadwal / Hari Libur:** Blokir tanggal/jam tertentu saat cuti.
- **Tab 5: Pengaturan Klinik:** Update kontak WA, alamat klinik, dan ubah PIN Admin.

---

## 🗄️ Database Supabase (`supabase/schema.sql`)

Skrip SQL lengkap yang telah disiapkan tersedia di:
👉 [supabase/schema.sql](file:///d:/PROJEK%20INDAH%20MOM%20BABY%26SPA/supabase/schema.sql)

### Struktur Tabel:
1. `services`: Data 12 treatment resmi, durasi, target usia, `price` opsional (default 0), dan status aktif.
2. `bookings`: Data reservasi pasien, kode booking unik, nama Bunda, kontak WA, anak, tanggal, jam, status, dan alamat.
3. `testimonials`: Data testimoni pelanggan, rating, foto dokumentasi, dan status publikasi.
4. `blocked_slots`: Data tanggal/jam libur yang ditutup oleh Bidan.
5. `app_settings`: Pengaturan nama klinik, nomor WhatsApp, alamat, dan PIN Admin.

### Kebijakan Row Level Security (RLS) Ketat:
- **`bookings`:** Pengunjung publik hanya diizinkan melakukan operasi `INSERT` (reservasi mandiri). Seluruh operasi `SELECT`, `UPDATE`, dan `DELETE` hanya diizinkan untuk peran `authenticated` (Bidan/Admin terautentikasi).
- **`blocked_slots`:** Seluruh operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` hanya diizinkan untuk peran `authenticated`. Ketersediaan slot publik dihitung lewat fungsi RPC `SECURITY DEFINER` `get_booked_slots(date)`.
- **`testimonials`:** Seluruh operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` hanya diizinkan untuk peran `authenticated`.
- **`services` & `app_settings`:** Pengunjung publik hanya dapat membaca data yang aktif/publik; manipulasi data hanya untuk `authenticated`.

---

## 🚀 Panduan Deploy Dual-Project ke Cloudflare Pages

Dari **satu repositori GitHub yang sama**, Anda akan membuat **dua project Pages terpisah** di dashboard Cloudflare:

### Project 1: Web Publik Pelanggan (`indahmombabyspa.com`)
1. Buka dashboard Cloudflare > **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repositori `Indah-Mom-Baby-Spa-Comal`.
3. Masukkan konfigurasi build:
   - **Project Name:** `indah-mom-baby-spa` (atau sesuaikan)
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Buka tab **Environment variables (Production & Preview)**, lalu tambahkan:
   - `VITE_APP_MODE` = `public`
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
5. Klik **Save and Deploy**.
6. Hubungkan custom domain `indahmombabyspa.com` pada menu **Custom Domains**.

---

### Project 2: Portal Admin Khusus Bidan (`admin-indahspa.pages.dev`)
1. Di dashboard Cloudflare Pages, klik kembali **Create application** > **Pages** > **Connect to Git**.
2. Pilih kembali repositori GitHub yang sama (`Indah-Mom-Baby-Spa-Comal`).
3. Masukkan konfigurasi build:
   - **Project Name:** `admin-indahspa`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Buka tab **Environment variables (Production & Preview)**, lalu tambahkan:
   - `VITE_APP_MODE` = `admin`
   - `VITE_ADMIN_PIN_HASH` = `8d969eef6ecad3c29a3a62928` *(hash dari PIN rahasia Anda)*
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`

---

## 💻 Panduan Pengembangan Lokal

Untuk menjalankan aplikasi secara lokal di komputer pengembang:

```bash
# 1. Install dependensi
npm install

# 2. Jalankan development server (mode 'all' aktif secara default)
npm run dev
```

Pada mode `all`:
- Buka `http://localhost:5173/` untuk melihat web pelanggan.
- Buka `http://localhost:5173/portal-bidan-indah` untuk membuka panel admin.

Untuk mengetes simulasi mode produksi tertentu secara lokal:
```bash
# Test Mode Publik saja
$env:VITE_APP_MODE="public"; npm run build; npm run preview

# Test Mode Admin saja
$env:VITE_APP_MODE="admin"; npm run build; npm run preview
```

---

## 🛡️ Aturan Arsitektur & Standar Pengembangan (AI Project Rules)

1. **Dual-Mode Data Layer (LocalStorage Fallback + Supabase Ready):**
   - Proyek mendukung penyimpanan lokal (`localStorage`) sebagai fallback otomatis agar dapat langsung dites di browser, sekaligus siap beralih otomatis ke Supabase begitu `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` diisi.
2. **Sinkronisasi Otomatis `supabase/schema.sql`:**
   - Setiap penambahan atau perubahan struktur tabel, kolom, storage bucket, maupun kebijakan RLS WAJIB langsung dicatat dan diperbarui ke dalam `supabase/schema.sql` menggunakan sintaks idempotent.
3. **Isolasi & Keamanan Portal Admin (`/portal-bidan-indah`):**
   - Jangan pernah menampilkan tombol, ikon, atau tautan menuju panel admin di halaman publik pelanggan (`Navbar`, `Footer`, dll.).
   - Rute `/admin` dan rute tidak dikenal (`*`) wajib di-redirect ke beranda (`/`), dan komponen admin tidak boleh di-render sebelum PIN terverifikasi.
4. **Standar UI & Responsivitas Mobile:**
   - Pastikan seluruh halaman bebas *horizontal overflow* di layar HP (`overflow-x-hidden`), tetap menjaga palet warna utama Deep Plum (`#4A154B`), Warm Gold (`#D4AF37`), dan Soft Cream (`#FAF6F0`), serta animasi ringan.
5. **Arsitektur Dual-Build Mode Cloudflare Pages (`VITE_APP_MODE`):**
   - Mendukung pemisahan build fisik untuk domain publik (`VITE_APP_MODE=public`) dan portal admin (`VITE_APP_MODE=admin`) dengan eliminasi kode via Rollup tree-shaking dan noindex robot meta tag.
6. **Keamanan Autentikasi Admin & Proteksi Anti-Brute-Force (`AdminPortal.tsx`, `AdminLogin.tsx`):**
   - Dilarang menampilkan teks PIN mentah di antarmuka UI.
   - Verifikasi PIN berbasis hash SHA-256 via Web Crypto API dicocokkan dengan `VITE_ADMIN_PIN_HASH`.
   - Lockout anti-brute-force: 5x kegagalan mengunci keypad selama 15 menit dengan hitung mundur langsung.
   - Sesi di `sessionStorage` dengan batas maksimal 2 jam dan *idle auto-lock* 30 menit.
7. **Kebijakan Row Level Security (RLS) Supabase Ketat:**
   - Seluruh operasi `SELECT`, `UPDATE`, dan `DELETE` pada tabel `bookings`, `blocked_slots`, dan `testimonials` hanya diizinkan untuk peran `authenticated`.
   - Publik anonim hanya diizinkan melakukan `INSERT` pada tabel `bookings` dan membaca ketersediaan slot melalui RPC `SECURITY DEFINER` `get_booked_slots`.
