import React, { useState } from 'react';
import { Service, VisitType } from '../../types';
import { OPERATING_SLOTS } from '../../data/initialServices';
import { createBooking } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { X, Check } from 'lucide-react';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onBookingCreated: () => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  isOpen,
  onClose,
  services,
  onBookingCreated,
}) => {
  const { success, error, warning } = useToast();
  const activeServices = services.filter(s => s.is_active);

  const [visitType, setVisitType] = useState<VisitType>('Datang ke Klinik');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    activeServices[0]?.id || ''
  );
  const [bookingDate, setBookingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookingTime, setBookingTime] = useState<string>('10:00');
  const [momName, setMomName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [childAge, setChildAge] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedService =
    activeServices.find(s => s.id === selectedServiceId) || activeServices[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!momName.trim()) {
      warning('Nama Bunda wajib diisi.');
      return;
    }
    if (!whatsapp.trim()) {
      warning('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!selectedService) {
      warning('Layanan wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        visit_type: visitType,
        service_id: selectedService.id,
        service_name: selectedService.name,
        service_price: 0,
        booking_date: bookingDate,
        booking_time: bookingTime,
        mom_name: momName.trim(),
        whatsapp_number: whatsapp.trim(),
        child_name: childName.trim() || undefined,
        child_age: childAge.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'confirmed', // Otomatis confirmed agar slot langsung terkunci
      });

      if (res.success) {
        success('Booking manual berhasil dicatat & slot jam otomatis terkunci!');
        onBookingCreated();
        onClose();
      } else {
        error('Gagal mencatat booking manual.');
      }
    } catch (err) {
      console.error(err);
      error('Terjadi kesalahan saat menyimpan booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-bounce-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-primary">
              + Tambah Booking Manual
            </h3>
            <p className="text-xs text-charcoal-light">
              Jadwal yang dibuat di sini akan berstatus <strong>Confirmed</strong> dan mengunci slot publik.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-charcoal hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Kunjungan */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Tipe Kunjungan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitType('Datang ke Klinik')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center ${
                  visitType === 'Datang ke Klinik'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-slate-200 text-charcoal'
                }`}
              >
                Datang ke Klinik
              </button>
              <button
                type="button"
                onClick={() => setVisitType('Homecare - Bidan ke Rumah')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center ${
                  visitType === 'Homecare - Bidan ke Rumah'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white border-slate-200 text-charcoal'
                }`}
              >
                Homecare
              </button>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Pilih Layanan Treatment:
            </label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-charcoal focus:ring-2 focus:ring-primary/20"
            >
              {activeServices.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.category}] {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Tanggal:
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Jam Slot:
              </label>
              <select
                value={bookingTime}
                onChange={e => setBookingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-charcoal"
              >
                {OPERATING_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {t} WIB
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Bunda & WA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Nama Bunda *
              </label>
              <input
                type="text"
                required
                placeholder="Nama Bunda"
                value={momName}
                onChange={e => setMomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                No. WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="08123456789"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Anak & Usia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Nama Si Kecil
              </label>
              <input
                type="text"
                placeholder="Nama Bayi"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Usia Anak
              </label>
              <input
                type="text"
                placeholder="Misal: 5 Bulan"
                value={childAge}
                onChange={e => setChildAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Alamat (Jika homecare) */}
          {visitType === 'Homecare - Bidan ke Rumah' && (
            <div>
              <label className="block text-xs font-bold text-accent-dark mb-1">
                Alamat Kunjungan Homecare *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Alamat lengkap rumah Bunda"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Catatan keluhan atau permintaan khusus"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-charcoal hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-gold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Kunci Jadwal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
