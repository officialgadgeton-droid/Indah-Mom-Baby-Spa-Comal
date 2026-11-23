import { createClient } from '@supabase/supabase-js';
import {
  Service,
  Booking,
  BlockedSlot,
  AppSettings,
  Testimonial,
  TikTokVideo,
  OperationalStatus,
  ClinicOperationalStatus,
} from '../types';
import { INITIAL_SERVICES, DEFAULT_SETTINGS } from '../data/initialServices';
import { INITIAL_TESTIMONIALS } from '../data/initialTestimonials';
import { INITIAL_TIKTOK_VIDEOS } from '../data/initialTikTokVideos';

// Cek konfigurasi Supabase dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ==========================================
// LOCAL STORAGE MOCK ENGINE (PERSISTENT & REACTIVE)
// ==========================================
const STORAGE_KEYS = {
  SERVICES: 'imb_services_v2', // bump key to refresh to 12 new services
  BOOKINGS: 'imb_bookings_v2',
  BLOCKED_SLOTS: 'imb_blocked_slots',
  SETTINGS: 'imb_settings',
  CUSTOMER_DATA: 'indah_spa_customer_profile',
  TESTIMONIALS: 'indah_spa_testimonials',
  TIKTOK_VIDEOS: 'indah_spa_tiktok_videos',
  OPERATIONAL_STATUS: 'indah_spa_operational_status',
};

// Inisialisasi local database jika belum ada
function getLocalServices(): Service[] {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  }
  try {
    const parsed = JSON.parse(data);
    // If old cached data with old categories, refresh to INITIAL_SERVICES
    if (parsed.length > 0 && parsed[0].category === 'Baby Treatment') {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return parsed;
  } catch {
    return INITIAL_SERVICES;
  }
}

function getLocalBookings(): Booking[] {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (!data) {
    const sampleBookings: Booking[] = [
      {
        id: 'bk-sample-1',
        booking_code: 'IMB-20261122-A1B2',
        visit_type: 'Datang ke Klinik',
        service_id: 'srv-bk-2',
        service_name: 'Baby Spa (Gymball, Swim, Massage)',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '10:00',
        mom_name: 'Bunda Rina Setyowati',
        whatsapp_number: '081234567891',
        child_name: 'Alvaro',
        child_age: '6 Bulan',
        address: 'Comal, Pemalang',
        notes: 'Pertama kali coba baby spa, tolong dibimbing ya bidan.',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
      {
        id: 'bk-sample-2',
        booking_code: 'IMB-20261122-C3D4',
        visit_type: 'Homecare - Bidan ke Rumah',
        service_id: 'srv-tp-1',
        service_name: 'Paket Bapil (Sinar, Massage, Uap)',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '13:30',
        mom_name: 'Bunda Anisa Fitri',
        whatsapp_number: '085712349988',
        child_name: 'Baby Kenzo',
        child_age: '1 Bulan',
        address: 'Jl. Ahmad Yani No. 14, Comal (Depan Polsek Comal)',
        notes: 'Bayi batuk pilek 2 hari, hidung tersumbat.',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 'bk-sample-3',
        booking_code: 'IMB-20261115-E5F6',
        visit_type: 'Datang ke Klinik',
        service_id: 'srv-bk-1',
        service_name: 'Baby Massage & Spa Sehat',
        booking_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        booking_time: '09:00',
        mom_name: 'Bunda Rina Setyowati',
        whatsapp_number: '081234567891',
        child_name: 'Alvaro',
        child_age: '6 Bulan',
        address: 'Comal, Pemalang',
        notes: 'Alhamdulillah pijatan pertama sangat cocok, anak tidur lelap.',
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sampleBookings));
    return sampleBookings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function getLocalBlockedSlots(): BlockedSlot[] {
  const data = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getLocalSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed.whatsapp_number === '6281234567890' || parsed.clinic_address?.includes('Jl. Raya Comal')) {
      const updated = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        whatsapp_number: DEFAULT_SETTINGS.whatsapp_number,
        clinic_address: DEFAULT_SETTINGS.clinic_address,
        operating_hours: DEFAULT_SETTINGS.operating_hours,
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getLocalTestimonials(): Testimonial[] {
  const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
  if (!data) {
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Bersihkan dummy lama yang broken atau ber-ID testi-initial
      const cleaned = parsed.filter(
        (t: Testimonial) =>
          t &&
          t.id &&
          !t.id.startsWith('testi-initial') &&
          !t.image_url?.startsWith('/testimoni/chat-')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch {
    return [];
  }
}

export function getLocalTikTokVideos(): TikTokVideo[] {
  const data = localStorage.getItem(STORAGE_KEYS.TIKTOK_VIDEOS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(INITIAL_TIKTOK_VIDEOS));
    return INITIAL_TIKTOK_VIDEOS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_TIKTOK_VIDEOS;
  } catch {
    return INITIAL_TIKTOK_VIDEOS;
  }
}

// ==========================================
// API UNIFIED DATA SERVICES (SUPABASE + FALLBACK)
// ==========================================

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isValidUuid = (val?: string | null): boolean => Boolean(val && UUID_REGEX.test(val));

export function notifyServicesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('indah_spa_services_updated'));
  }
}

export async function fetchActiveServices(): Promise<Service[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          ...s,
          target_age: s.target_age || s.age_range || '',
          age_range: s.age_range || s.target_age || '',
          sort_order: s.sort_order ?? 0,
        })) as Service[];
      }
    } catch (e) {
      console.warn('Gagal fetch services dari Supabase, beralih ke cache lokal:', e);
    }
  }
  const local = getLocalServices().filter(s => s.is_active);
  return [...local].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function fetchAllServices(): Promise<Service[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => ({
          ...s,
          target_age: s.target_age || s.age_range || '',
          age_range: s.age_range || s.target_age || '',
          sort_order: s.sort_order ?? 0,
        })) as Service[];
      }
    } catch (e) {
      console.warn('Gagal fetch all services dari Supabase:', e);
    }
  }
  const local = getLocalServices();
  return [...local].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export const fetchAllServicesAdmin = fetchAllServices;

export async function fetchBookedSlots(targetDate: string): Promise<{ time: string; reason: string }[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_booked_slots', {
        target_date: targetDate,
      });
      if (!error && data) {
        return data.map((item: { booking_time: string; reason: string }) => ({
          time: item.booking_time,
          reason: item.reason || 'Penuh',
        }));
      }
    } catch (e) {
      console.warn('Gagal fetch booked slots via RPC, fallback ke lokal:', e);
    }
  }

  // Fallback Local Storage
  const bookings = getLocalBookings();
  const blocked = getLocalBlockedSlots();
  const bookedTimes: { time: string; reason: string }[] = [];

  bookings
    .filter(b => b.booking_date === targetDate && b.status === 'confirmed')
    .forEach(b => {
      bookedTimes.push({ time: b.booking_time, reason: 'Telah Dikonfirmasi' });
    });

  blocked
    .filter(bs => bs.block_date === targetDate)
    .forEach(bs => {
      bookedTimes.push({
        time: bs.block_time || 'ALL',
        reason: bs.reason || 'Jadwal Libur',
      });
    });

  return bookedTimes;
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'booking_code' | 'created_at'>
): Promise<{ success: boolean; booking: Booking; error?: string }> {
  const dateStr = bookingData.booking_date.replace(/-/g, '');
  const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingCode = `IMB-${dateStr}-${randCode}`;

  const newBooking: Booking = {
    ...bookingData,
    id: `bk-${Date.now()}`,
    booking_code: bookingCode,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      // PENTING: Pengunjung publik anonim HANYA memiliki izin INSERT pada tabel bookings (RLS).
      // DILARANG menambahkan .select() setelah .insert() karena operasi SELECT dibatasi untuk peran authenticated!
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            booking_code: newBooking.booking_code,
            visit_type: newBooking.visit_type,
            service_id: newBooking.service_id.startsWith('srv-') ? null : newBooking.service_id,
            service_name: newBooking.service_name,
            service_price: 0,
            booking_date: newBooking.booking_date,
            booking_time: newBooking.booking_time,
            mom_name: newBooking.mom_name,
            whatsapp_number: newBooking.whatsapp_number,
            child_name: newBooking.child_name || null,
            child_age: newBooking.child_age || null,
            address: newBooking.address || null,
            notes: newBooking.notes || null,
            status: newBooking.status || 'pending',
          },
        ]);

      if (error) {
        console.error('Gagal insert reservasi ke Supabase (RLS / Network Error):', error.message || error);
      }
    } catch (e) {
      console.error('Exception saat insert reservasi ke Supabase:', e);
    }
  }

  // Simpan selalu salinan ke localStorage agar sinkron di mode lokal / fallback
  const bookings = getLocalBookings();
  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

  return { success: true, booking: newBooking };
}

// ==========================================
// ADMIN DATA FUNCTIONS & SESSION PIN
// ==========================================

export const DEFAULT_ADMIN_PIN_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
export const STORAGE_KEY_CUSTOM_PIN_HASH = 'indah_spa_custom_pin_hash';
export const ADMIN_SESSION_PIN_KEY = 'indah_spa_session_pin';

/**
 * Mengambil PIN sesi admin yang valid dari sessionStorage
 */
export function getAdminSessionPin(): string {
  if (typeof window === 'undefined') return '';
  return (
    sessionStorage.getItem(ADMIN_SESSION_PIN_KEY) ||
    sessionStorage.getItem('imb_admin_pin') ||
    ''
  );
}

/**
 * Menyimpan PIN sesi admin ke sessionStorage
 */
export function setAdminSessionPin(pin: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_SESSION_PIN_KEY, pin);
  sessionStorage.setItem('imb_admin_pin', pin);
}

/**
 * Menghapus PIN sesi admin dari sessionStorage
 */
export function clearAdminSessionPin(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_SESSION_PIN_KEY);
  sessionStorage.removeItem('imb_admin_pin');
}

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

/**
 * Membaca hash PIN aktif dengan urutan prioritas:
 * 1. clinic_settings (Supabase) key: 'admin_pin_hash' jika Supabase terhubung & online
 * 2. indah_spa_custom_pin_hash (localStorage) jika Supabase tidak dikonfigurasi atau sedang offline
 * 3. VITE_ADMIN_PIN_HASH (Environment Variable)
 * 4. DEFAULT_ADMIN_PIN_HASH (Hash default untuk '123456')
 */
export async function getActivePinHash(): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('value')
        .eq('key', 'admin_pin_hash')
        .maybeSingle();

      if (!error && data?.value && data.value.trim()) {
        const cloudHash = data.value.trim().toLowerCase();
        // Sinkronkan juga cache localStorage untuk fallback offline
        localStorage.setItem(STORAGE_KEY_CUSTOM_PIN_HASH, cloudHash);
        return cloudHash;
      }
      if (error) {
        console.warn('Gagal membaca PIN hash dari Supabase clinic_settings (fallback ke lokal):', error);
      }
    } catch (e) {
      console.warn('Supabase offline saat membaca clinic_settings (fallback ke lokal):', e);
    }
  }

  // Hanya gunakan localStorage atau VITE_ADMIN_PIN_HASH jika Supabase tidak dikonfigurasi atau sedang offline
  const customLocalHash = localStorage.getItem(STORAGE_KEY_CUSTOM_PIN_HASH);
  if (customLocalHash && customLocalHash.trim()) {
    return customLocalHash.trim().toLowerCase();
  }

  const envHash = import.meta.env.VITE_ADMIN_PIN_HASH;
  if (envHash && envHash.trim()) {
    return envHash.trim().toLowerCase();
  }

  return DEFAULT_ADMIN_PIN_HASH;
}

/**
 * Menyimpan PIN baru dalam bentuk hash SHA-256 ke tabel clinic_settings Supabase dan localStorage
 */
export async function saveAdminPinHash(
  newPin: string,
  oldPin?: string
): Promise<{ success: boolean; hash: string }> {
  const newPinHash = await hashPin(newPin);

  // 1. Saat Supabase terhubung (isSupabaseConfigured), jalankan upsert ke clinic_settings terlebih dahulu
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('clinic_settings')
      .upsert(
        {
          key: 'admin_pin_hash',
          value: newPinHash,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    // Jangan tangkap/sembunyikan error secara diam-diam: lempar error tersebut agar UI menampilkan pesan gagal
    if (error) {
      console.error('Gagal upsert clinic_settings Supabase:', error);
      throw error;
    }

    // Sinkronkan juga ke RPC admin_update_setting jika tersedia
    if (oldPin) {
      try {
        await supabase.rpc('admin_update_setting', {
          pin_input: oldPin,
          p_key: 'admin_pin_hash',
          p_value: newPinHash,
        });
      } catch (e) {
        // Abaikan jika RPC belum diperbarui
      }
    }
  }

  // 2. Setelah upsert sukses (atau jika Supabase tidak dikonfigurasi), simpan juga ke localStorage
  localStorage.setItem(STORAGE_KEY_CUSTOM_PIN_HASH, newPinHash);

  // 3. Update session storage aktif
  setAdminSessionPin(newPin);

  return { success: true, hash: newPinHash };
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const inputHash = await hashPin(pin);
  const activeHash = await getActivePinHash();
  return inputHash === activeHash;
}

export async function fetchAdminBookings(
  pin: string,
  filterDate?: string,
  filterStatus?: string
): Promise<Booking[]> {
  const validPin = (pin && pin.trim()) || getAdminSessionPin();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_admin_bookings', {
        pin_input: validPin,
        p_date: filterDate || null,
        p_status: filterStatus === 'all' || !filterStatus ? null : filterStatus,
      });
      if (!error && data) {
        return data as Booking[];
      }
      if (error) {
        console.warn('RPC get_admin_bookings error:', error.message || error);
      }
    } catch (e) {
      console.warn('RPC get_admin_bookings error, fallback local:', e);
    }
  }

  let list = getLocalBookings();
  if (filterDate) {
    list = list.filter(b => b.booking_date === filterDate);
  }
  if (filterStatus && filterStatus !== 'all') {
    list = list.filter(b => b.status === filterStatus);
  }
  return list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export async function updateBookingStatus(
  pin: string,
  bookingId: string,
  status: Booking['status'],
  newBookingTime?: string
): Promise<boolean> {
  const timeToUpdate = newBookingTime && newBookingTime.trim() ? newBookingTime.trim() : null;

  if (supabase) {
    try {
      // Coba panggil RPC dengan parameter p_booking_time
      const { data, error } = await supabase.rpc('update_booking_status', {
        pin_input: pin,
        p_booking_id: bookingId,
        p_status: status,
        p_booking_time: timeToUpdate,
      });

      if (!error && data) {
        // Sinkronkan ke local storage
        const bookings = getLocalBookings();
        const idx = bookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          bookings[idx].status = status;
          if (timeToUpdate) {
            bookings[idx].booking_time = timeToUpdate;
          }
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        }
        return true;
      }

      if (error) {
        console.warn('RPC update_booking_status dengan jam error, mencoba fallback parameter:', error);
        // Fallback jika database Supabase belum menjalankan revisi schema RPC
        const fallbackRes = await supabase.rpc('update_booking_status', {
          pin_input: pin,
          p_booking_id: bookingId,
          p_status: status,
        });

        if (!fallbackRes.error) {
          if (timeToUpdate) {
            // Update waktu langsung ke tabel jika kolom tersedia
            await supabase
              .from('bookings')
              .update({ booking_time: timeToUpdate })
              .eq('id', bookingId);
          }
          // Sinkronkan ke local storage
          const bookings = getLocalBookings();
          const idx = bookings.findIndex(b => b.id === bookingId);
          if (idx !== -1) {
            bookings[idx].status = status;
            if (timeToUpdate) {
              bookings[idx].booking_time = timeToUpdate;
            }
            localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('RPC update_booking_status error:', e);
    }
  }

  // Local storage fallback
  const bookings = getLocalBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = status;
    if (timeToUpdate) {
      bookings[idx].booking_time = timeToUpdate;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return true;
  }
  return false;
}

/**
 * Memperbarui jam kedatangan / kunjungan final reservasi oleh Bidan
 */
export async function updateBookingTime(
  pin: string,
  bookingId: string,
  newBookingTime: string
): Promise<boolean> {
  const bookings = getLocalBookings();
  const current = bookings.find(b => b.id === bookingId);
  const currentStatus = current ? current.status : 'confirmed';
  return updateBookingStatus(pin, bookingId, currentStatus, newBookingTime);
}

/**
 * Hapus data reservasi permanen dengan verifikasi PIN Admin (Supabase RPC + LocalStorage Fallback)
 */
export async function adminDeleteBooking(pin: string, bookingId: string): Promise<boolean> {
  const isValid = await verifyAdminPin(pin);
  if (!isValid) {
    throw new Error('PIN Admin tidak valid!');
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_delete_booking', {
        pin_input: pin,
        p_booking_id: bookingId,
      });
      if (error) {
        console.error('RPC admin_delete_booking error:', error);
        throw new Error(error.message || 'Gagal menghapus reservasi di Supabase');
      }
    } catch (e) {
      if ((e as Error).message?.includes('PIN Admin tidak valid')) {
        throw e;
      }
      console.warn('Supabase offline / RPC error, fallback ke local storage:', e);
    }
  }

  // Sinkronkan selalu ke local storage
  const bookings = getLocalBookings();
  const filtered = bookings.filter(b => b.id !== bookingId);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(filtered));
  return true;
}

/**
 * Hapus seluruh riwayat reservasi pelanggan berdasarkan nomor WA dengan verifikasi PIN Admin (Supabase RPC + LocalStorage Fallback)
 */
export async function adminDeleteCustomerBookings(
  pin: string,
  whatsappNumber: string
): Promise<{ success: boolean; count: number }> {
  const isValid = await verifyAdminPin(pin);
  if (!isValid) {
    throw new Error('PIN Admin tidak valid!');
  }

  let deletedCount = 0;

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_delete_customer_bookings', {
        pin_input: pin,
        p_whatsapp_number: whatsappNumber,
      });
      if (error) {
        console.error('RPC admin_delete_customer_bookings error:', error);
        throw new Error(error.message || 'Gagal menghapus data pelanggan di Supabase');
      }
      deletedCount = typeof data === 'number' ? data : 0;
    } catch (e) {
      if ((e as Error).message?.includes('PIN Admin tidak valid')) {
        throw e;
      }
      console.warn('Supabase offline / RPC error, fallback ke local storage:', e);
    }
  }

  // Sinkronkan selalu ke local storage
  const targetDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const targetNorm = targetDigits.startsWith('0')
    ? '62' + targetDigits.slice(1)
    : targetDigits.startsWith('8')
    ? '628' + targetDigits.slice(1)
    : targetDigits;

  const bookings = getLocalBookings();
  const remaining = bookings.filter(b => {
    const bDigits = b.whatsapp_number.replace(/[^0-9]/g, '');
    const bNorm = bDigits.startsWith('0')
      ? '62' + bDigits.slice(1)
      : bDigits.startsWith('8')
      ? '628' + bDigits.slice(1)
      : bDigits;
    const matches = b.whatsapp_number === whatsappNumber || (bNorm && bNorm === targetNorm);
    return !matches;
  });

  const localDeleted = bookings.length - remaining.length;
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(remaining));

  return { success: true, count: deletedCount || localDeleted };
}

/**
 * Simpan catatan tindakan Bidan dan berat badan bayi ke database (Supabase RPC + LocalStorage Fallback)
 */
export async function adminSaveTreatmentNote(
  pin: string,
  bookingId: string,
  treatmentNotes: string,
  babyWeightKg?: string,
  markCompleted: boolean = false
): Promise<boolean> {
  const effectivePin = (pin && pin.trim()) || getAdminSessionPin();
  const cleanWeight = babyWeightKg && babyWeightKg.trim() ? babyWeightKg.trim() : null;
  const cleanNotes = treatmentNotes.trim();

  let rpcSuccess = false;

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_save_treatment_note', {
        pin_input: effectivePin,
        p_booking_id: bookingId,
        p_treatment_notes: cleanNotes,
        p_baby_weight_kg: cleanWeight,
        p_mark_completed: markCompleted,
      });

      if (!error && (data === true || data === null || data !== undefined)) {
        rpcSuccess = true;
      } else if (error) {
        console.warn('RPC admin_save_treatment_note error, fallback local:', error);
      }
    } catch (e) {
      console.warn('RPC admin_save_treatment_note exception, fallback local:', e);
    }
  }

  // Sinkronkan ke local storage
  const bookings = getLocalBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].treatment_notes = cleanNotes;
    if (cleanWeight) {
      bookings[idx].baby_weight_kg = cleanWeight;
    }
    if (markCompleted) {
      bookings[idx].status = 'completed';
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('indah_spa_bookings_updated'));
    }
    return true;
  }

  return rpcSuccess;
}

/**
 * Membaca status operasional klinik real-time (Supabase clinic_settings + LocalStorage fallback)
 * Mengambil baris pertama dari public.clinic_settings dengan .limit(1).maybeSingle()
 */
export async function fetchClinicSettings(): Promise<ClinicOperationalStatus> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('operational_status, operational_note, updated_at')
        .not('operational_status', 'is', null)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.operational_status) {
        const result: ClinicOperationalStatus = {
          status: (data.operational_status as OperationalStatus) || 'open',
          note: data.operational_note || '',
          updated_at: data.updated_at,
        };
        localStorage.setItem(STORAGE_KEYS.OPERATIONAL_STATUS, JSON.stringify(result));
        return result;
      }
    } catch (e) {
      console.warn('Gagal membaca operational status dari Supabase (fallback local):', e);
    }
  }

  // Fallback ke local storage
  const raw = localStorage.getItem(STORAGE_KEYS.OPERATIONAL_STATUS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return { status: 'open', note: '' };
}

// Alias untuk kompatibilitas ke belakang
export const fetchClinicOperationalStatus = fetchClinicSettings;

/**
 * Memperbarui status operasional klinik secara real-time oleh Bidan (Supabase RPC + LocalStorage fallback)
 */
export async function updateClinicOperationalStatus(
  pin: string,
  status: OperationalStatus,
  note?: string
): Promise<boolean> {
  const effectivePin = (pin && pin.trim()) || getAdminSessionPin();
  const cleanNote = note && note.trim() ? note.trim() : null;

  if (supabase) {
    try {
      const { error } = await supabase.rpc('admin_update_operational_status', {
        pin_input: effectivePin,
        p_status: status,
        p_note: cleanNote,
      });

      if (error) {
        console.warn('RPC admin_update_operational_status error, fallback direct upsert/local:', error);
        await supabase
          .from('clinic_settings')
          .upsert({
            key: 'clinic_operational_status',
            value: status,
            operational_status: status,
            operational_note: cleanNote,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (e) {
      console.warn('RPC admin_update_operational_status exception, fallback local:', e);
      try {
        await supabase
          .from('clinic_settings')
          .upsert({
            key: 'clinic_operational_status',
            value: status,
            operational_status: status,
            operational_note: cleanNote,
            updated_at: new Date().toISOString(),
          });
      } catch {}
    }
  }

  // Simpan ke local storage
  const statusObj: ClinicOperationalStatus = {
    status,
    note: cleanNote || '',
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.OPERATIONAL_STATUS, JSON.stringify(statusObj));

  // Pancarkan event agar seluruh tab dan komponen aktif langsung memperbarui UI seketika
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('indah_spa_operational_status_updated', { detail: statusObj })
    );
  }

  return true;
}

export async function saveService(
  pin: string,
  service: Partial<Service> & { name: string; category: Service['category'] }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const pinInput =
    pin ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem('indah_spa_session_pin') ||
        sessionStorage.getItem('imb_admin_pin') ||
        ''
      : '');

  if (supabase) {
    try {
      const isUuid = isValidUuid(service.id);
      let action: 'create' | 'update' = isUuid ? 'update' : 'create';
      let serviceId: string | null = isUuid ? service.id! : null;

      // Jika ID ada tapi dummy (bukan format UUID standard), cari UUID-nya di Supabase berdasarkan nama
      if (service.id && !isUuid) {
        const { data: existing } = await supabase
          .from('services')
          .select('id')
          .eq('name', service.name)
          .maybeSingle();

        if (existing && isValidUuid(existing.id)) {
          action = 'update';
          serviceId = existing.id;
        } else {
          action = 'create';
          serviceId = null;
        }
      }

      const { data, error } = await supabase.rpc('admin_manage_service', {
        pin_input: pinInput,
        p_action: action,
        p_id: serviceId,
        p_category: service.category,
        p_name: service.name,
        p_description: service.description || '',
        p_duration_minutes: service.duration_minutes || 45,
        p_age_range: service.age_range || service.target_age || '',
        p_is_active: service.is_active ?? true,
        p_sort_order: service.sort_order ?? 0,
      });

      if (error) {
        console.error('RPC admin_manage_service error:', error);
        return { success: false, error: error.message || 'Gagal menyimpan layanan ke Supabase.' };
      }

      const savedId = (data as any)?.id || serviceId || `srv-${Date.now()}`;

      // Update mirror di LocalStorage
      const list = getLocalServices();
      const existingIdx = list.findIndex(
        s => s.id === service.id || s.id === savedId || s.name === service.name
      );
      const updatedSrv: Service = {
        id: savedId,
        category: service.category,
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes || 45,
        price: 0,
        target_age: service.target_age || service.age_range || '',
        age_range: service.age_range || service.target_age || '',
        sort_order: service.sort_order ?? 0,
        is_active: service.is_active ?? true,
      };

      if (existingIdx !== -1) {
        list[existingIdx] = updatedSrv;
      } else {
        list.push(updatedSrv);
      }
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
      notifyServicesUpdated();

      return { success: true, id: savedId };
    } catch (e: any) {
      console.error('RPC admin_manage_service exception:', e);
      return { success: false, error: e?.message || 'Terjadi kesalahan sistem saat memanggil RPC layanan.' };
    }
  }

  // Fallback Local Storage Mode
  const list = getLocalServices();
  if (service.id) {
    const idx = list.findIndex(s => s.id === service.id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...service,
        target_age: service.target_age || service.age_range || list[idx].target_age,
        age_range: service.age_range || service.target_age || list[idx].age_range,
        sort_order: service.sort_order ?? list[idx].sort_order ?? 0,
      } as Service;
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
      notifyServicesUpdated();
      return { success: true, id: service.id };
    }
  }

  const newSrv: Service = {
    id: `srv-${Date.now()}`,
    category: service.category,
    name: service.name,
    description: service.description || '',
    duration_minutes: service.duration_minutes || 45,
    price: 0,
    target_age: service.target_age || service.age_range || '',
    age_range: service.age_range || service.target_age || '',
    sort_order: service.sort_order ?? (list.length + 1),
    is_active: service.is_active ?? true,
  };
  list.push(newSrv);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
  notifyServicesUpdated();
  return { success: true, id: newSrv.id };
}

export async function toggleServiceStatus(
  pin: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const pinInput =
    pin ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem('indah_spa_session_pin') ||
        sessionStorage.getItem('imb_admin_pin') ||
        ''
      : '');

  if (supabase) {
    try {
      let targetId: string | null = isValidUuid(id) ? id : null;

      if (!targetId) {
        const local = getLocalServices().find(s => s.id === id);
        if (local) {
          const { data: found } = await supabase
            .from('services')
            .select('id')
            .eq('name', local.name)
            .maybeSingle();
          if (found && isValidUuid(found.id)) {
            targetId = found.id;
          }
        }
      }

      if (!targetId) {
        return {
          success: false,
          error: 'ID layanan bukan UUID valid. Mohon edit atau buat ulang layanan di database Supabase.',
        };
      }

      const { error } = await supabase.rpc('admin_manage_service', {
        pin_input: pinInput,
        p_action: 'toggle_active',
        p_id: targetId,
        p_category: null,
        p_name: null,
        p_description: null,
        p_duration_minutes: null,
        p_age_range: null,
        p_is_active: null,
        p_sort_order: null,
      });

      if (error) {
        console.error('RPC toggle_active error:', error);
        return { success: false, error: error.message || 'Gagal mengubah status layanan.' };
      }

      const list = getLocalServices();
      const idx = list.findIndex(s => s.id === id || s.id === targetId);
      if (idx !== -1) {
        list[idx].is_active = !list[idx].is_active;
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
      }
      notifyServicesUpdated();

      return { success: true };
    } catch (e: any) {
      console.error('RPC toggle_active exception:', e);
      return { success: false, error: e?.message || 'Gagal mengubah status layanan.' };
    }
  }

  const list = getLocalServices();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx].is_active = !list[idx].is_active;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    notifyServicesUpdated();
    return { success: true };
  }
  return { success: false, error: 'Layanan tidak ditemukan di local database.' };
}

export async function deleteService(
  pin: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const pinInput =
    pin ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem('indah_spa_session_pin') ||
        sessionStorage.getItem('imb_admin_pin') ||
        ''
      : '');

  if (supabase) {
    try {
      let targetId: string | null = isValidUuid(id) ? id : null;

      if (!targetId) {
        const local = getLocalServices().find(s => s.id === id);
        if (local) {
          const { data: found } = await supabase
            .from('services')
            .select('id')
            .eq('name', local.name)
            .maybeSingle();
          if (found && isValidUuid(found.id)) {
            targetId = found.id;
          }
        }
      }

      if (!targetId) {
        return {
          success: false,
          error: 'ID layanan bukan UUID valid. Mohon pastikan layanan telah tersinkron di Supabase.',
        };
      }

      const { error } = await supabase.rpc('admin_manage_service', {
        pin_input: pinInput,
        p_action: 'delete',
        p_id: targetId,
        p_category: null,
        p_name: null,
        p_description: null,
        p_duration_minutes: null,
        p_age_range: null,
        p_is_active: null,
        p_sort_order: null,
      });

      if (error) {
        console.error('RPC delete service error:', error);
        return { success: false, error: error.message || 'Gagal menghapus layanan dari Supabase.' };
      }

      const list = getLocalServices();
      const filtered = list.filter(s => s.id !== id && s.id !== targetId);
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
      notifyServicesUpdated();

      return { success: true };
    } catch (e: any) {
      console.error('RPC delete service exception:', e);
      return { success: false, error: e?.message || 'Gagal menghapus layanan.' };
    }
  }

  const list = getLocalServices();
  const filtered = list.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
  notifyServicesUpdated();
  return { success: true };
}

export async function fetchBlockedSlots(): Promise<BlockedSlot[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blocked_slots')
        .select('*')
        .order('block_date', { ascending: true });
      if (!error && data) {
        return data as BlockedSlot[];
      }
    } catch (e) {
      console.warn('Fetch blocked slots error:', e);
    }
  }
  return getLocalBlockedSlots();
}

export async function addBlockedSlot(
  pin: string,
  blockDate: string,
  blockTime: string | null,
  reason: string
): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.rpc('admin_manage_blocked_slot', {
        pin_input: pin,
        p_action: 'create',
        p_block_date: blockDate,
        p_block_time: blockTime,
        p_reason: reason,
      });
      if (!error) return true;
    } catch (e) {
      console.warn('RPC add blocked slot error:', e);
    }
  }

  const list = getLocalBlockedSlots();
  const newSlot: BlockedSlot = {
    id: `bs-${Date.now()}`,
    block_date: blockDate,
    block_time: blockTime || null,
    reason: reason || 'Jadwal Libur',
    created_at: new Date().toISOString(),
  };
  list.push(newSlot);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(list));
  return true;
}

export async function deleteBlockedSlot(pin: string, id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.rpc('admin_manage_blocked_slot', {
        pin_input: pin,
        p_action: 'delete',
        p_id: id,
      });
      if (!error) return true;
    } catch (e) {
      console.warn('RPC delete blocked slot error:', e);
    }
  }

  const list = getLocalBlockedSlots();
  const filtered = list.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(filtered));
  return true;
}

export async function updateAppSetting(pin: string, key: string, value: string): Promise<boolean> {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('admin_update_setting', {
        pin_input: pin,
        p_key: key,
        p_value: value,
      });
      if (!error && data) return true;
    } catch (e) {
      console.warn('RPC update setting error:', e);
    }
  }

  const settings = getLocalSettings();
  (settings as unknown as Record<string, string>)[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return true;
}

// ==========================================
// TESTIMONIALS (WHATSAPP SCREENSHOTS)
// ==========================================

export async function fetchActiveTestimonials(): Promise<Testimonial[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Gagal fetch active testimonials dari Supabase:', error);
      } else if (data) {
        return data as Testimonial[];
      }
    } catch (e) {
      console.warn('Gagal fetch testimonials dari Supabase, fallback ke lokal:', e);
    }
  }

  return getLocalTestimonials().filter(t => t.is_active);
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal fetch all testimonials dari Supabase:', error);
        throw new Error(error.message || 'Gagal memuat daftar testimoni dari server.');
      }

      if (data) {
        return data as Testimonial[];
      }
    } catch (e: any) {
      console.warn('Gagal fetch all testimonials dari Supabase:', e);
      if (isSupabaseConfigured) {
        throw e;
      }
    }
  }

  return getLocalTestimonials();
}

// Alias untuk kompatibilitas ke belakang
export const fetchAllTestimonialsAdmin = fetchAdminTestimonials;

export async function uploadTestimonialImage(
  file: Blob,
  fileName: string
): Promise<{ url: string | null; error?: string }> {
  if (!supabase) {
    return { url: null, error: 'Koneksi Supabase belum aktif.' };
  }

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('testimonials')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return {
        url: null,
        error: uploadError.message || 'Gagal mengunggah foto ke storage Supabase.',
      };
    }

    const { data } = supabase.storage
      .from('testimonials')
      .getPublicUrl(uploadData?.path || fileName);

    if (!data?.publicUrl) {
      return { url: null, error: 'Gagal mendapatkan Public URL dari Supabase Storage.' };
    }

    return { url: data.publicUrl };
  } catch (err: any) {
    console.error('Gagal upload gambar ke Supabase Storage:', err);
    return {
      url: null,
      error: err?.message || 'Terjadi kesalahan jaringan saat upload ke storage.',
    };
  }
}

export async function saveTestimonial(
  pin: string,
  testimonial: {
    id?: string;
    image_url: string;
    caption?: string;
    is_active?: boolean;
  }
): Promise<Testimonial> {
  const effectivePin = pin || getAdminSessionPin();
  const isUpdate = Boolean(testimonial.id && !testimonial.id.startsWith('testi-'));

  if (supabase) {
    if (!effectivePin) {
      throw new Error('PIN sesi admin tidak ditemukan. Silakan login ulang.');
    }

    // WAJIB memanggil RPC admin_manage_testimonial (bukan .from('testimonials').insert/update)
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_manage_testimonial', {
      pin_input: effectivePin,
      p_action: isUpdate ? 'update' : 'create',
      p_id: isUpdate ? testimonial.id : null,
      p_image_url: testimonial.image_url,
      p_caption: testimonial.caption || '',
      p_is_active: testimonial.is_active ?? true,
    });

    if (rpcError) {
      console.error('RPC admin_manage_testimonial error:', rpcError);
      throw new Error(rpcError.message || 'Gagal menyimpan testimoni via RPC');
    }

    if (!rpcData) {
      throw new Error('Gagal mendapatkan ID konfirmasi testimoni dari server.');
    }

    return {
      id: rpcData,
      image_url: testimonial.image_url,
      caption: testimonial.caption,
      is_active: testimonial.is_active ?? true,
      created_at: new Date().toISOString(),
    };
  }

  // Fallback Local Storage Mode
  const list = getLocalTestimonials();
  if (testimonial.id) {
    const idx = list.findIndex(t => t.id === testimonial.id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...testimonial,
        is_active: testimonial.is_active ?? list[idx].is_active,
      };
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
      return list[idx];
    }
  }

  const newTesti: Testimonial = {
    id: `testi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    image_url: testimonial.image_url,
    caption: testimonial.caption,
    is_active: testimonial.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  list.unshift(newTesti);
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
  return newTesti;
}

export async function toggleTestimonialStatus(pin: string, id: string): Promise<boolean> {
  const effectivePin = pin || getAdminSessionPin();

  if (supabase) {
    const isLocalId = id.startsWith('testi-');
    if (!isLocalId) {
      if (!effectivePin) {
        throw new Error('PIN sesi admin tidak ditemukan. Silakan login ulang.');
      }

      // WAJIB memanggil RPC admin_manage_testimonial (bukan .from('testimonials').update)
      const { error } = await supabase.rpc('admin_manage_testimonial', {
        pin_input: effectivePin,
        p_action: 'toggle_active',
        p_id: id,
        p_image_url: null,
        p_caption: null,
        p_is_active: true,
      });

      if (error) {
        console.error('RPC toggle testimonial status error:', error);
        throw new Error(error.message || 'Gagal mengubah status testimoni via RPC');
      }
      return true;
    }
  }

  const list = getLocalTestimonials();
  const idx = list.findIndex(t => t.id === id);
  if (idx !== -1) {
    list[idx].is_active = !list[idx].is_active;
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(list));
    return true;
  }
  return false;
}

export async function deleteTestimonial(pin: string, id: string): Promise<boolean> {
  const effectivePin = pin || getAdminSessionPin();

  if (supabase) {
    const isLocalId = id.startsWith('testi-');
    if (!isLocalId) {
      if (!effectivePin) {
        throw new Error('PIN sesi admin tidak ditemukan. Silakan login ulang.');
      }

      // WAJIB memanggil RPC admin_manage_testimonial (bukan .from('testimonials').delete)
      const { error } = await supabase.rpc('admin_manage_testimonial', {
        pin_input: effectivePin,
        p_action: 'delete',
        p_id: id,
        p_image_url: null,
        p_caption: null,
        p_is_active: false,
      });

      if (error) {
        console.error('RPC delete testimonial error:', error);
        throw new Error(error.message || 'Gagal menghapus testimoni via RPC');
      }
      return true;
    }
  }

  const list = getLocalTestimonials();
  const filtered = list.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(filtered));
  return true;
}

// ==========================================
// TIKTOK VIDEOS MANAGEMENT
// ==========================================

/**
 * Mengekstrak angka ID video dari salah satu dari 3 format input:
 * 1. URL Video TikTok (contoh: https://www.tiktok.com/@indah_mom.baby_spa_comal/video/7710550696680000789)
 * 2. Kode Embed <iframe> lengkap dari TikTok (contoh: <iframe ... src="https://www.tiktok.com/player/v1/7710550696680000789?..."></iframe>)
 * 3. Angka Video ID langsung (contoh: 7710550696680000789)
 */
export function extractTikTokVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/player\/v1\/(\d+)|\/video\/(\d+)|^(\d{15,25})$/);
  if (match) {
    return match[1] || match[2] || match[3] || null;
  }
  return null;
}

/**
 * Mendeteksi apakah URL merupakan tautan pendek TikTok (vt.tiktok.com / vm.tiktok.com)
 */
export function isTikTokShortLink(url: string): boolean {
  if (!url) return false;
  return /vt\.tiktok\.com|vm\.tiktok\.com/i.test(url.trim());
}

/**
 * Mengambil daftar video TikTok yang berstatus aktif untuk halaman depan (publik)
 */
export async function fetchActiveTikTokVideos(): Promise<TikTokVideo[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tiktok_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Gagal fetch active TikTok videos dari Supabase:', error);
      } else if (data) {
        return data as TikTokVideo[];
      }
    } catch (e) {
      console.warn('Gagal fetch active TikTok videos dari Supabase, fallback ke lokal:', e);
    }
  }

  return getLocalTikTokVideos().filter((v) => v.is_active);
}

/**
 * Mengambil seluruh daftar video TikTok untuk Dashboard Admin
 */
export async function fetchAdminTikTokVideos(): Promise<TikTokVideo[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tiktok_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal fetch all TikTok videos dari Supabase:', error);
        throw new Error(error.message || 'Gagal memuat daftar video TikTok dari server.');
      } else if (data) {
        return data as TikTokVideo[];
      }
    } catch (e: any) {
      console.warn('Gagal fetch all TikTok videos dari Supabase:', e);
      if (isSupabaseConfigured) {
        throw e;
      }
    }
  }

  return getLocalTikTokVideos();
}

/**
 * Memanggil fungsi RPC PostgreSQL `admin_manage_tiktok` di Supabase
 */
export async function adminManageTikTok(
  pin: string,
  action: 'create' | 'update' | 'toggle_active' | 'delete',
  payload?: {
    id?: string;
    title?: string;
    tiktok_url?: string;
    video_id?: string;
    is_active?: boolean;
  }
): Promise<string> {
  const effectivePin = pin || getAdminSessionPin();
  if (!effectivePin) {
    throw new Error('PIN sesi admin tidak ditemukan. Silakan verifikasi PIN Anda kembali.');
  }

  if (!supabase) {
    throw new Error('Koneksi Supabase tidak aktif. Berjalan dalam mode LocalStorage.');
  }

  const { data, error } = await supabase.rpc('admin_manage_tiktok', {
    pin_input: effectivePin,
    p_action: action,
    p_id: payload?.id || null,
    p_title: payload?.title || null,
    p_tiktok_url: payload?.tiktok_url || null,
    p_video_id: payload?.video_id || null,
    p_is_active: payload?.is_active ?? true,
  });

  if (error) {
    console.error(`RPC admin_manage_tiktok (${action}) error:`, error);
    throw new Error(error.message || `Gagal menjalankan aksi ${action} pada video TikTok.`);
  }

  return data as string;
}

/**
 * Menyimpan atau memperbarui video TikTok (Dual-Mode: Supabase RPC + LocalStorage Fallback)
 */
export async function saveTikTokVideo(
  pin: string,
  video: {
    id?: string;
    title: string;
    tiktok_url: string;
    video_id: string;
    is_active?: boolean;
  }
): Promise<TikTokVideo> {
  const effectivePin = pin || getAdminSessionPin();
  const isUpdate = Boolean(video.id && !video.id.startsWith('tiktok-sample-') && !video.id.startsWith('tiktok-local-'));

  const cleanVideoId = video.video_id.trim();
  const cleanTiktokUrl = `https://www.tiktok.com/@indah_mom.baby_spa_comal/video/${cleanVideoId}`;

  if (supabase) {
    try {
      const resId = await adminManageTikTok(effectivePin, isUpdate ? 'update' : 'create', {
        id: isUpdate ? video.id : undefined,
        title: video.title.trim(),
        tiktok_url: cleanTiktokUrl,
        video_id: cleanVideoId,
        is_active: video.is_active ?? true,
      });

      const savedItem: TikTokVideo = {
        id: resId || video.id || `tiktok-saved-${Date.now()}`,
        title: video.title.trim(),
        tiktok_url: cleanTiktokUrl,
        video_id: cleanVideoId,
        is_active: video.is_active ?? true,
        created_at: new Date().toISOString(),
      };

      // Sinkronkan juga ke local storage sebagai cache
      const list = getLocalTikTokVideos();
      const existingIdx = list.findIndex((v) => v.id === savedItem.id);
      if (existingIdx !== -1) {
        list[existingIdx] = savedItem;
      } else {
        list.unshift(savedItem);
      }
      localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('indah_spa_tiktok_videos_updated'));

      return savedItem;
    } catch (e) {
      if (isSupabaseConfigured) throw e;
      console.warn('Fallback save TikTok video ke LocalStorage:', e);
    }
  }

  // Fallback Local Storage
  const list = getLocalTikTokVideos();
  if (video.id) {
    const idx = list.findIndex((v) => v.id === video.id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        title: video.title.trim(),
        tiktok_url: cleanTiktokUrl,
        video_id: cleanVideoId,
        is_active: video.is_active ?? list[idx].is_active,
      };
      localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('indah_spa_tiktok_videos_updated'));
      return list[idx];
    }
  }

  const newVideo: TikTokVideo = {
    id: `tiktok-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: video.title.trim(),
    tiktok_url: cleanTiktokUrl,
    video_id: cleanVideoId,
    is_active: video.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  list.unshift(newVideo);
  localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('indah_spa_tiktok_videos_updated'));
  return newVideo;
}

/**
 * Mengubah status aktif / sembunyikan video TikTok
 */
export async function toggleTikTokVideoStatus(pin: string, id: string): Promise<boolean> {
  const effectivePin = pin || getAdminSessionPin();

  if (supabase) {
    const isLocalId = id.startsWith('tiktok-sample-') || id.startsWith('tiktok-local-');
    if (!isLocalId) {
      try {
        await adminManageTikTok(effectivePin, 'toggle_active', { id });
      } catch (e) {
        if (isSupabaseConfigured) throw e;
        console.warn('Fallback toggle TikTok video status ke LocalStorage:', e);
      }
    }
  }

  const list = getLocalTikTokVideos();
  const idx = list.findIndex((v) => v.id === id);
  if (idx !== -1) {
    list[idx].is_active = !list[idx].is_active;
    localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('indah_spa_tiktok_videos_updated'));
    return true;
  }
  return false;
}

/**
 * Menghapus video TikTok
 */
export async function deleteTikTokVideo(pin: string, id: string): Promise<boolean> {
  const effectivePin = pin || getAdminSessionPin();

  if (supabase) {
    const isLocalId = id.startsWith('tiktok-sample-') || id.startsWith('tiktok-local-');
    if (!isLocalId) {
      try {
        await adminManageTikTok(effectivePin, 'delete', { id });
      } catch (e) {
        if (isSupabaseConfigured) throw e;
        console.warn('Fallback delete TikTok video ke LocalStorage:', e);
      }
    }
  }

  const list = getLocalTikTokVideos();
  const filtered = list.filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEYS.TIKTOK_VIDEOS, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('indah_spa_tiktok_videos_updated'));
  return true;
}


