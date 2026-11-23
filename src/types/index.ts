export type ServiceCategory =
  | 'Baby & Kids Treatment'
  | 'Terapi & Paket Spesial'
  | 'Mom Treatment';

export type VisitType = 'Datang ke Klinik' | 'Homecare - Bidan ke Rumah';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  duration_minutes?: number;
  price?: number;
  target_age?: string;
  age_range?: string;
  sort_order?: number;
  is_active: boolean;
  created_at?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  visit_type: VisitType;
  service_id: string;
  service_name: string;
  service_price?: number;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM
  mom_name: string;
  whatsapp_number: string;
  child_name?: string;
  child_age?: string;
  address?: string;
  notes?: string;
  status: BookingStatus;
  created_at?: string;
  treatment_notes?: string;
  baby_weight_kg?: string;
}

export type OperationalStatus = 'open' | 'busy_homecare' | 'closed_today';

export interface ClinicOperationalStatus {
  status: OperationalStatus;
  note?: string;
  updated_at?: string;
}

export interface BlockedSlot {
  id: string;
  block_date: string; // YYYY-MM-DD
  block_time: string | null; // null if full day
  reason: string;
  created_at?: string;
}

export interface AppSettings {
  clinic_name: string;
  whatsapp_number: string;
  clinic_address: string;
  admin_pin: string;
  operating_hours: string;
  clinic_instagram: string;
}

export interface SavedCustomerData {
  mom_name: string;
  whatsapp_number: string;
  child_name: string;
  child_age: string;
  address: string;
}

export interface Testimonial {
  id: string;
  image_url: string;
  caption?: string;
  is_active: boolean;
  created_at?: string;
}

