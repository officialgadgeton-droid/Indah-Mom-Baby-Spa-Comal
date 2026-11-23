import { TikTokVideo } from '../types';

/**
 * Data awal video TikTok untuk fallback lokal dan preview offline.
 */
export const INITIAL_TIKTOK_VIDEOS: TikTokVideo[] = [
  {
    id: 'tiktok-sample-1',
    title: 'Mini Vlog Homecare & Baby Swim Comal',
    tiktok_url: 'https://www.tiktok.com/@indah_mom.baby_spa_comal/video/7438291029384712345',
    video_id: '7438291029384712345',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
