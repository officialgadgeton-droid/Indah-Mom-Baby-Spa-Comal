# Indah Mom & Baby Spa — Proyek Aplikasi Android Native (Kotlin)

Aplikasi Android resmi untuk **Indah Mom & Baby Spa Comal** (`com.indahmombabyspa.app`), dibangun menggunakan **Kotlin**, **Gradle Kotlin DSL (`.kts`)**, dengan `minSdk 24` (Android 7.0+) dan `targetSdk 34` (Android 14).

---

## 🌟 Fitur Utama Aplikasi

1. **WebView Dinamis (Sekali Build Tanpa Perlu Re-Build Saat Web Update):**
   - Memuat langsung URL `https://indahmombabyspa.com`.
   - Dilengkapi *Pull-To-Refresh* (`SwipeRefreshLayout`) dengan palet warna Deep Plum (`#4A154B`) dan Warm Gold (`#D4AF37`).
   - Indikator progres horizontal tipis di bagian atas layar (`WebChromeClient`).
   - Penanganan tombol Back Android (`OnBackPressedCallback`) untuk riwayat halaman web (`webView.goBack()`).

2. **Integrasi Intent Aplikasi Pihak Ketiga:**
   - **WhatsApp & WA Business:** Menangani tautan `wa.me`, `api.whatsapp.com`, dan `whatsapp://` langsung ke aplikasi WhatsApp resmi pengguna.
   - **Google Maps:** Membuka tautan lokasi dan rute ke aplikasi Google Maps asli (`com.google.android.apps.maps`).
   - **Telepon & Email:** Mendukung panggilan instan (`tel:`) dan pengiriman email (`mailto:`).
   - Tautan media sosial eksternal (Instagram, TikTok) dibuka melalui browser eksternal.

3. **Halaman Offline Elegan (Brand Matching):**
   - Jika koneksi terputus atau gagal terhubung ke server, aplikasi menampilkan tampilan offline ramah bertema Soft Cream (`#FAF6F0`) dan tombol *Coba Muat Ulang* tanpa tampilan layar putih/browser error bawaan.

4. **Izin Minimal & Ramah Google Play Protect:**
   - Hanya mendeklarasikan izin esensial: `INTERNET`, `ACCESS_NETWORK_STATE`, dan `POST_NOTIFICATIONS`.
   - **Tanpa** izin kamera, penyimpanan, atau lokasi sehingga aman dari peringatan Google Play Protect saat proses instalasi file `.apks` / `.aab`.

5. **Notifikasi Latar Belakang Otomatis (`WorkManager` + Supabase REST):**
   - `ClinicNotificationWorker` dijadwalkan berjalan berkala setiap **15 menit** dengan syarat koneksi internet aktif (`NetworkType.CONNECTED`).
   - Menghubungi Supabase REST API secara ringan (tanpa dependensi SDK berat):
     - Memantau perubahan status operasional klinik (`clinic_settings` -> `busy_homecare`, `closed_today`, `open`).
     - Memantau pengumuman / tips terbaru dari Bidan (`clinic_announcements`).
   - Mengirimkan *Native Push Notification* ke perangkat pengguna dengan channel `Pengumuman & Info Klinik`.

---

## 📁 Struktur Direktori Proyek

```text
android/
├── settings.gradle.kts           # Konfigurasi plugin, repository & nama root project
├── build.gradle.kts              # Top-level Gradle Kotlin DSL
├── gradle.properties             # Alokasi memori JVM & variabel Supabase API
├── gradlew.bat                   # Gradle wrapper script untuk Windows
├── gradle/
│   └── wrapper/
│       └── gradle-wrapper.properties
└── app/
    ├── build.gradle.kts          # Konfigurasi modul app (minSdk 24, targetSdk 34, dependencies)
    ├── proguard-rules.pro        # Aturan ProGuard untuk r8 optimization
    └── src/
        └── main/
            ├── AndroidManifest.xml # Izin minimal, package queries, & launcher activity
            ├── java/com/indahmombabyspa/app/
            │   ├── MainActivity.kt            # Controller WebView, intent handler, & UI state
            │   └── ClinicNotificationWorker.kt # Worker background HTTP GET ke Supabase
            └── res/
                ├── drawable/
                │   ├── ic_launcher_background.xml # Gradient Deep Plum
                │   ├── ic_launcher_foreground.xml # Logo Bunga Teratai & Kasih Ibu-Bayi (Warm Gold)
                │   ├── ic_notification.xml        # Ikon status bar notifikasi monokrom
                │   ├── ic_wifi_off.xml            # Ikon status offline
                │   ├── bg_offline_card.xml        # Card krem melengkung
                │   └── btn_primary_rounded.xml    # Tombol aksi Deep Plum dengan efek ripple
                ├── layout/
                │   └── activity_main.xml          # Layout WebView, SwipeRefresh, & Offline view
                ├── mipmap-anydpi-v26/
                │   ├── ic_launcher.xml            # Adaptive Icon Android 8.0+
                │   └── ic_launcher_round.xml
                └── values/
                    ├── colors.xml                 # Palet Deep Plum, Warm Gold, & Soft Cream
                    ├── strings.xml                # Teks aplikasi & channel notifikasi
                    └── themes.xml                 # Tema Material DayNight tanpa ActionBar
```

---

## 🚀 Panduan Membuka & Mem-build di Android Studio

### 1. Membuka Proyek
1. Buka **Android Studio** (Koala, Hedgehog, Iguana, atau yang lebih baru).
2. Pilih menu **File > Open...**
3. Arahkan ke folder:
   ```text
   d:\PROJEK INDAH MOM BABY&SPA\android
   ```
   *(Pilih folder `android`, bukan folder root website)*.
4. Tunggu proses **Gradle Sync** mengunduh dependensi (sekitar 1-2 menit pada sinkronisasi awal).

### 2. Konfigurasi Variabel Supabase (Opsional)
Buka file `android/gradle.properties`, lalu perbarui nilai jika Supabase produksi Anda sudah aktif:
```properties
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Nilai ini akan otomatis disuntikkan ke dalam `BuildConfig.SUPABASE_URL` dan `BuildConfig.SUPABASE_ANON_KEY` saat proses build)*.

### 3. Menjalankan di Emulator / HP Asli
1. Sambungkan HP Android via kabel USB dengan opsi **USB Debugging** aktif, atau jalankan emulator Android Studio.
2. Klik tombol hijau **Run 'app'** (`Shift + F10`).

### 4. Menghasilkan File APK Debug
Buka tab **Terminal** di Android Studio atau PowerShell di dalam folder `android/`, lalu jalankan:
```bash
./gradlew assembleDebug
```
File APK debug akan dihasilkan di:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 5. Menghasilkan Bundle Produksi (.aab) untuk Google Play Store
Pilih menu:
**Build > Generate Signed Bundle / APK... > Android App Bundle**
Pilih / buat keystore Anda, lalu selesaikan wizard build. File `.aab` siap diunggah ke Google Play Console!
