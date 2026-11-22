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
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- 2. TABEL RESERVASI (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN ('Datang ke Klinik', 'Homecare - Bidan ke Rumah')),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name VARCHAR(150) NOT NULL,
    service_price NUMERIC(12,2) DEFAULT 0,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    mom_name VARCHAR(150) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    child_name VARCHAR(150),
    child_age VARCHAR(50),
    address TEXT,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

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

-- ====================================================================
-- SEED DATA AWAL: 12 LAYANAN RESMI KATALOG BARU
-- ====================================================================

-- Bersihkan data lama jika ada
DELETE FROM public.services;

INSERT INTO public.services (category, name, description, duration_minutes, price, target_age, is_active)
VALUES
    -- Kategori 1: Baby & Kids Treatment
    ('Baby & Kids Treatment', 'Pijat Bayi Sehat', 'Pijat lembut menyeluruh untuk relaksasi, melancarkan peredaran darah, dan meningkatkan kualitas tidur bayi.', 40, 0, '0 - 24 Bulan', true),
    ('Baby & Kids Treatment', 'Baby Spa (Gymball, Swim, Massage)', 'Rangkaian stimulasi motorik dengan gymball, berenang air hangat dengan pelampung aman, dan pijat relaksasi.', 50, 0, '1 - 24 Bulan', true),
    ('Baby & Kids Treatment', 'Pijat Terapi (Bapil, Kolik, Diare, Sembelit, Nafsu Makan)', 'Pijat pediatrik khusus untuk membantu meredakan keluhan batuk pilek, kembung/kolik, gangguan pencernaan, serta meningkatkan nafsu makan anak.', 45, 0, '0 - 5 Tahun', true),
    ('Baby & Kids Treatment', 'Perawatan Newborn (Bayi Baru Lahir)', 'Perawatan lembut khusus bayi baru lahir meliputi memandikan, perawatan tali pusat, dan pijat ringan yang aman.', 45, 0, '0 - 40 Hari', true),
    ('Baby & Kids Treatment', 'Tindik Steril (Minim Nyeri Tanpa Darah)', 'Layanan tindik telinga higienis menggunakan alat steril sekali pakai yang minim nyeri dan tanpa pendarahan.', 25, 0, 'Bayi & Anak', true),
    ('Baby & Kids Treatment', 'Cukur Gundul', 'Cukur rambut bayi bersih dan higienis oleh Bidan dengan peralatan steril serta penuh ketelitian.', 30, 0, '0 - 12 Bulan', true),

    -- Kategori 2: Terapi & Paket Spesial
    ('Terapi & Paket Spesial', 'Paket Bapil (Sinar, Massage, Uap)', 'Paket perawatan lengkap untuk melegakan pernapasan Si Kecil saat batuk pilek dengan terapi sinar inframerah, pijat terapi, dan uap/nebulizer.', 60, 0, 'Bayi & Anak', true),
    ('Terapi & Paket Spesial', 'Nebulizer / Uap', 'Terapi inhalasi uap untuk membantu mengencerkan dahak dan melegakan saluran pernapasan bayi maupun anak.', 30, 0, 'Semua Usia Anak', true),
    ('Terapi & Paket Spesial', 'Sinar Inframerah', 'Terapi hangat sinar inframerah untuk membantu melancarkan aliran darah, menghangatkan tubuh, dan meredakan gejala flu/bapil.', 25, 0, 'Semua Usia Anak', true),
    ('Terapi & Paket Spesial', 'Paket Mom & Baby Post Persalinan', 'Perawatan pemulihan terpadu untuk Bunda pasca melahirkan sekaligus perawatan lembut untuk bayi baru lahir.', 90, 0, 'Bunda Pasca Salin & Bayi', true),

    -- Kategori 3: Mom Treatment
    ('Mom Treatment', 'Mom Treatment (Pijat Hamil, Nifas, Laktasi, Oksitosin)', 'Rangkaian pijat khusus ibu: pijat ibu hamil untuk meredakan pegal, pijat nifas pemulihan pasca bersalin, serta pijat laktasi & oksitosin untuk melancarkan ASI.', 60, 0, 'Ibu Hamil, Nifas & Menyusui', true),
    ('Mom Treatment', 'Facial, Totok Wajah & Masker', 'Perawatan relaksasi wajah untuk menyegarkan kulit, melancarkan peredaran darah area wajah, dan mengurangi kelelahan Bunda.', 45, 0, 'Bunda', true);

-- Data Pengaturan Klinik Awal
INSERT INTO public.app_settings (key, value)
VALUES
    ('clinic_name', 'Indah Mom & Baby Spa Comal'),
    ('whatsapp_number', '6287856960422'),
    ('clinic_address', 'Ds. Purwosari Dusun VI 47 RT 001/017, Dusun III, Pecangakan, Kec. Comal, Kabupaten Pemalang, Jawa Tengah 52363'),
    ('admin_pin', '123456'),
    ('operating_hours', 'Buka setiap hari hingga pukul 19.00 WIB'),
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

-- 1. Services: Publik bisa melihat semua layanan yang aktif
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
    ON public.services FOR SELECT
    USING (is_active = true);

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
-- - Publik hanya bisa melihat testimoni yang aktif
-- - Operasi kelola (INSERT/UPDATE/DELETE) untuk user authenticated atau lewat RPC admin
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials"
    ON public.testimonials FOR SELECT
    USING (is_active = true);

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

-- 1. get_booked_slots: Mengembalikan jam-jam yang sudah terbooking (confirmed)
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

-- 3. get_admin_bookings: Mengambil seluruh reservasi untuk admin terverifikasi
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

-- 4. update_booking_status: Mengubah status reservasi (confirmed, completed, cancelled)
CREATE OR REPLACE FUNCTION public.update_booking_status(
    pin_input text,
    p_booking_id uuid,
    p_status text
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
    SET status = p_status
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
CREATE OR REPLACE FUNCTION public.admin_manage_service(
    pin_input text,
    p_action text, -- 'create', 'update', 'delete', 'toggle_active'
    p_id uuid DEFAULT NULL,
    p_category text DEFAULT NULL,
    p_name text DEFAULT NULL,
    p_description text DEFAULT NULL,
    p_duration_minutes int DEFAULT 45,
    p_price numeric DEFAULT 0,
    p_target_age text DEFAULT NULL,
    p_is_active boolean DEFAULT true
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
        INSERT INTO public.services (category, name, description, duration_minutes, price, target_age, is_active)
        VALUES (p_category, p_name, p_description, p_duration_minutes, COALESCE(p_price, 0), p_target_age, p_is_active);
        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil ditambahkan');
    ELSIF p_action = 'update' THEN
        UPDATE public.services
        SET category = COALESCE(p_category, category),
            name = COALESCE(p_name, name),
            description = COALESCE(p_description, description),
            duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
            price = COALESCE(p_price, price, 0),
            target_age = COALESCE(p_target_age, target_age),
            is_active = COALESCE(p_is_active, is_active)
        WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil diupdate');
    ELSIF p_action = 'toggle_active' THEN
        UPDATE public.services
        SET is_active = NOT is_active
        WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'message', 'Status layanan berhasil diubah');
    ELSIF p_action = 'delete' THEN
        DELETE FROM public.services WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'message', 'Layanan berhasil dihapus');
    ELSE
        RAISE EXCEPTION 'Aksi tidak dikenal';
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

-- Berikan hak akses eksekusi RPC ke anon & authenticated
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_bookings(text, date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_manual_booking(text, text, uuid, text, numeric, date, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_service(text, text, uuid, text, text, text, int, numeric, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_blocked_slot(text, text, uuid, date, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_setting(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_testimonial(text, text, uuid, text, text, boolean) TO anon, authenticated;

-- Berikan hak akses tabel clinic_settings untuk pengelolaan PIN hash admin
GRANT ALL ON TABLE public.clinic_settings TO anon, authenticated;

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