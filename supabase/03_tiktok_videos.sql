-- ====================================================================
-- MIGRASI 03: TABEL & FUNGSI PENGELOLAAN VIDEO TIKTOK (TIKTOK_VIDEOS)
-- ====================================================================

-- 1. Buat Tabel tiktok_videos jika belum ada
CREATE TABLE IF NOT EXISTS public.tiktok_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tiktok_url TEXT NOT NULL,
    video_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index performa
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_active ON public.tiktok_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_created_at ON public.tiktok_videos(created_at DESC);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.tiktok_videos ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Public SELECT, Authenticated CRUD)
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

-- Berikan hak akses SELECT untuk anon dan authenticated
GRANT SELECT ON TABLE public.tiktok_videos TO anon, authenticated;

-- 4. Fungsi RPC Pengelolaan Video TikTok oleh Admin dengan Verifikasi PIN
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
