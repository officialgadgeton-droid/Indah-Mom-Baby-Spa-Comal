import { ClinicAnnouncement } from '../types';

export const INITIAL_ANNOUNCEMENTS: ClinicAnnouncement[] = [
  {
    id: 'ann-init-1',
    title: 'Tips Stimulasi Sensori & Pijat Kolik Mandiri di Rumah',
    message:
      'Bunda, jika si kecil sering rewel atau kembung terutama di sore hari, lakukan pijatan lembut gerakan "I Love You" searah jarum jam dengan minyak telon atau baby oil hangat setelah mandi. Sentuhan kasih sayang Bunda menstimulasi pelepasan hormon oksitosin yang menenangkan sistem saraf bayi.',
    category: 'health_tip',
    is_active: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ann-init-2',
    title: 'Layanan Homecare Bidan Indah Siap Berkunjung ke Rumah Anda',
    message:
      'Bagi Bunda yang sedang dalam masa pemulihan pasca melahirkan atau si kecil belum memungkinkan keluar rumah, Bidan Indah menyediakan layanan Homecare langsung ke rumah dengan peralatan higienis berstandar kebidanan untuk wilayah Comal, Ulujami, Ampelgading, Petarukan, dan sekitarnya.',
    category: 'info',
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];
