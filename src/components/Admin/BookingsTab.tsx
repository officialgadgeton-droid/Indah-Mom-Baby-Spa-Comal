import React, { useState, useEffect } from 'react';
import { Booking, Service } from '../../types';
import {
  fetchAdminBookings,
  updateBookingStatus,
  fetchAllServicesAdmin,
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
} from 'lucide-react';
import { ManualBookingModal } from './ManualBookingModal';

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

  // Modal manual booking
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
- *Pukul:* ${booking.booking_time} WIB
- *Tipe:* ${booking.visit_type}
${booking.address ? `- *Alamat Homecare:* ${booking.address}\n` : ''}
Mohon konfirmasi kesiapannya ya Bunda. Jika ada kendala jam atau Si Kecil sedang rewel, silakan kabari kami. Terima kasih banyak Bunda! ❤️`;

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
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent shrink-0" />
                        <span>
                          {new Date(bk.booking_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          - <strong>{bk.booking_time} WIB</strong>
                        </span>
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
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-wrap md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    {/* Konfirmasi Jadwal (Mengunci Slot) */}
                    {bk.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(bk.id, 'confirmed')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                        title="Konfirmasi booking & kunci slot jam"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Konfirmasi Jadwal</span>
                      </button>
                    )}

                    {/* Selesai */}
                    {bk.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(bk.id, 'completed')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-700 text-white font-bold text-xs transition-colors"
                        title="Tandai selesai treatment"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    )}

                    {/* Kirim Pengingat WA */}
                    <button
                      onClick={() => handleSendReminderWA(bk)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 transition-colors"
                      title="Buka WA untuk kirim pesan pengingat jadwal H-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim Pengingat WA</span>
                    </button>

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
    </div>
  );
};
