-- ====================================================================
-- SKEMA DATABASE INDAH MOM & BABY SPA COMAL (indahmombabyspa.com)
-- REVISI LENGKAP: 12 LAYANAN RESMI, TANPA TAMPILAN HARGA, HASH SHA-256 PIN ADMIN
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABEL LAYANAN (SERVICES)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(60) NOT NULL CHECK (category IN ('Baby & Kids Treatment', 'Terapi & Paket Spesial', 'Mom Treatment')),
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    price NUMERIC(12,2) DEFAULT 0,
    target_age VARCHAR(100),
    age_range VARCHAR(100),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Idempotent column migrations for existing databases
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS target_age VARCHAR(100);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS age_range VARCHAR(100);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON public.services(sort_order);

-- 2. TABEL RESERVASI (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('Datang ke Klinik', 'Homecare - Bidan ke Rumah')),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name VARCHAR(150) NOT NULL,
    service_price NUMERIC(12,2) DEFAULT 0,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(100) NOT NULL,
    mom_name VARCHAR(150) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    child_name VARCHAR(150),
    child_age VARCHAR(50),
    address TEXT,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Pastikan kolom booking_time dapat menampung nama sesi & jam final fleksibel (hingga 100 karakter)
ALTER TABLE public.bookings ALTER COLUMN booking_time TYPE VARCHAR(100);

-- Kolom Rekam Tindakan Bidan & Catatan Berat Badan
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS treatment_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS baby_weight_kg VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(booking_code);

-- 3. TABEL SLOT LIBUR / DIBLOKIR (BLOCKED_SLOTS)
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_date DATE NOT NULL,
    block_time VARCHAR(20), -- jika NULL berarti libur seharian penuh
    reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON public.blocked_slots(block_date);

-- 4. TABEL PENGATURAN KLINIK (APP_SETTINGS)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL TESTIMONI WHATSAPP (TESTIMONIALS)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- 6. TABEL PENGATURAN KLINIK & HASH PIN KEAMANAN (CLINIC_SETTINGS)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Kolom Status Operasional Real-Time & Identitas Publik Klinik
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255) DEFAULT 'Indah Mom & Baby Spa Comal';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'open';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS operational_note TEXT;

-- Baris default status operasional di clinic_settings
INSERT INTO public.clinic_settings (key, value, operational_status, operational_note, updated_at)
VALUES ('clinic_operational_status', 'open', 'open', NULL, timezone('utc'::text, now()))
ON CONFLICT (key) DO UPDATE
SET operational_status = COALESCE(public.clinic_settings.operational_status, 'open');

-- ====================================================================
-- SEED DATA AWAL: 12 LAYANAN RESMI KATALOG BARU
-- ====================================================================

-- Bersihkan data lama jika ada
DELETE FROM public.services;

INSERT INTO public.services (category, name, description, duration_minutes, price, target_age, age_range, sort_order, is_active)
VALUES
    -- Kategori 1: Baby & Kids Treatment
    ('Baby & Kids Treatment', 'Pijat Bayi Sehat', 'Pijat lembut menyeluruh untuk relaksasi, melancarkan peredaran darah, dan meningkatkan kualitas tidur bayi.', 40, 0, '0 - 24 Bulan', '0 - 24 Bulan', 1, true),
    ('Baby & Kids Treatment', 'Baby Spa (Gymball, Swim, Massage)', 'Rangkaian stimulasi motorik dengan gymball, berenang air hangat dengan pelampung aman, dan pijat relaksasi.', 50, 0, '1 - 24 Bulan', '1 - 24 Bulan', 2, true),
    ('Baby & Kids Treatment', 'Pijat Terapi (Bapil, Kolik, Diare, Sembelit, Nafsu Makan)', 'Pijat pediatrik khusus untuk membantu meredakan keluhan batuk pilek, kembung/kolik, gangguan pencernaan, serta meningkatkan nafsu makan anak.', 45, 0, '0 - 5 Tahun', '0 - 5 Tahun', 3, true),
    ('Baby & Kids Treatment', 'Perawatan Newborn (Bayi Baru Lahir)', 'Perawatan lembut khusus bayi baru lahir meliputi memandikan, perawatan tali pusat, dan pijat ringan yang aman.', 45, 0, '0 - 40 Hari', '0 - 40 Hari', 4, true),
    ('Baby & Kids Treatment', 'Tindik Steril (Minim Nyeri Tanpa Darah)', 'Layanan tindik telinga higienis menggunakan alat steril sekali pakai yang minim nyeri dan tanpa pendarahan.', 25, 0, 'Bayi & Anak', 'Bayi & Anak', 5, true),
    ('Baby & Kids Treatment', 'Cukur Gundul', 'Cukur rambut bayi bersih dan higienis oleh Bidan dengan peralatan steril serta penuh ketelitian.', 30, 0, '0 - 12 Bulan', '0 - 12 Bulan', 6, true),

    -- Kategori 2: Terapi & Paket Spesial
    ('Terapi & Paket Spesial', 'Paket Bapil (Sinar, Massage, Uap)', 'Paket perawatan lengkap untuk melegakan pernapasan Si Kecil saat batuk pilek dengan terapi sinar inframerah, pijat terapi, dan uap/nebulizer.', 60, 0, 'Bayi & Anak', 'Bayi & Anak', 7, true),
    ('Terapi & Paket Spesial', 'Nebulizer / Uap', 'Terapi inhalasi uap untuk membantu mengencerkan dahak dan melegakan saluran pernapasan bayi maupun anak.', 30, 0, 'Semua Usia Anak', 'Semua Usia Anak', 8, true),
    ('Terapi & Paket Spesial', 'Sinar Inframerah', 'Terapi hangat sinar inframerah untuk membantu melancarkan aliran darah, menghangatkan tubuh, dan meredakan gejala flu/bapil.', 25, 0, 'Semua Usia Anak', 'Semua Usia Anak', 9, true),
    ('Terapi & Paket Spesial', 'Paket Mom & Baby Post Persalinan', 'Perawatan pemulihan terpadu untuk Bunda pasca melahirkan sekaligus perawatan lembut untuk bayi baru lahir.', 90, 0, 'Bunda Pasca Salin & Bayi', 'Bunda Pasca Salin & Bayi', 10, true),

    -- Kategori 3: Mom Treatment
    ('Mom Treatment', 'Mom Treatment (Pijat Hamil, Nifas, Laktasi, Oksitosin)', 'Rangkaian pijat khusus ibu: pijat ibu hamil untuk meredakan pegal, pijat nifas pemulihan pasca bersalin, serta pijat laktasi & oksitosin untuk melancarkan ASI.', 60, 0, 'Ibu Hamil, Nifas & Menyusui', 'Ibu Hamil, Nifas & Menyusui', 11, true),
    ('Mom Treatment', 'Facial, Totok Wajah & Masker', 'Perawatan relaksasi wajah untuk menyegarkan kulit, melancarkan peredaran darah area wajah, dan mengurangi kelelahan Bunda.', 45, 0, 'Bunda', 'Bunda', 12, true);

-- Data Pengaturan Klinik Awal
INSERT INTO public.app_settings (key, value)
VALUES
    ('clinic_name', 'Indah Mom & Baby Spa Comal'),
    ('whatsapp_number', '6287856960422'),
    ('clinic_address', 'Ds. Purwosari Dusun VI 47 RT 001/017, Dusun III, Pecangakan, Kec. Comal, Kabupaten Pemalang, Jawa Tengah 52363'),
    ('admin_pin', '123456'),
    ('operating_hours', 'Buka setiap hari hingga pukul 18.00 WIB'),
    ('clinic_instagram', '@indahmombabyspa_comal')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Data Pengaturan Keamanan Hash PIN Awal pada clinic_settings
INSERT INTO public.clinic_settings (key, value)
VALUES
    ('admin_pin_hash', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92') -- Default SHA-256 hash untuk PIN 123456
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- 1. Services: Publik dan admin bisa melihat daftar katalog layanan
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
DROP POLICY IF EXISTS "Public can view all services" ON public.services;
CREATE POLICY "Public can view all services"
    ON public.services FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage services" ON public.services;
CREATE POLICY "Authenticated users can manage services"
    ON public.services FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Bookings:
-- - Publik HANYA diizinkan INSERT booking baru
-- - Seluruh operasi SELECT, UPDATE, DELETE HANYA diizinkan untuk user authenticated
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can select bookings" ON public.bookings;
CREATE POLICY "Authenticated users can select bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can update bookings" ON public.bookings;
CREATE POLICY "Authenticated users can update bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON public.bookings;
CREATE POLICY "Authenticated users can delete bookings"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (true);

-- 3. Blocked Slots:
-- - Seluruh operasi SELECT, INSERT, UPDATE, DELETE HANYA diizinkan untuk user authenticated
-- (Publik memeriksa ketersediaan jam/libur melalui RPC SECURITY DEFINER get_booked_slots)
DROP POLICY IF EXISTS "Public can view blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Authenticated users can select blocked_slots" ON public.blocked_slots;
CREATE POLICY "Authenticated users can select blocked_slots"
    ON public.blocked_slots FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert blocked_slots" ON public.blocked_slots;
CREATE POLICY "Authenticated users can insert blocked_slots"
    ON public.blocked_slots FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update blocked_slots" ON public.blocked_slots;
CREATE POLICY "Authenticated users can update blocked_slots"
    ON public.blocked_slots FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete blocked_slots" ON public.blocked_slots;
CREATE POLICY "Authenticated users can delete blocked_slots"
    ON public.blocked_slots FOR DELETE
    TO authenticated
    USING (true);

-- 4. App Settings: Publik hanya bisa membaca informasi publik klinik
DROP POLICY IF EXISTS "Public can view public settings" ON public.app_settings;
CREATE POLICY "Public can view public settings"
    ON public.app_settings FOR SELECT
    USING (key IN ('clinic_name', 'whatsapp_number', 'clinic_address', 'operating_hours', 'clinic_instagram'));

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.app_settings;
CREATE POLICY "Authenticated users can manage settings"
    ON public.app_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Testimonials:
-- - Mengizinkan SELECT pada public.testimonials agar publik dan dashboard admin
--   dapat menampilkan testimoni (baik berstatus Aktif maupun Disembunyikan untuk keperluan kelola admin).
-- - Pemfilteran hanya testimoni aktif dilakukan di level query publik (misal: eq('is_active', true) pada halaman depan).
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials"
    ON public.testimonials FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow anon insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon delete testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Authenticated users can select testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can select testimonials"
    ON public.testimonials FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can insert testimonials"
    ON public.testimonials FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can update testimonials"
    ON public.testimonials FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can delete testimonials"
    ON public.testimonials FOR DELETE
    TO authenticated
    USING (true);

-- 6. Clinic Settings:
-- - Siapapun (anon & authenticated) dapat membaca clinic_settings untuk verifikasi PIN hash
DROP POLICY IF EXISTS "Public can view clinic settings" ON public.clinic_settings;
CREATE POLICY "Public can view clinic settings"
    ON public.clinic_settings FOR SELECT
    USING (true);

-- - User authenticated dapat mengelola clinic_settings
DROP POLICY IF EXISTS "Authenticated users can manage clinic_settings" ON public.clinic_settings;
CREATE POLICY "Authenticated users can manage clinic_settings"
    ON public.clinic_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- - Anon diizinkan melakukan upsert (insert/update) clinic_settings untuk pembaruan PIN hash dari antarmuka admin
DROP POLICY IF EXISTS "Allow anon manage clinic_settings" ON public.clinic_settings;
CREATE POLICY "Allow anon manage clinic_settings"
    ON public.clinic_settings FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- ====================================================================
-- RPC FUNCTIONS (SECURITY DEFINER)
-- ====================================================================

-- 1. get_booked_slots & get_public_booked_slots: Mengembalikan jam-jam yang sudah terbooking (confirmed)
-- atau diblokir admin pada tanggal tertentu tanpa mengekspos data pribadi pasien
CREATE OR REPLACE FUNCTION public.get_booked_slots(target_date date)
RETURNS TABLE (booking_time text, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT b.booking_time::text, 'Telah Dikonfirmasi'::text
    FROM public.bookings b
    WHERE b.booking_date = target_date
      AND b.status = 'confirmed';

    RETURN QUERY
    SELECT COALESCE(bs.block_time, 'ALL')::text, COALESCE(bs.reason, 'Jadwal Libur')::text
    FROM public.blocked_slots bs
    WHERE bs.block_date = target_date;
END;
$$;

-- Alias get_public_booked_slots untuk query publik jadwal yang aman dari sisi frontend
CREATE OR REPLACE FUNCTION public.get_public_booked_slots(target_date date)
RETURNS TABLE (booking_time text, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_booked_slots(target_date);
END;
$$;

-- 2. verify_admin_pin: Verifikasi PIN Admin (Mendukung Hash SHA-256 dari clinic_settings & fallback plain text)
CREATE OR REPLACE FUNCTION public.verify_admin_pin(pin_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash text;
    stored_pin text;
    calculated_hash text;
BEGIN
    -- 1. Periksa hash dari clinic_settings
    SELECT value INTO stored_hash FROM public.clinic_settings WHERE key = 'admin_pin_hash';
    IF stored_hash IS NOT NULL AND stored_hash <> '' THEN
        calculated_hash := encode(digest(pin_input, 'sha256'), 'hex');
        IF lower(calculated_hash) = lower(stored_hash) THEN
            RETURN true;
        END IF;
    END IF;

    -- 2. Periksa hash dari app_settings jika ada
    SELECT value INTO stored_hash FROM public.app_settings WHERE key = 'admin_pin_hash';
    IF stored_hash IS NOT NULL AND stored_hash <> '' THEN
        calculated_hash := encode(digest(pin_input, 'sha256'), 'hex');
        IF lower(calculated_hash) = lower(stored_hash) THEN
            RETURN true;
        END IF;
    END IF;

    -- 3. Fallback ke PIN plain text pada app_settings (atau bawaan 123456)
    SELECT value INTO stored_pin FROM public.app_settings WHERE key = 'admin_pin';
    IF stored_pin IS NULL THEN
        stored_pin := '123456';
    END IF;
    RETURN (pin_input = stored_pin);
END;
$$;

-- 3. get_admin_bookings & admin_get_bookings: Mengambil seluruh reservasi untuk admin terverifikasi
CREATE OR REPLACE FUNCTION public.get_admin_bookings(
    pin_input text,
    p_date date DEFAULT NULL,
    p_status text DEFAULT NULL
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.bookings
    WHERE (p_date IS NULL OR booking_date = p_date)
      AND (p_status IS NULL OR p_status = 'all' OR status = p_status)
    ORDER BY booking_date DESC, booking_time ASC;
END;
$$;

-- Alias admin_get_bookings untuk konsistensi panggilan RPC admin frontend
CREATE OR REPLACE FUNCTION public.admin_get_bookings(
    pin_input text,
    p_date date DEFAULT NULL,
    p_status text DEFAULT NULL
)
RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_admin_bookings(pin_input, p_date, p_status);
END;
$$;

-- 4. update_booking_status: Mengubah status reservasi (confirmed, completed, cancelled) serta opsi penyesuaian jam final
DROP FUNCTION IF EXISTS public.update_booking_status(text, uuid, text);
CREATE OR REPLACE FUNCTION public.update_booking_status(
    pin_input text,
    p_booking_id uuid,
    p_status text,
    p_booking_time text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    UPDATE public.bookings
    SET status = p_status,
        booking_time = COALESCE(NULLIF(p_booking_time, ''), booking_time)
    WHERE id = p_booking_id;

    RETURN FOUND;
END;
$$;

-- 5. admin_create_manual_booking: Tambah reservasi manual oleh admin (langsung confirmed)
CREATE OR REPLACE FUNCTION public.admin_create_manual_booking(
    pin_input text,
    p_visit_type text,
    p_service_id uuid,
    p_service_name text,
    p_service_price numeric DEFAULT 0,
    p_booking_date date DEFAULT NULL,
    p_booking_time text DEFAULT NULL,
    p_mom_name text DEFAULT NULL,
    p_whatsapp_number text DEFAULT NULL,
    p_child_name text DEFAULT NULL,
    p_child_age text DEFAULT NULL,
    p_address text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_status text DEFAULT 'confirmed'
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_booking public.bookings;
    v_code text;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    v_code := 'IMB-' || to_char(p_booking_date, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

    INSERT INTO public.bookings (
        booking_code, visit_type, service_id, service_name, service_price,
        booking_date, booking_time, mom_name, whatsapp_number, child_name,
        child_age, address, notes, status
    ) VALUES (
        v_code, p_visit_type, p_service_id, p_service_name, COALESCE(p_service_price, 0),
        p_booking_date, p_booking_time, p_mom_name, p_whatsapp_number, p_child_name,
        p_child_age, p_address, p_notes, p_status
    )
    RETURNING * INTO v_new_booking;

    RETURN v_new_booking;
END;
$$;

-- 6. admin_manage_service: Tambah/Edit/Hapus Layanan
DROP FUNCTION IF EXISTS public.admin_manage_service(text, text, uuid, text, text, text, int, numeric, text, boolean);
DROP FUNCTION IF EXISTS public.admin_manage_service(text, text, uuid, text, text, text, int, text, boolean, int);

CREATE OR REPLACE FUNCTION public.admin_manage_service(
    pin_input text,
    p_action text, -- 'create', 'update', 'delete', 'toggle_active'
    p_id uuid DEFAULT NULL,
    p_category text DEFAULT NULL,
    p_name text DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_duration_minutes int DEFAULT 45,
    p_age_range text DEFAULT NULL,
    p_is_active boolean DEFAULT true,
    p_sort_order int DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
    v_target_age text;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    v_target_age := p_age_range;

    IF p_action = 'create' THEN
        INSERT INTO public.services (category, name, description, duration_minutes, price, target_age, age_range, is_active, sort_order)
        VALUES (p_category, p_name, p_description, COALESCE(p_duration_minutes, 45), 0, v_target_age, v_target_age, COALESCE(p_is_active, true), COALESCE(p_sort_order, 0))
        RETURNING id INTO v_id;
        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil ditambahkan', 'id', v_id);

    ELSIF p_action = 'update' THEN
        IF p_id IS NULL THEN
            RAISE EXCEPTION 'ID layanan wajib disertakan untuk aksi update';
        END IF;

        UPDATE public.services
        SET category = COALESCE(p_category, category),
            name = COALESCE(p_name, name),
            description = COALESCE(p_description, description),
            duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
            target_age = COALESCE(v_target_age, target_age),
            age_range = COALESCE(v_target_age, age_range, target_age),
            is_active = COALESCE(p_is_active, is_active),
            sort_order = COALESCE(p_sort_order, sort_order)
        WHERE id = p_id;

        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil diupdate', 'id', p_id);

    ELSIF p_action = 'toggle_active' THEN
        IF p_id IS NULL THEN
            RAISE EXCEPTION 'ID layanan wajib disertakan untuk toggle_active';
        END IF;

        UPDATE public.services
        SET is_active = NOT is_active
        WHERE id = p_id;

        RETURN jsonb_build_object('success', true, 'message', 'Status layanan berhasil diubah', 'id', p_id);

    ELSIF p_action = 'delete' THEN
        IF p_id IS NULL THEN
            RAISE EXCEPTION 'ID layanan wajib disertakan untuk delete';
        END IF;

        DELETE FROM public.services WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil dihapus', 'id', p_id);

    ELSE
        RAISE EXCEPTION 'Aksi tidak dikenal: %', p_action;
    END IF;
END;
$$;

-- 7. admin_manage_blocked_slot: Kelola slot libur
CREATE OR REPLACE FUNCTION public.admin_manage_blocked_slot(
    pin_input text,
    p_action text, -- 'create', 'delete'
    p_id uuid DEFAULT NULL,
    p_block_date date DEFAULT NULL,
    p_block_time text DEFAULT NULL,
    p_reason text DEFAULT 'Libur Operasional'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    IF p_action = 'create' THEN
        INSERT INTO public.blocked_slots (block_date, block_time, reason)
        VALUES (p_block_date, NULLIF(p_block_time, ''), p_reason);
        RETURN jsonb_build_object('success', true, 'message', 'Slot libur berhasil ditambahkan');
    ELSIF p_action = 'delete' THEN
        DELETE FROM public.blocked_slots WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'message', 'Slot libur berhasil dihapus');
    ELSE
        RAISE EXCEPTION 'Aksi tidak dikenal';
    END IF;
END;
$$;

-- 8. admin_update_setting: Mengubah pengaturan kontak atau PIN
CREATE OR REPLACE FUNCTION public.admin_update_setting(
    pin_input text,
    p_key text,
    p_value text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    INSERT INTO public.app_settings (key, value, updated_at)
    VALUES (p_key, p_value, timezone('utc'::text, now()))
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;

    IF p_key = 'admin_pin_hash' THEN
        INSERT INTO public.clinic_settings (key, value, updated_at)
        VALUES (p_key, p_value, timezone('utc'::text, now()))
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value,
            updated_at = EXCLUDED.updated_at;
    END IF;

    RETURN true;
END;
$$;

-- 9. admin_manage_testimonial: Kelola testimoni screenshot WhatsApp
CREATE OR REPLACE FUNCTION public.admin_manage_testimonial(
    pin_input text,
    p_action text, -- 'create', 'update', 'toggle_active', 'delete'
    p_id uuid DEFAULT NULL,
    p_image_url text DEFAULT NULL,
    p_caption text DEFAULT NULL,
    p_is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    IF p_action = 'create' THEN
        INSERT INTO public.testimonials (image_url, caption, is_active)
        VALUES (p_image_url, p_caption, COALESCE(p_is_active, true))
        RETURNING id INTO v_id;
        RETURN v_id;

    ELSIF p_action = 'update' THEN
        UPDATE public.testimonials
        SET image_url = COALESCE(p_image_url, image_url),
            caption = COALESCE(p_caption, caption),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_id;
        RETURN p_id;

    ELSIF p_action = 'toggle_active' THEN
        UPDATE public.testimonials
        SET is_active = NOT is_active
        WHERE id = p_id;
        RETURN p_id;

    ELSIF p_action = 'delete' THEN
        DELETE FROM public.testimonials
        WHERE id = p_id;
        RETURN p_id;

    ELSE
        RAISE EXCEPTION 'Aksi tidak dikenal: %', p_action;
    END IF;
END;
$$;

-- 10. admin_delete_booking: Hapus satu data reservasi permanen dengan verifikasi PIN Admin
CREATE OR REPLACE FUNCTION public.admin_delete_booking(
    pin_input text,
    p_booking_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    DELETE FROM public.bookings
    WHERE id = p_booking_id;

    RETURN FOUND;
END;
$$;

-- 11. admin_delete_customer_bookings: Hapus seluruh riwayat reservasi pelanggan berdasarkan nomor WA dengan verifikasi PIN Admin
CREATE OR REPLACE FUNCTION public.admin_delete_customer_bookings(
    pin_input text,
    p_whatsapp_number text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
    clean_target text;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    -- Normalisasi nomor WhatsApp target untuk pencocokan fleksibel
    clean_target := regexp_replace(p_whatsapp_number, '[^0-9]', '', 'g');
    IF clean_target LIKE '0%' THEN
        clean_target := '62' || substr(clean_target, 2);
    ELSIF clean_target LIKE '8%' THEN
        clean_target := '62' || clean_target;
    END IF;

    DELETE FROM public.bookings
    WHERE whatsapp_number = p_whatsapp_number
       OR regexp_replace(whatsapp_number, '[^0-9]', '', 'g') = clean_target
       OR ('62' || ltrim(regexp_replace(whatsapp_number, '[^0-9]', '', 'g'), '0')) = clean_target;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 12. admin_save_treatment_note: Menyimpan catatan tindakan/perkembangan anak & berat badan
CREATE OR REPLACE FUNCTION public.admin_save_treatment_note(
    pin_input text,
    p_booking_id uuid,
    p_treatment_notes text,
    p_baby_weight_kg text DEFAULT NULL,
    p_mark_completed boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    UPDATE public.bookings
    SET treatment_notes = p_treatment_notes,
        baby_weight_kg = COALESCE(NULLIF(p_baby_weight_kg, ''), baby_weight_kg),
        status = CASE WHEN p_mark_completed THEN 'completed' ELSE status END
    WHERE id = p_booking_id;

    RETURN FOUND;
END;
$$;

-- 13. admin_update_operational_status: Memperbarui status operasional klinik real-time
CREATE OR REPLACE FUNCTION public.admin_update_operational_status(
    pin_input text,
    p_status text,
    p_note text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    IF p_status NOT IN ('open', 'busy_homecare', 'closed_today') THEN
        RAISE EXCEPTION 'Status operasional tidak valid: % (Hanya boleh: open, busy_homecare, closed_today)', p_status;
    END IF;

    -- Upsert baris utama clinic_operational_status
    INSERT INTO public.clinic_settings (key, value, operational_status, operational_note, updated_at)
    VALUES ('clinic_operational_status', p_status, p_status, p_note, timezone('utc'::text, now()))
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        operational_status = EXCLUDED.operational_status,
        operational_note = EXCLUDED.operational_note,
        updated_at = EXCLUDED.updated_at;

    -- Sinkronkan juga pada seluruh baris clinic_settings agar query kolom operational_status selalu konsisten
    UPDATE public.clinic_settings
    SET operational_status = p_status,
        operational_note = p_note,
        updated_at = timezone('utc'::text, now());

    RETURN true;
END;
$$;

-- Berikan hak akses eksekusi RPC ke anon & authenticated
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_booked_slots(date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_bookings(text, date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_bookings(text, date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_manual_booking(text, text, uuid, text, numeric, date, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_service(text, text, uuid, text, text, text, int, text, boolean, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_blocked_slot(text, text, uuid, date, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_setting(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_testimonial(text, text, uuid, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_booking(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_customer_bookings(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_treatment_note(text, uuid, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_operational_status(text, text, text) TO anon, authenticated;

-- Berikan hak akses tabel clinic_settings untuk pengelolaan status & PIN hash admin
GRANT ALL ON TABLE public.clinic_settings TO anon, authenticated;

-- Berikan hak akses SELECT pada testimonials untuk publik dan dashboard admin
GRANT SELECT ON TABLE public.testimonials TO anon, authenticated;

-- ====================================================================
-- KONFIGURASI SUPABASE STORAGE (BUCKET: testimonials)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access Testimonials" ON storage.objects;
CREATE POLICY "Public Access Testimonials"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonials');

DROP POLICY IF EXISTS "Allow Upload Testimonials" ON storage.objects;
CREATE POLICY "Allow Upload Testimonials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'testimonials');

DROP POLICY IF EXISTS "Allow Update Testimonials" ON storage.objects;
CREATE POLICY "Allow Update Testimonials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'testimonials');

DROP POLICY IF EXISTS "Allow Delete Testimonials" ON storage.objects;
CREATE POLICY "Allow Delete Testimonials"
ON storage.objects FOR DELETE
USING (bucket_id = 'testimonials');

-- ====================================================================
-- 7. TABEL & FUNGSI PENGELOLAAN VIDEO TIKTOK (TIKTOK_VIDEOS)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.tiktok_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tiktok_url TEXT NOT NULL,
    video_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tiktok_videos_active ON public.tiktok_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_created_at ON public.tiktok_videos(created_at DESC);

ALTER TABLE public.tiktok_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active tiktok videos" ON public.tiktok_videos;
DROP POLICY IF EXISTS "Public can view tiktok videos" ON public.tiktok_videos;
CREATE POLICY "Public can view tiktok videos"
    ON public.tiktok_videos FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can select tiktok videos" ON public.tiktok_videos;
CREATE POLICY "Authenticated users can select tiktok videos"
    ON public.tiktok_videos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert tiktok videos" ON public.tiktok_videos;
CREATE POLICY "Authenticated users can insert tiktok videos"
    ON public.tiktok_videos FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update tiktok videos" ON public.tiktok_videos;
CREATE POLICY "Authenticated users can update tiktok videos"
    ON public.tiktok_videos FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete tiktok videos" ON public.tiktok_videos;
CREATE POLICY "Authenticated users can delete tiktok videos"
    ON public.tiktok_videos FOR DELETE
    TO authenticated
    USING (true);

GRANT SELECT ON TABLE public.tiktok_videos TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_manage_tiktok(
    pin_input text,
    p_action text, -- 'create', 'update', 'toggle_active', 'delete'
    p_id uuid DEFAULT NULL,
    p_title text DEFAULT NULL,
    p_tiktok_url text DEFAULT NULL,
    p_video_id text DEFAULT NULL,
    p_is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    IF p_action = 'create' THEN
        INSERT INTO public.tiktok_videos (title, tiktok_url, video_id, is_active)
        VALUES (p_title, p_tiktok_url, p_video_id, COALESCE(p_is_active, true))
        RETURNING id INTO v_id;
        RETURN v_id;

    ELSIF p_action = 'update' THEN
        UPDATE public.tiktok_videos
        SET title = COALESCE(p_title, title),
            tiktok_url = COALESCE(p_tiktok_url, tiktok_url),
            video_id = COALESCE(p_video_id, video_id),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_id;
        RETURN p_id;

    ELSIF p_action = 'toggle_active' THEN
        UPDATE public.tiktok_videos
        SET is_active = NOT is_active
        WHERE id = p_id;
        RETURN p_id;

    ELSIF p_action = 'delete' THEN
        DELETE FROM public.tiktok_videos
        WHERE id = p_id;
        RETURN p_id;

    ELSE
        RAISE EXCEPTION 'Aksi tidak dikenal: %', p_action;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_manage_tiktok TO anon, authenticated;

-- ====================================================================
-- REALTIME SUBSCRIPTION PUBLICATION
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_settings;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_slots;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;


-- ====================================================================
-- MIGRASI 03 (Lanjutan): TABEL & RPC BROADCAST INFO BIDAN & TIPS KESEHATAN
-- ====================================================================

-- 1. Buat Tabel public.clinic_announcements jika belum ada
CREATE TABLE IF NOT EXISTS public.clinic_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'info' CHECK (category IN ('info', 'health_tip', 'holiday')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index performa pencarian pengumuman aktif dan urutan waktu
CREATE INDEX IF NOT EXISTS idx_clinic_announcements_active ON public.clinic_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_announcements_created ON public.clinic_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinic_announcements_category ON public.clinic_announcements(category);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.clinic_announcements ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS: Publik (anon & authenticated) dapat melihat pengumuman aktif
DROP POLICY IF EXISTS "Public can view active announcements" ON public.clinic_announcements;
CREATE POLICY "Public can view active announcements"
    ON public.clinic_announcements FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated can view all announcements" ON public.clinic_announcements;
CREATE POLICY "Authenticated can view all announcements"
    ON public.clinic_announcements FOR SELECT
    TO authenticated
    USING (true);

-- Berikan izin akses SELECT untuk anon dan authenticated
GRANT SELECT ON TABLE public.clinic_announcements TO anon, authenticated;

-- 4. Fungsi RPC SECURITY DEFINER: admin_publish_announcement
CREATE OR REPLACE FUNCTION public.admin_publish_announcement(
    pin_input text,
    p_title text,
    p_message text,
    p_category text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
    v_cat text;
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    IF trim(COALESCE(p_title, '')) = '' THEN
        RAISE EXCEPTION 'Judul pengumuman tidak boleh kosong!';
    END IF;

    IF trim(COALESCE(p_message, '')) = '' THEN
        RAISE EXCEPTION 'Isi pesan pengumuman tidak boleh kosong!';
    END IF;

    v_cat := lower(trim(COALESCE(p_category, 'info')));
    IF v_cat NOT IN ('info', 'health_tip', 'holiday') THEN
        v_cat := 'info';
    END IF;

    -- Jika kategori 'holiday', nonaktifkan pengumuman libur sebelumnya agar tidak tumpang tindih
    IF v_cat = 'holiday' THEN
        UPDATE public.clinic_announcements
        SET is_active = false
        WHERE category = 'holiday';
    END IF;

    INSERT INTO public.clinic_announcements (title, message, category, is_active)
    VALUES (trim(p_title), trim(p_message), v_cat, true)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- 5. Fungsi RPC SECURITY DEFINER: admin_delete_announcement
CREATE OR REPLACE FUNCTION public.admin_delete_announcement(
    pin_input text,
    p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    DELETE FROM public.clinic_announcements
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;

-- 6. Fungsi RPC SECURITY DEFINER: admin_get_announcements
CREATE OR REPLACE FUNCTION public.admin_get_announcements(
    pin_input text
)
RETURNS SETOF public.clinic_announcements
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.verify_admin_pin(pin_input) THEN
        RAISE EXCEPTION 'Akses ditolak: PIN Admin tidak valid!';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.clinic_announcements
    ORDER BY created_at DESC;
END;
$$;

-- 7. Berikan hak akses eksekusi RPC ke anon dan authenticated
GRANT EXECUTE ON FUNCTION public.admin_publish_announcement(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_announcement(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_announcements(text) TO anon, authenticated;

-- 8. Tambahkan ke Realtime Publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_announcements;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;
