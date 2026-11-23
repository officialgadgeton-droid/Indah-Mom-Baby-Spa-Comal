-- ====================================================================
-- MIGRASI 02: REKAM TINDAKAN PASIEN & STATUS OPERASIONAL KLINIK
-- INDAH MOM & BABY SPA COMAL (indahmombabyspa.com)
-- File ini idempoten dan aman dijalankan berulang kali di Supabase SQL Editor.
-- ====================================================================

-- 1. Kolom Rekam Tindakan Bidan pada public.bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS treatment_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS baby_weight_kg VARCHAR(20);

-- 2. Kolom Status Operasional Klinik Real-Time pada public.clinic_settings
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'open';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS operational_note TEXT;

-- Pastikan ada baris default status operasional di clinic_settings
INSERT INTO public.clinic_settings (key, value, operational_status, operational_note, updated_at)
VALUES ('clinic_operational_status', 'open', 'open', NULL, timezone('utc'::text, now()))
ON CONFLICT (key) DO UPDATE
SET operational_status = COALESCE(public.clinic_settings.operational_status, 'open');

-- Berikan izin akses SELECT pada public.clinic_settings agar publik & admin bisa membaca status real-time
GRANT SELECT ON TABLE public.clinic_settings TO anon, authenticated;

-- 3. Fungsi RPC SECURITY DEFINER: admin_save_treatment_note
-- Memverifikasi PIN Admin, menyimpan catatan tindakan/perkembangan bayi, dan opsional menandai status booking menjadi 'completed'
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

-- 4. Fungsi RPC SECURITY DEFINER: admin_update_operational_status
-- Memverifikasi PIN Admin dan memperbarui operational_status serta operational_note pada tabel public.clinic_settings
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

    -- Sinkronkan juga pada baris lain di clinic_settings (misal admin_pin_hash) agar query SELECT kolom operational_status selalu konsisten
    UPDATE public.clinic_settings
    SET operational_status = p_status,
        operational_note = p_note,
        updated_at = timezone('utc'::text, now());

    RETURN true;
END;
$$;

-- 5. Berikan hak eksekusi RPC ke anon dan authenticated
GRANT EXECUTE ON FUNCTION public.admin_save_treatment_note(text, uuid, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_operational_status(text, text, text) TO anon, authenticated;

-- Refresh get_admin_bookings agar composite return type mengenali kolom baru (treatment_notes, baby_weight_kg)
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
GRANT EXECUTE ON FUNCTION public.get_admin_bookings(text, date, text) TO anon, authenticated;
