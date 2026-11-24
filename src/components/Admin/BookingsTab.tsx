import React, { useState, useEffect } from 'react';
import { Booking, Service } from '../../types';
import {
  fetchAdminBookings,
  updateBookingStatus,
  adminDeleteBooking,
  fetchAllServicesAdmin,
  adminSaveTreatmentNote,
} from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  User,
  Home,
  Building,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Clock,
  Check,
  ClipboardList,
  Baby,
  Scale,
  Heart,
  Edit3,
  FileText,
} from 'lucide-react';
import { ManualBookingModal } from './ManualBookingModal';
import { PinConfirmModal } from './PinConfirmModal';

interface BookingsTabProps {
  adminPin: string;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ adminPin }) => {
  const { success, error } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal manual booking & delete confirm
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Penyesuaian jam final oleh Bidan
  const [adjustingBookingId, setAdjustingBookingId] = useState<string | null>(null);
  const [adjustedTimeInput, setAdjustedTimeInput] = useState<string>('');

  // Modal Rekam Tindakan Bidan & Perkembangan Bayi
  const [treatmentModalBooking, setTreatmentModalBooking] = useState<Booking | null>(null);
  const [treatmentNotesInput, setTreatmentNotesInput] = useState<string>('');
  const [babyWeightInput, setBabyWeightInput] = useState<string>('');
  const [markCompletedInput, setMarkCompletedInput] = useState<boolean>(true);
  const [isSavingTreatment, setIsSavingTreatment] = useState<boolean>(false);

  const QUICK_TIME_PRESETS = [
    '08:30 WIB',
    '09:00 WIB',
    '09:30 WIB',
    '10:00 WIB',
    '10:30 WIB',
    '11:00 WIB',
    '13:30 WIB',
    '14:00 WIB',
    '14:30 WIB',
    '15:00 WIB',
    '16:00 WIB',
    '16:30 WIB',
    '17:00 WIB',
  ];

  const handleOpenTimeAdjuster = (booking: Booking) => {
    setAdjustingBookingId(booking.id);
    // Jika booking_time sudah berupa jam biasa, gunakan itu. Jika berupa nama sesi, beri rekomendasi awal
    const current = booking.booking_time || '';
    if (current.includes('08:') || current.includes('09:') || current.includes('10:') || current.includes('11:') || current.includes('13:') || current.includes('14:') || current.includes('15:') || current.includes('16:') || current.includes('17:')) {
      setAdjustedTimeInput(current);
    } else if (current.includes('Pagi')) {
      setAdjustedTimeInput('09:30 WIB');
    } else if (current.includes('Siang')) {
      setAdjustedTimeInput('14:00 WIB');
    } else if (current.includes('Sore')) {
      setAdjustedTimeInput('16:30 WIB');
    } else {
      setAdjustedTimeInput(current || '10:00 WIB');
    }
  };

  const handleConfirmAndNotifyWA = async (booking: Booking, finalTime: string) => {
    const timeToSave = finalTime.trim() || booking.booking_time;
    if (!timeToSave) {
      error('Silakan tentukan jam final terlebih dahulu.');
      return;
    }

    try {
      const ok = await updateBookingStatus(adminPin, booking.id, 'confirmed', timeToSave);
      if (!ok) {
        error('Gagal memperbarui status dan jam reservasi.');
        return;
      }

      success(`Reservasi ${booking.booking_code} berhasil dikonfirmasi pada jam ${timeToSave}!`);
      setAdjustingBookingId(null);
      await loadData();

      // Format WhatsApp konfirmasi jadwal final Bidan untuk Bunda
      const cleanNumber = booking.whatsapp_number.replace(/[^0-9]/g, '');
      const cleanWa = cleanNumber.startsWith('0')
        ? '62' + cleanNumber.substring(1)
        : cleanNumber;

      const formattedDate = new Date(booking.booking_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const displayFinalTime = timeToSave.includes('WIB') ? timeToSave : `${timeToSave} WIB`;

      const msg =
        `*KONFIRMASI JADWAL RESERVASI INDAH MOM & BABY SPA COMAL* 🌸
---------------------------------------
Halo Bunda *${booking.mom_name}*, alhamdulillah jadwal reservasi Bunda & Si Kecil telah kami konfirmasi:

- *Kode Booking:* ${booking.booking_code}
- *Layanan:* ${booking.service_name}
- *Tipe Layanan:* ${booking.visit_type}
- *Hari / Tanggal:* ${formattedDate}
- *Waktu / Jam Pasti:* ${displayFinalTime}
${booking.child_name ? `- *Nama Si Kecil:* ${booking.child_name} ${booking.child_age ? `(${booking.child_age})` : ''}\n` : ''}${booking.address ? `- *Alamat Kunjungan:* ${booking.address}\n` : ''}${booking.notes ? `- *Catatan Khusus:* ${booking.notes}\n` : ''}---------------------------------------
*TIPS PERSIAPAN SEBELUM PERAWATAN:*
1. Pastikan Si Kecil dalam kondisi nyaman, sudah cukup istirahat, dan tidak sedang rewel.
2. Sebelum pijat disarankan Tidak kondisi lapar atau kekenyangan,Beri jeda setelah menyusu atau makan agar bayi nyaman dan tidak muntah.
3. Jika Si Kecil mendadak demam atau Bunda ingin menyesuaikan jam, segera kabari kami ya.

Sampai jumpa di waktu perawatan Bunda! Terima kasih banyak sudah mempercayakan perawatan Si Kecil di Indah Mom & Baby Spa Comal ❤️`;

      window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
      console.error(err);
      error('Terjadi kendala saat memperbarui reservasi.');
    }
  };

  const handleSaveTimeOnly = async (booking: Booking, newTime: string) => {
    const timeToSave = newTime.trim();
    if (!timeToSave) {
      error('Jam reservasi tidak boleh kosong.');
      return;
    }

    try {
      const ok = await updateBookingStatus(adminPin, booking.id, booking.status, timeToSave);
      if (ok) {
        success(`Jam reservasi berhasil diubah menjadi "${timeToSave}".`);
        setAdjustingBookingId(null);
        await loadData();
      } else {
        error('Gagal memperbarui jam reservasi.');
      }
    } catch (err) {
      console.error(err);
      error('Terjadi kendala saat memperbarui jam reservasi.');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bkList, srvList] = await Promise.all([
        fetchAdminBookings(adminPin, filterDate, filterStatus),
        fetchAllServicesAdmin(),
      ]);
      setBookings(bkList);
      setServices(srvList);
    } catch (e) {
      console.error(e);
      error('Gagal memuat daftar reservasi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminPin, filterDate, filterStatus]);

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const ok = await updateBookingStatus(adminPin, bookingId, newStatus);
      if (ok) {
        success(`Status booking berhasil diubah menjadi "${newStatus}".`);
        loadData();
      } else {
        error('Gagal memperbarui status.');
      }
    } catch (e) {
      console.error(e);
      error('Terjadi kendala saat memperbarui status.');
    }
  };

  const handleSendReminderWA = (booking: Booking) => {
    const cleanNumber = booking.whatsapp_number.replace(/[^0-9]/g, '');
    const cleanWa = cleanNumber.startsWith('0')
      ? '62' + cleanNumber.substring(1)
      : cleanNumber;

    const formattedDate = new Date(booking.booking_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const msg =
      `Halo Bunda *${booking.mom_name}*, kami dari *Indah Mom & Baby Spa Comal* 🌸

Mengingatkan kembali jadwal perawatan untuk Bunda / Si Kecil tercinta:
- *Layanan:* ${booking.service_name}
- *Jadwal:* ${formattedDate}
- *Pukul:* ${booking.booking_time} ${booking.booking_time.includes('WIB') ? '' : 'WIB'}
- *Tipe:* ${booking.visit_type}
${booking.address ? `- *Alamat Homecare:* ${booking.address}\n` : ''}
Mohon konfirmasi kesiapannya ya Bunda. Jika ada kendala jam atau Si Kecil sedang rewel, silakan kabari kami. Terima kasih banyak Bunda! ❤️`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenTreatmentModal = (booking: Booking) => {
    setTreatmentModalBooking(booking);
    setTreatmentNotesInput(booking.treatment_notes || '');
    setBabyWeightInput(booking.baby_weight_kg || '');
    setMarkCompletedInput(booking.status !== 'completed');
  };

  const handleSaveTreatmentNote = async () => {
    if (!treatmentModalBooking) return;
    if (!treatmentNotesInput.trim() && !babyWeightInput.trim()) {
      error('Silakan isi catatan tindakan atau berat badan Si Kecil.');
      return;
    }

    setIsSavingTreatment(true);
    try {
      const ok = await adminSaveTreatmentNote(
        adminPin,
        treatmentModalBooking.id,
        treatmentNotesInput,
        babyWeightInput,
        markCompletedInput
      );

      if (ok) {
        success(
          `Rekam tindakan untuk ${treatmentModalBooking.mom_name} berhasil disimpan${markCompletedInput ? ' & status ditandai selesai' : ''
          }!`
        );
        setTreatmentModalBooking(null);
        await loadData();
      } else {
        error('Gagal menyimpan rekam tindakan.');
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Terjadi kesalahan saat menyimpan rekam tindakan.');
    } finally {
      setIsSavingTreatment(false);
    }
  };

  const handleSendFollowUpH1 = (booking: Booking) => {
    const cleanNumber = booking.whatsapp_number.replace(/[^0-9]/g, '');
    const cleanWa = cleanNumber.startsWith('0')
      ? '62' + cleanNumber.substring(1)
      : cleanNumber;

    const childGreeting = booking.child_name ? ` dan Si Kecil *${booking.child_name}*` : '';
    const childMention = booking.child_name ? `Si Kecil *${booking.child_name}*` : 'Si Kecil';

    const msg =
      `Halo Bunda *${booking.mom_name}* 🌸
Salam hangat dan kasih dari Bidan Indah (*Indah Mom & Baby Spa Comal*).

Bagaimana kabar Bunda${childGreeting} hari ini setelah kemarin melakukan perawatan *${booking.service_name}*?
Apakah tidur ${childMention} semalam lebih nyenyak dan badannya terasa lebih rileks & nyaman Bunda?

Jika ada keluhan atau ada hal yang ingin Bunda tanyakan seputar kondisi Si Kecil, jangan ragu kabari kami ya. Semoga Bunda dan keluarga senantiasa sehat selalu! ❤️`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter local search query
  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.mom_name.toLowerCase().includes(q) ||
      b.booking_code.toLowerCase().includes(q) ||
      (b.child_name && b.child_name.toLowerCase().includes(q)) ||
      b.service_name.toLowerCase().includes(q) ||
      b.whatsapp_number.includes(q)
    );
  });

  // Metrics summary
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Bar: Summary Cards & Add Manual Button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
          <span className="text-xs text-charcoal-light">Total Reservasi</span>
          <div className="font-serif font-bold text-2xl text-primary mt-1">
            {totalCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/40">
          <span className="text-xs text-amber-800 font-semibold">Menunggu Konfirmasi</span>
          <div className="font-serif font-bold text-2xl text-amber-700 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <span className="text-xs text-emerald-800 font-semibold">Terkonfirmasi (Slot Terkunci)</span>
          <div className="font-serif font-bold text-2xl text-emerald-700 mt-1">
            {confirmedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/40">
          <span className="text-xs text-primary font-semibold">Selesai Treatment</span>
          <div className="font-serif font-bold text-2xl text-primary mt-1">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari Bunda / Kode / Anak..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-charcoal"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="confirmed">Dikonfirmasi (Confirmed)</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="cancelled">Dibatalkan (Cancelled)</option>
          </select>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Add Manual Booking Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Booking Manual</span>
        </button>
      </div>

      {/* Bookings List Cards (NO PRICE DISPLAY) */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-charcoal-light">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-xs">Memuat data reservasi...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 text-charcoal-light">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold">Tidak ada data reservasi</p>
          <p className="text-xs mt-1">Coba sesuaikan filter pencarian atau tanggal di atas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(bk => {
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Pending
              </span>
            );
            if (bk.status === 'confirmed') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Confirmed (Slot Terkunci)
                </span>
              );
            } else if (bk.status === 'completed') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-primary">
                  Selesai
                </span>
              );
            } else if (bk.status === 'cancelled') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  Dibatalkan
                </span>
              );
            }

            return (
              <div
                key={bk.id}
                className="bg-white rounded-2xl p-5 border border-primary/10 shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Booking Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {bk.booking_code}
                      </span>
                      {statusBadge}
                      <span className="text-xs text-charcoal-light flex items-center gap-1">
                        {bk.visit_type === 'Homecare - Bidan ke Rumah' ? (
                          <span className="font-semibold text-accent-dark flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" /> Homecare
                          </span>
                        ) : (
                          <span className="text-slate-600 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" /> Di Klinik
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-primary">
                        {bk.service_name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="w-4 h-4 text-accent shrink-0" />
                        <span>
                          {new Date(bk.booking_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          -{' '}
                          <strong className="text-primary font-bold">
                            {bk.booking_time} {bk.booking_time.includes('WIB') ? '' : 'WIB'}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenTimeAdjuster(bk)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold border border-amber-300 transition-all shadow-xs"
                          title="Sesuaikan jam kedatangan / kunjungan final"
                        >
                          <Clock className="w-3 h-3 text-accent" />
                          <span>Sesuaikan Jam</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          Bunda: <strong>{bk.mom_name}</strong> ({bk.whatsapp_number})
                        </span>
                      </div>

                      {bk.child_name && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500">Si Kecil:</span>
                          <span>
                            {bk.child_name} {bk.child_age ? `(${bk.child_age})` : ''}
                          </span>
                        </div>
                      )}

                      {bk.address && (
                        <div className="sm:col-span-2 flex items-start gap-1.5 text-xs text-charcoal-light">
                          <span className="font-semibold text-slate-600 shrink-0">Alamat:</span>
                          <span>{bk.address}</span>
                        </div>
                      )}

                      {bk.notes && (
                        <div className="sm:col-span-2 bg-cream/70 p-2 rounded-lg text-[11px] text-charcoal-light italic">
                          Catatan Bunda: "{bk.notes}"
                        </div>
                      )}

                      {/* Rekam Tindakan Bidan & Berat Badan Si Kecil */}
                      {(bk.treatment_notes || bk.baby_weight_kg) && (
                        <div className="sm:col-span-2 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary flex items-center gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5 text-accent" />
                              Rekam Tindakan Bidan
                            </span>
                            {bk.baby_weight_kg && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-primary font-bold text-[11px]">
                                <Scale className="w-3 h-3 text-accent" />
                                <span>BB: {bk.baby_weight_kg}</span>
                              </span>
                            )}
                          </div>
                          {bk.treatment_notes && (
                            <p className="text-charcoal leading-relaxed text-[11px]">
                              {bk.treatment_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Panel Penyesuaian Jam Final Bidan */}
                      {adjustingBookingId === bk.id && (
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-[#FAF6F0] to-accent/10 border-2 border-accent/40 shadow-sm space-y-3 animate-fade-in mt-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-primary">
                              <Clock className="w-4 h-4 text-accent" />
                              <span>Sesuaikan Jam Kedatangan / Kunjungan Final</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAdjustingBookingId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5 rounded hover:bg-slate-200/50"
                            >
                              ✕ Tutup
                            </button>
                          </div>

                          <div className="text-[11px] text-charcoal-light">
                            Preferensi Waktu Bunda: <strong className="text-primary">{bk.booking_time}</strong>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-primary mb-1.5">
                              Pilih Preset Jam atau Ketik Jam Final:
                            </label>
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {QUICK_TIME_PRESETS.map(preset => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setAdjustedTimeInput(preset)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${adjustedTimeInput === preset
                                      ? 'bg-primary text-white border-primary shadow-xs font-bold'
                                      : 'bg-white hover:bg-cream border-slate-200 text-charcoal'
                                    }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Contoh: 10:30 WIB atau Sesi Pagi - 09:30 WIB"
                                value={adjustedTimeInput}
                                onChange={e => setAdjustedTimeInput(e.target.value)}
                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-charcoal bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-accent/20">
                            <button
                              type="button"
                              onClick={() => handleConfirmAndNotifyWA(bk, adjustedTimeInput)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                              title="Simpan jam final, ubah status jadi confirmed, dan buka WhatsApp konfirmasi ke Bunda"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Konfirmasi &amp; Kabari WA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveTimeOnly(bk, adjustedTimeInput)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                              title="Simpan jam final ke database tanpa membuka WhatsApp"
                            >
                              <Check className="w-3.5 h-3.5 text-slate-600" />
                              <span>Simpan Jam Saja</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setAdjustingBookingId(null)}
                              className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 font-medium"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-wrap md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    {/* Konfirmasi Jadwal (Mengunci Slot) */}
                    {bk.status === 'pending' && (
                      <button
                        onClick={() => handleOpenTimeAdjuster(bk)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                        title="Tentukan jam final dan konfirmasi jadwal ke Bunda via WhatsApp"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi &amp; Sesuaikan Jam</span>
                      </button>
                    )}

                    {/* Catatan Bidan / Tandai Selesai */}
                    <button
                      onClick={() => handleOpenTreatmentModal(bk)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-primary font-bold text-xs border border-purple-200 transition-colors shadow-xs"
                      title="Rekam tindakan bidan, catat berat badan anak, dan selesaikan treatment"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-accent-dark" />
                      <span>{bk.treatment_notes ? 'Ubah Catatan Bidan' : 'Catatan Bidan / Selesai'}</span>
                    </button>

                    {/* Selesai Cepat */}
                    {bk.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(bk.id, 'completed')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs transition-colors"
                        title="Tandai selesai treatment secara instan"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    )}

                    {/* Follow-up WA H+1 Pasca Treatment */}
                    {bk.status === 'completed' && (
                      <button
                        onClick={() => handleSendFollowUpH1(bk)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold text-xs border border-pink-300 transition-colors shadow-xs"
                        title="Kirim pesan WhatsApp ramah menanyakan kondisi tidur dan tubuh Si Kecil H+1 pasca treatment"
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-500" />
                        <span>Tanya Kondisi (WA H+1)</span>
                      </button>
                    )}

                    {/* Kirim Pengingat WA H-1 */}
                    {bk.status !== 'completed' && bk.status !== 'cancelled' && (
                      <button
                        onClick={() => handleSendReminderWA(bk)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 transition-colors"
                        title="Buka WA untuk kirim pesan pengingat jadwal H-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim Pengingat WA</span>
                      </button>
                    )}

                    {/* Batalkan */}
                    {bk.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin membatalkan jadwal reservasi ini?')) {
                            handleUpdateStatus(bk.id, 'cancelled');
                          }
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Batalkan</span>
                      </button>
                    )}

                    {/* Hapus Permanen dengan Verifikasi PIN Admin */}
                    <button
                      onClick={() => setBookingToDelete(bk)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/70 font-semibold text-xs transition-colors"
                      title="Hapus reservasi secara permanen dari database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        onBookingCreated={loadData}
      />

      {/* Modal Konfirmasi Hapus Permanen dengan Verifikasi PIN Admin */}
      {bookingToDelete && (
        <PinConfirmModal
          isOpen={Boolean(bookingToDelete)}
          onClose={() => setBookingToDelete(null)}
          title="Hapus Reservasi Permanen"
          itemSummary={
            <div className="space-y-1.5 text-xs text-charcoal">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Kode Reservasi:</span>
                <span className="font-mono font-bold text-primary">{bookingToDelete.booking_code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Nama Bunda:</span>
                <span className="font-semibold text-slate-800">{bookingToDelete.mom_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Layanan:</span>
                <span className="text-slate-700 font-medium truncate max-w-[200px]" title={bookingToDelete.service_name}>
                  {bookingToDelete.service_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Jadwal:</span>
                <span>
                  {bookingToDelete.booking_date} ({bookingToDelete.booking_time}{' '}
                  {bookingToDelete.booking_time.includes('WIB') ? '' : 'WIB'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Status Saat Ini:</span>
                <span className="capitalize font-semibold text-slate-700">{bookingToDelete.status}</span>
              </div>
            </div>
          }
          warningText="Reservasi ini akan dihapus secara permanen dari database Supabase dan penyimpanan lokal. Data yang dihapus tidak dapat dipulihkan."
          confirmButtonText="Verifikasi & Hapus Permanen"
          onConfirm={async (enteredPin) => {
            await adminDeleteBooking(enteredPin, bookingToDelete.id);
            success(`Reservasi ${bookingToDelete.booking_code} (${bookingToDelete.mom_name}) berhasil dihapus permanen.`);
            setBookingToDelete(null);
            await loadData();
          }}
        />
      )}

      {/* Modal Rekam Tindakan & Catatan Perkembangan Bayi */}
      {treatmentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-bounce-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-primary/20 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-primary flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-accent-dark" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-primary">
                    Rekam Tindakan Bidan
                  </h3>
                  <p className="text-xs text-charcoal-light">
                    {treatmentModalBooking.mom_name}{' '}
                    {treatmentModalBooking.child_name ? `• ${treatmentModalBooking.child_name}` : ''} ({treatmentModalBooking.service_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreatmentModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-accent" />
                  Berat Badan Si Kecil Saat Treatment (Opsional):
                </label>
                <input
                  type="text"
                  value={babyWeightInput}
                  onChange={(e) => setBabyWeightInput(e.target.value)}
                  placeholder="Contoh: 6.8 kg atau 7.2 kg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  Catatan Tindakan, Keluhan &amp; Respons Bayi:
                </label>
                <textarea
                  rows={4}
                  value={treatmentNotesInput}
                  onChange={(e) => setTreatmentNotesInput(e.target.value)}
                  placeholder="Contoh: Batuk pilek mulai reda, pijat difokuskan area dada & punggung, relaksasi otot kaki, tidur lebih nyenyak."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal leading-relaxed bg-white"
                />
              </div>

              <div className="p-3 rounded-2xl bg-cream/70 border border-primary/10 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="markCompletedCheckbox"
                  checked={markCompletedInput}
                  onChange={(e) => setMarkCompletedInput(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <label
                  htmlFor="markCompletedCheckbox"
                  className="text-xs text-charcoal cursor-pointer font-semibold select-none"
                >
                  Tandai Reservasi Ini Sebagai Selesai Treatment (Completed)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTreatmentModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTreatmentNote}
                disabled={isSavingTreatment}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingTreatment ? 'Menyimpan...' : 'Simpan Rekam Tindakan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
