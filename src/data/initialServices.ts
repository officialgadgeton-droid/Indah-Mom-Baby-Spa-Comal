import { Service, AppSettings } from '../types';

export const INITIAL_SERVICES: Service[] = [
  // Kategori 1: Baby & Kids Treatment
  {
    id: 'srv-bk-1',
    category: 'Baby & Kids Treatment',
    name: 'Pijat Bayi Sehat',
    description: 'Pijat lembut menyeluruh untuk relaksasi, melancarkan peredaran darah, dan meningkatkan kualitas tidur bayi.',
    duration_minutes: 40,
    price: 0,
    target_age: '0 - 24 Bulan',
    age_range: '0 - 24 Bulan',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'srv-bk-2',
    category: 'Baby & Kids Treatment',
    name: 'Baby Spa (Gymball, Swim, Massage)',
    description: 'Rangkaian stimulasi motorik dengan gymball, berenang air hangat dengan pelampung aman, dan pijat relaksasi.',
    duration_minutes: 50,
    price: 0,
    target_age: '1 - 24 Bulan',
    age_range: '1 - 24 Bulan',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'srv-bk-3',
    category: 'Baby & Kids Treatment',
    name: 'Pijat Terapi (Bapil, Kolik, Diare, Sembelit, Nafsu Makan)',
    description: 'Pijat pediatrik khusus untuk membantu meredakan keluhan batuk pilek, kembung/kolik, gangguan pencernaan, serta meningkatkan nafsu makan anak.',
    duration_minutes: 45,
    price: 0,
    target_age: '0 - 5 Tahun',
    age_range: '0 - 5 Tahun',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'srv-bk-4',
    category: 'Baby & Kids Treatment',
    name: 'Perawatan Newborn (Bayi Baru Lahir)',
    description: 'Perawatan lembut khusus bayi baru lahir meliputi memandikan, perawatan tali pusat, dan pijat ringan yang aman.',
    duration_minutes: 45,
    price: 0,
    target_age: '0 - 40 Hari',
    age_range: '0 - 40 Hari',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'srv-bk-5',
    category: 'Baby & Kids Treatment',
    name: 'Tindik Steril (Minim Nyeri Tanpa Darah)',
    description: 'Layanan tindik telinga higienis menggunakan alat steril sekali pakai yang minim nyeri dan tanpa pendarahan.',
    duration_minutes: 25,
    price: 0,
    target_age: 'Bayi & Anak',
    age_range: 'Bayi & Anak',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'srv-bk-6',
    category: 'Baby & Kids Treatment',
    name: 'Cukur Gundul',
    description: 'Cukur rambut bayi bersih dan higienis oleh Bidan dengan peralatan steril serta penuh ketelitian.',
    duration_minutes: 30,
    price: 0,
    target_age: '0 - 12 Bulan',
    age_range: '0 - 12 Bulan',
    sort_order: 6,
    is_active: true,
  },

  // Kategori 2: Terapi & Paket Spesial
  {
    id: 'srv-tp-1',
    category: 'Terapi & Paket Spesial',
    name: 'Paket Bapil (Sinar, Massage, Uap)',
    description: 'Paket perawatan lengkap untuk melegakan pernapasan Si Kecil saat batuk pilek dengan terapi sinar inframerah, pijat terapi, dan uap/nebulizer.',
    duration_minutes: 60,
    price: 0,
    target_age: 'Bayi & Anak',
    age_range: 'Bayi & Anak',
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'srv-tp-2',
    category: 'Terapi & Paket Spesial',
    name: 'Nebulizer / Uap',
    description: 'Terapi inhalasi uap untuk membantu mengencerkan dahak dan melegakan saluran pernapasan bayi maupun anak.',
    duration_minutes: 30,
    price: 0,
    target_age: 'Semua Usia Anak',
    age_range: 'Semua Usia Anak',
    sort_order: 8,
    is_active: true,
  },
  {
    id: 'srv-tp-3',
    category: 'Terapi & Paket Spesial',
    name: 'Sinar Inframerah',
    description: 'Terapi hangat sinar inframerah untuk membantu melancarkan aliran darah, menghangatkan tubuh, dan meredakan gejala flu/bapil.',
    duration_minutes: 25,
    price: 0,
    target_age: 'Semua Usia Anak',
    age_range: 'Semua Usia Anak',
    sort_order: 9,
    is_active: true,
  },
  {
    id: 'srv-tp-4',
    category: 'Terapi & Paket Spesial',
    name: 'Paket Mom & Baby Post Persalinan',
    description: 'Perawatan pemulihan terpadu untuk Bunda pasca melahirkan sekaligus perawatan lembut untuk bayi baru lahir.',
    duration_minutes: 90,
    price: 0,
    target_age: 'Bunda Pasca Salin & Bayi',
    age_range: 'Bunda Pasca Salin & Bayi',
    sort_order: 10,
    is_active: true,
  },

  // Kategori 3: Mom Treatment
  {
    id: 'srv-mom-1',
    category: 'Mom Treatment',
    name: 'Mom Treatment (Pijat Hamil, Nifas, Laktasi, Oksitosin)',
    description: 'Rangkaian pijat khusus ibu: pijat ibu hamil untuk meredakan pegal, pijat nifas pemulihan pasca bersalin, serta pijat laktasi & oksitosin untuk melancarkan ASI.',
    duration_minutes: 60,
    price: 0,
    target_age: 'Ibu Hamil, Nifas & Menyusui',
    age_range: 'Ibu Hamil, Nifas & Menyusui',
    sort_order: 11,
    is_active: true,
  },
  {
    id: 'srv-mom-2',
    category: 'Mom Treatment',
    name: 'Facial, Totok Wajah & Masker',
    description: 'Perawatan relaksasi wajah untuk menyegarkan kulit, melancarkan peredaran darah area wajah, dan mengurangi kelelahan Bunda.',
    duration_minutes: 45,
    price: 0,
    target_age: 'Bunda',
    age_range: 'Bunda',
    sort_order: 12,
    is_active: true,
  },
];

export const OPERATING_SLOTS = [
  '08:30',
  '10:00',
  '11:30',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
];

export interface TimeSessionOption {
  id: string;
  name: string;
  timeRange: string;
  value: string;
  description: string;
}

export const TIME_SESSION_OPTIONS: TimeSessionOption[] = [
  {
    id: 'pagi',
    name: 'Sesi Pagi',
    timeRange: '08:30 – 11:30 WIB',
    value: 'Sesi Pagi (08:30 – 11:30 WIB)',
    description: 'Pagi hari segar, ideal untuk stimulasi motorik & berjemur',
  },
  {
    id: 'siang',
    name: 'Sesi Siang',
    timeRange: '13:00 – 15:30 WIB',
    value: 'Sesi Siang (13:00 – 15:30 WIB)',
    description: 'Waktu ideal setelah istirahat & tidur siang pertama',
  },
  {
    id: 'sore',
    name: 'Sesi Sore',
    timeRange: '16:00 – 18:00 WIB',
    value: 'Sesi Sore (16:00 – 18:00 WIB)',
    description: 'Relaksasi sore hari sebelum waktu istirahat malam',
  },
  {
    id: 'fleksibel',
    name: 'Fleksibel',
    timeRange: 'Menyesuaikan Jadwal Bidan',
    value: 'Fleksibel (Menyesuaikan Jadwal Bidan)',
    description: 'Waktu fleksibel, Bidan akan mencocokkan jadwal terbaik',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  clinic_name: 'Indah Mom & Baby Spa Comal',
  whatsapp_number: '6287856960422',
  clinic_address: 'Ds. Purwosari Dusun VI 47 RT 001/017, Dusun III, Pecangakan, Kec. Comal, Kabupaten Pemalang, Jawa Tengah 52363',
  admin_pin: '123456',
  operating_hours: 'Buka setiap hari hingga pukul 18.00 WIB',
  clinic_instagram: '@indahmombabyspa_comal',
};
