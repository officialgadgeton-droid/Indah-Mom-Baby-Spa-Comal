import React, { useState, useEffect, useMemo } from 'react';
import { Booking } from '../../types';
import { fetchAdminBookings, getAdminSessionPin, adminDeleteCustomerBookings } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  MessageCircle,
  Sparkles,
  Baby,
  MapPin,
  Calendar,
  History,
  X,
  RefreshCw,
  Phone,
  Clock,
  Building,
  Home,
  CheckCircle2,
  AlertCircle,
  FileText,
  Heart,
  Award,
  Trash2,
} from 'lucide-react';
import { PinConfirmModal } from './PinConfirmModal';

export interface AggregatedCustomer {
  normalizedPhone: string;
  whatsappNumber: string;
  momName: string;
  childName?: string;
  childAge?: string;
  lastAddress?: string;
  totalBookings: number;
  completedOrConfirmedCount: number;
  isLoyal: boolean; // >= 2 kunjungan terkonfirmasi / selesai
  lastVisitDate: string;
  servicesTaken: string[];
  bookingsHistory: Booking[];
}

interface CustomersTabProps {
  adminPin: string;
}

/**
 * Normalisasi nomor WhatsApp ke format internasional 628...
 */
export function normalizeWhatsApp(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('8')) {
    return '628' + digits.slice(1);
  }
  return digits;
}

/**
 * Format nomor WhatsApp untuk tampilan (misal 0812-3456-7891)
 */
export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  let local = digits;
  if (digits.startsWith('62')) {
    local = '0' + digits.slice(2);
  }
  if (local.length > 7) {
    return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  }
  return local || raw;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ adminPin }) => {
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'loyal' | 'new'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<AggregatedCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<AggregatedCustomer | null>(null);

  const loadData = async (showToast: boolean = false) => {
    setIsLoading(true);
    try {
      const activePin = (adminPin && adminPin.trim()) || getAdminSessionPin();
      const data = await fetchAdminBookings(activePin, undefined, 'all');
      setBookings(data);
      if (showToast) {
        success('Data pelanggan berhasil disinkronkan dari database Supabase.');
      }
    } catch (e) {
      console.error(e);
      error('Gagal memuat data pelanggan dari riwayat reservasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminPin]);

  // Agregasi bookings berdasarkan nomor WhatsApp dinormalisasi
  const customersList = useMemo<AggregatedCustomer[]>(() => {
    const map = new Map<string, Booking[]>();

    for (const b of bookings) {
      const norm = normalizeWhatsApp(b.whatsapp_number);
      const key = norm || b.whatsapp_number.trim();
      const existing = map.get(key) || [];
      existing.push(b);
      map.set(key, existing);
    }

    const result: AggregatedCustomer[] = [];

    map.forEach((customerBookings, normKey) => {
      // Urutkan booking dari yang paling baru
      const sorted = [...customerBookings].sort((a, b) => {
        const dateA = new Date(`${a.booking_date}T${a.booking_time || '00:00'}`).getTime();
        const dateB = new Date(`${b.booking_date}T${b.booking_time || '00:00'}`).getTime();
        return dateB - dateA;
      });

      // Hitung semua status aktif (pending, confirmed, dan completed — kecuali cancelled)
      // agar pelanggan yang baru saja booking (status pending) langsung muncul sebagai pelanggan terdaftar
      const activeBookings = sorted.filter(b => b.status !== 'cancelled');

      // Jika seluruh booking dibatalkan (cancelled), lewati agar tidak mengotori daftar pelanggan aktif
      if (activeBookings.length === 0) {
        return;
      }

      // Ambil data terbaru dari reservasi aktif (termasuk status pending yang baru saja dikirim Bunda)
      const latestActive = activeBookings[0];

      // Cari nama anak dan usia anak terbaru yang tidak kosong
      const childWithData =
        activeBookings.find(b => b.child_name && b.child_name.trim().length > 0) ||
        sorted.find(b => b.child_name && b.child_name.trim().length > 0);
      const addressWithData =
        activeBookings.find(b => b.address && b.address.trim().length > 0) ||
        sorted.find(b => b.address && b.address.trim().length > 0);

      // Hitung kunjungan selesai atau terkonfirmasi
      const completedOrConfirmed = activeBookings.filter(
        b => b.status === 'completed' || b.status === 'confirmed'
      ).length;

      // Status loyalitas: Pelanggan Tetap jika kunjungan selesai/terkonfirmasi >= 2
      const isLoyal = completedOrConfirmed >= 2;

      // Kumpulan nama layanan unik yang pernah diambil
      const uniqueServices = Array.from(
        new Set(activeBookings.map(b => b.service_name).filter(Boolean))
      );

      result.push({
        normalizedPhone: normKey,
        whatsappNumber: latestActive.whatsapp_number,
        momName: latestActive.mom_name,
        childName: childWithData?.child_name,
        childAge: childWithData?.child_age,
        lastAddress: addressWithData?.address,
        totalBookings: activeBookings.length,
        completedOrConfirmedCount: completedOrConfirmed,
        isLoyal,
        lastVisitDate: latestActive.booking_date,
        servicesTaken: uniqueServices,
        bookingsHistory: sorted,
      });
    });

    // Urutkan pelanggan berdasarkan loyalitas & kunjungan terbaru
    return result.sort((a, b) => {
      if (a.isLoyal && !b.isLoyal) return -1;
      if (!a.isLoyal && b.isLoyal) return 1;
      return new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime();
    });
  }, [bookings]);

  // Filter pencarian dan status loyalitas
  const filteredCustomers = useMemo(() => {
    return customersList.filter(cust => {
      // Filter status
      if (statusFilter === 'loyal' && !cust.isLoyal) return false;
      if (statusFilter === 'new' && cust.isLoyal) return false;

      // Filter query pencarian
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchMom = cust.momName.toLowerCase().includes(q);
      const matchChild = cust.childName ? cust.childName.toLowerCase().includes(q) : false;
      const matchPhone =
        cust.whatsappNumber.includes(q) || cust.normalizedPhone.includes(q);
      const matchService = cust.servicesTaken.some(s => s.toLowerCase().includes(q));

      return matchMom || matchChild || matchPhone || matchService;
    });
  }, [customersList, statusFilter, searchQuery]);

  // Statistik agregat
  const totalCustomers = customersList.length;
  const loyalCustomersCount = customersList.filter(c => c.isLoyal).length;
  const newCustomersCount = totalCustomers - loyalCustomersCount;
  const totalBookingsCount = bookings.length;

  const handleOpenWhatsApp = (customer: AggregatedCustomer) => {
    const cleanWa = normalizeWhatsApp(customer.whatsappNumber);
    const childGreeting = customer.childName ? ` serta Si Kecil ${customer.childName}` : '';
    const text = `Halo Bunda *${customer.momName}*${childGreeting} 🌸

Salam hangat dari *Indah Mom & Baby Spa Comal*. Kami ingin menanyakan kabar Bunda & Si Kecil setelah perawatan sebelumnya. Apakah ada keluhan atau kebutuhan perawatan lanjutan yang bisa kami bantu?

Terima kasih banyak telah mempercayakan kenyamanan Si Kecil kepada kami! ❤️`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatTanggalIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal-light">Total Bunda Terdata</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="font-serif font-bold text-2xl text-primary mt-1">
            {totalCustomers}
          </div>
          <span className="text-[11px] text-charcoal-light block mt-0.5">Database Pelanggan</span>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 font-semibold">Pelanggan Tetap</span>
            <Sparkles className="w-4 h-4 text-accent-dark" />
          </div>
          <div className="font-serif font-bold text-2xl text-accent-dark mt-1">
            {loyalCustomersCount}
          </div>
          <span className="text-[11px] text-amber-700 block mt-0.5">Kunjungan ≥ 2x</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-semibold">Pelanggan Baru</span>
            <Heart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-emerald-700 mt-1">
            {newCustomersCount}
          </div>
          <span className="text-[11px] text-emerald-700 block mt-0.5">Kunjungan Pertama</span>
        </div>

        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary font-semibold">Total Kunjungan</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="font-serif font-bold text-2xl text-primary mt-1">
            {totalBookingsCount}
          </div>
          <span className="text-[11px] text-purple-700 block mt-0.5">Seluruh Reservasi</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-primary/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari Bunda, nama anak, atau no. WA..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm text-charcoal bg-[#FDFBF7]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-charcoal hover:bg-slate-200'
              }`}
            >
              Semua ({totalCustomers})
            </button>
            <button
              onClick={() => setStatusFilter('loyal')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === 'loyal'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Pelanggan Tetap (≥ 2x) ({loyalCustomersCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === 'new'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Pelanggan Baru ({newCustomersCount})</span>
            </button>

            <button
              onClick={() => loadData(true)}
              title="Perbarui Data dari Supabase"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-charcoal-light hover:text-primary transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal-light">Mengagregasi riwayat database pelanggan...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-primary/10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-cream text-primary mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-primary mb-1">
            Tidak Ada Data Pelanggan yang Cocok
          </h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ditemukan pelanggan dengan kata kunci "${searchQuery}". Coba periksa ejaan atau ubah filter.`
              : 'Belum ada data reservasi pelanggan yang tercatat.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => {
            const displayPhone = formatPhoneDisplay(customer.whatsappNumber);

            return (
              <div
                key={customer.normalizedPhone}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  customer.isLoyal
                    ? 'border-amber-200/80 ring-1 ring-amber-300/40'
                    : 'border-primary/10'
                }`}
              >
                {/* Header Card */}
                <div className="p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-serif font-bold text-base text-primary leading-tight">
                        {customer.momName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-charcoal-light mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{displayPhone}</span>
                      </div>
                    </div>

                    {/* Badge Status Loyalitas */}
                    {customer.isLoyal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs shrink-0">
                        <Sparkles className="w-3 h-3" />
                        <span>Pelanggan Tetap</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        <Heart className="w-3 h-3" />
                        <span>Pelanggan Baru</span>
                      </span>
                    )}
                  </div>

                  {/* Info Si Kecil */}
                  {customer.childName && (
                    <div className="mt-2.5 p-2 rounded-xl bg-cream/70 border border-primary/5 flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent-dark flex items-center justify-center shrink-0">
                        <Baby className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-primary">{customer.childName}</span>
                        {customer.childAge && (
                          <span className="text-charcoal-light ml-1">({customer.childAge})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alamat Homecare jika ada */}
                  {customer.lastAddress && (
                    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-charcoal-light line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate" title={customer.lastAddress}>
                        {customer.lastAddress}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Card: Statistik & Layanan Terakhir */}
                <div className="p-4 sm:p-5 space-y-3 bg-[#FDFBF7]/60 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Ringkasan Angka Kunjungan */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <span className="text-charcoal-light flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Kunjungan Terakhir:
                      </span>
                      <strong className="text-primary font-semibold">
                        {formatTanggalIndo(customer.lastVisitDate)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-charcoal-light">Total Reservasi:</span>
                      <span className="font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full text-[11px]">
                        {customer.totalBookings}x Kunjungan
                      </span>
                    </div>

                    {/* Layanan yang pernah diambil */}
                    <div className="mt-2">
                      <span className="text-[11px] text-charcoal-light block mb-1.5 font-medium">
                        Layanan Pernah Diambil:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {customer.servicesTaken.slice(0, 3).map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-charcoal line-clamp-1"
                            title={srv}
                          >
                            {srv}
                          </span>
                        ))}
                        {customer.servicesTaken.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-charcoal-light font-bold">
                            +{customer.servicesTaken.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs transition-all"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Riwayat ({customer.totalBookings})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(customer)}
                        title="Follow-up WhatsApp Bunda"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </button>
                    </div>

                    {/* Tombol Hapus Data Pelanggan */}
                    <button
                      type="button"
                      onClick={() => setCustomerToDelete(customer)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/70 font-semibold text-xs transition-colors"
                      title="Hapus data pelanggan dan seluruh riwayat reservasinya"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Data Pelanggan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Riwayat Kunjungan Bunda */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-bounce-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-primary/20 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-primary to-primary-700 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl">{selectedCustomer.momName}</h3>
                  {selectedCustomer.isLoyal ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Pelanggan Tetap</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      Pelanggan Baru
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{formatPhoneDisplay(selectedCustomer.whatsappNumber)}</span>
                  </span>
                  {selectedCustomer.childName && (
                    <span className="flex items-center gap-1">
                      <Baby className="w-3.5 h-3.5" />
                      <span>
                        {selectedCustomer.childName}{' '}
                        {selectedCustomer.childAge ? `(${selectedCustomer.childAge})` : ''}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Timeline Kunjungan */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-accent" />
                  Riwayat Reservasi ({selectedCustomer.bookingsHistory.length})
                </span>
                <span className="text-xs text-charcoal-light">
                  Kunjungan Pertama: {formatTanggalIndo(selectedCustomer.bookingsHistory[selectedCustomer.bookingsHistory.length - 1].booking_date)}
                </span>
              </div>

              <div className="space-y-3">
                {selectedCustomer.bookingsHistory.map((booking, idx) => {
                  const isConfirmed = booking.status === 'confirmed';
                  const isCompleted = booking.status === 'completed';
                  const isCancelled = booking.status === 'cancelled';

                  return (
                    <div
                      key={booking.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-[#FDFBF7] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {booking.booking_code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-purple-100 text-primary'
                                  : isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isCancelled
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isCompleted
                                ? 'Selesai Treatment'
                                : isConfirmed
                                ? 'Terkonfirmasi'
                                : isCancelled
                                ? 'Dibatalkan'
                                : 'Menunggu Konfirmasi'}
                            </span>
                          </div>

                          <h5 className="font-serif font-bold text-sm text-primary mt-1">
                            {booking.service_name}
                          </h5>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-charcoal">
                            {formatTanggalIndo(booking.booking_date)}
                          </div>
                          <div className="text-[11px] text-accent-dark font-medium flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {booking.booking_time}{' '}
                              {booking.booking_time.includes('WIB') ? '' : 'WIB'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Tipe & Catatan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs text-charcoal-light">
                        <div className="flex items-center gap-1.5">
                          {booking.visit_type === 'Datang ke Klinik' ? (
                            <>
                              <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>Datang ke Klinik</span>
                            </>
                          ) : (
                            <>
                              <Home className="w-3.5 h-3.5 text-accent-dark shrink-0" />
                              <span className="text-accent-dark font-semibold">Homecare Bidan</span>
                            </>
                          )}
                        </div>

                        {booking.child_name && (
                          <div className="flex items-center gap-1.5">
                            <Baby className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                              {booking.child_name} {booking.child_age ? `(${booking.child_age})` : ''}
                            </span>
                          </div>
                        )}

                        {booking.address && (
                          <div className="sm:col-span-2 flex items-start gap-1.5 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{booking.address}</span>
                          </div>
                        )}

                        {booking.notes && (
                          <div className="sm:col-span-2 p-2 rounded-xl bg-white border border-slate-200 text-[11px] text-charcoal italic flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>"{booking.notes}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-charcoal hover:bg-slate-100"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerToDelete(selectedCustomer)}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                  title="Hapus pelanggan ini beserta seluruh riwayat reservasinya"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pelanggan</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(selectedCustomer)}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Follow-up WhatsApp Bunda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Data Pelanggan dengan Verifikasi PIN Admin */}
      {customerToDelete && (
        <PinConfirmModal
          isOpen={Boolean(customerToDelete)}
          onClose={() => setCustomerToDelete(null)}
          title="Hapus Data Pelanggan Permanen"
          itemSummary={
            <div className="space-y-1.5 text-xs text-charcoal">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Nama Bunda:</span>
                <span className="font-bold text-primary">{customerToDelete.momName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">No. WhatsApp:</span>
                <span className="font-mono font-semibold">{customerToDelete.whatsappNumber}</span>
              </div>
              {customerToDelete.childName && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Nama Si Kecil:</span>
                  <span>
                    {customerToDelete.childName} {customerToDelete.childAge ? `(${customerToDelete.childAge})` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Total Riwayat:</span>
                <span className="font-bold text-rose-700">{customerToDelete.totalBookings} reservasi</span>
              </div>
            </div>
          }
          warningText="Perhatian: Menghapus pelanggan ini akan menghapus SELURUH riwayat reservasi yang terhubung dengan nomor WhatsApp ini secara permanen dari Supabase dan memori lokal. Tindakan ini tidak dapat dibatalkan."
          confirmButtonText="Verifikasi & Hapus Seluruh Riwayat"
          onConfirm={async (enteredPin) => {
            const res = await adminDeleteCustomerBookings(enteredPin, customerToDelete.whatsappNumber);
            success(`Data Bunda ${customerToDelete.momName} dan ${res.count} riwayat reservasi berhasil dihapus.`);
            if (selectedCustomer?.whatsappNumber === customerToDelete.whatsappNumber) {
              setSelectedCustomer(null);
            }
            setCustomerToDelete(null);
            await loadData();
          }}
        />
      )}
    </div>
  );
};
