-- ====================================================================
-- MIGRASI 03 (Lanjutan): TABEL & RPC BROADCAST INFO BIDAN & TIPS KESEHATAN
-- INDAH MOM & BABY SPA COMAL (indahmombabyspa.com)
-- File ini idempoten dan aman dijalankan berulang kali di Supabase SQL Editor.
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
-- Memverifikasi PIN Admin, menonaktifkan pengumuman lama jika kategori 'holiday', lalu menyisipkan pengumuman baru
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
-- Memverifikasi PIN Admin dan menghapus pengumuman berdasarkan ID
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
-- Membantu Admin melihat seluruh riwayat pengumuman dengan verifikasi PIN
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

-- 8. Tambahkan ke Realtime Publication jika ada
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
