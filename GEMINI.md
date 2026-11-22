# Aturan Arsitektur & Standar Pengembangan (AI Project Rules)

Dokumen ini berisi aturan arsitektur wajib untuk AI Assistant dan pengembang dalam memelihara serta mengembangkan proyek **Indah Mom & Baby Spa Comal**:

1. **Dual-Mode Data Layer (LocalStorage Fallback + Supabase Ready):**
   - Proyek saat ini berjalan dalam mode preview tanpa koneksi Supabase aktif. Setiap fitur yang memanipulasi data (reservasi, jadwal terblokir, layanan, testimoni) WAJIB mendukung penyimpanan lokal (`localStorage`) sebagai fallback otomatis agar dapat langsung dites di browser, sekaligus siap beralih otomatis ke Supabase begitu `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` diisi.

2. **Sinkronisasi Otomatis `supabase/schema.sql`:**
   - Setiap penambahan atau perubahan struktur tabel, kolom, storage bucket, maupun kebijakan RLS WAJIB langsung dicatat dan diperbarui ke dalam satu file terpusat `supabase/schema.sql` menggunakan sintaks idempotent (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`) agar siap dijalankan sekali klik di SQL Editor Supabase nantinya.

3. **Isolasi & Keamanan Portal Admin (`/portal-bidan-indah`):**
   - Jangan pernah menampilkan tombol, ikon, atau tautan menuju panel admin di halaman publik pelanggan (`Navbar`, `Footer`, dll.).
   - Rute `/admin` dan rute tidak dikenal (`*`) wajib di-redirect ke beranda (`/`), dan komponen admin tidak boleh di-render sebelum PIN terverifikasi.

4. **Standar UI & Responsivitas Mobile:**
   - Pastikan seluruh halaman bebas *horizontal overflow* di layar HP (`overflow-x-hidden`), tetap menjaga palet warna utama Deep Plum (`#4A154B`), Warm Gold (`#D4AF37`), dan Soft Cream (`#FAF6F0`), serta menjaga animasi tetap ringan tanpa library berat tambahan.

5. **Arsitektur Dual-Build Mode Cloudflare Pages (`VITE_APP_MODE`):**
   - Satu repositori GitHub yang sama di-deploy menjadi **dua project terpisah secara fisik** di Cloudflare Pages guna mencegah kebocoran kode admin ke publik:
     - **Mode `'public'` (untuk `indahmombabyspa.com`):**
       - Set Environment Variable di Cloudflare Pages: `VITE_APP_MODE=public`.
       - Hanya merender web publik pelanggan (`Navbar`, `Hero`, `Services`, `About`, `HowToBook`, `BookingWizard`, `Testimonials`, `Location`, `Footer`).
       - Modul admin tidak di-import/diikutsertakan sama sekali dalam bundel JS produksi berkat conditional dynamic import & Rollup tree-shaking.
       - Seluruh rute selain `/` otomatis di-redirect ke `/`.
     - **Mode `'admin'` (untuk `admin-indahspa.pages.dev` / portal Bidan):**
       - Set Environment Variable di Cloudflare Pages: `VITE_APP_MODE=admin`.
       - Rute root `/` langsung merender verifikasi PIN & Dashboard Admin (tanpa perlu mengetik subpath khusus).
       - Otomatis menyuntikkan tag `<meta name="robots" content="noindex, nofollow" />` agar tidak terindeks mesin pencari.
     - **Mode `'all'` (default lokal & preview sementara):**
       - Nilai bawaan jika `VITE_APP_MODE` tidak didefinisikan atau bernilai `all`.
       - Rute `/` merender web publik pelanggan, dan `/portal-bidan-indah` merender panel admin (rute `/admin` di-redirect ke `/`).
