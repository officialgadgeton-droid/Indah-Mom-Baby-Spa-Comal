import React, { useState, useEffect } from 'react';
import {
  Service,
  VisitType,
  SavedCustomerData,
  Booking,
  ClinicOperationalStatus,
} from '../types';
import { OPERATING_SLOTS, TIME_SESSION_OPTIONS } from '../data/initialServices';
import {
  fetchBookedSlots,
  createBooking,
  fetchActiveServices,
  supabase,
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import {
  Check,
  Clock,
  Sparkles,
  MapPin,
  Home,
  Building,
  User,
  Phone,
  Baby,
  FileText,
  Send,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface BookingWizardProps {
  services: Service[];
  selectedServicePreset?: Service | null;
  onClearPreset?: () => void;
  whatsappNumber?: string;
  clinicAddress?: string;
  operationalStatus?: ClinicOperationalStatus;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  selectedServicePreset,
  whatsappNumber = '6287856960422',
  operationalStatus,
}) => {
  const { success, error, warning } = useToast();
  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const clinicWaLink = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [visitType, setVisitType] = useState<VisitType>('Datang ke Klinik');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Customer Data State
  const [momName, setMomName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [childAge, setChildAge] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSavedCustomer, setIsSavedCustomer] = useState<boolean>(false);

  // Real-time slot availability
  const [bookedSlots, setBookedSlots] = useState<{ time: string; reason: string }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Success Modal
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>(services);

  // Sinkronisasi saat props services berubah
  useEffect(() => {
    if (services && services.length > 0) {
      setServicesList(services);
    }
  }, [services]);

  // Sinkronisasi Real-Time layanan langsung dari tabel public.services Supabase
  useEffect(() => {
    const reloadServices = async () => {
      try {
        const data = await fetchActiveServices();
        if (data && data.length > 0) {
          setServicesList(data);
        }
      } catch (err) {
        console.warn('Gagal memuat layanan aktif di BookingWizard:', err);
      }
    };

    reloadServices();

    const handleLocalUpdate = () => reloadServices();
    window.addEventListener('indah_spa_services_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public_services_wizard_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          () => {
            reloadServices();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_services_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Load preset service when clicked from catalog
  useEffect(() => {
    if (selectedServicePreset) {
      setSelectedServiceId(selectedServicePreset.id);
    }
  }, [selectedServicePreset]);

  // Load saved customer data from localStorage (Auto-fill customer profile)
  useEffect(() => {
    const saved =
      localStorage.getItem('indah_spa_customer_profile') ||
      localStorage.getItem('imb_customer_profile');
    if (saved) {
      try {
        const parsed: SavedCustomerData = JSON.parse(saved);
        if (parsed.mom_name) setMomName(parsed.mom_name);
        if (parsed.whatsapp_number) setWhatsapp(parsed.whatsapp_number);
        if (parsed.child_name) setChildName(parsed.child_name);
        if (parsed.child_age) setChildAge(parsed.child_age);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.mom_name || parsed.whatsapp_number) {
          setIsSavedCustomer(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Handler untuk mengosongkan data diri jika perangkat dipakai Bunda lain
  const handleClearCustomerData = () => {
    localStorage.removeItem('indah_spa_customer_profile');
    localStorage.removeItem('imb_customer_profile');
    setMomName('');
    setWhatsapp('');
    setChildName('');
    setChildAge('');
    setAddress('');
    setIsSavedCustomer(false);
  };

  // Fetch real-time booked & blocked slots when date changes
  useEffect(() => {
    if (!bookingDate) return;

    let isMounted = true;
    setIsLoadingSlots(true);

    fetchBookedSlots(bookingDate)
      .then(slots => {
        if (isMounted) {
          setBookedSlots(slots);
          if (slots.some(s => s.time === selectedTime || s.time === 'ALL')) {
            setSelectedTime('');
          }
        }
      })
      .catch(err => {
        console.error('Error fetching booked slots:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingDate, selectedTime]);

  const activeServices = servicesList
    .filter(s => s.is_active)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const selectedService = activeServices.find(s => s.id === selectedServiceId) || activeServices[0];

  // Helper check if time slot is locked
  const isSlotLocked = (time: string) => {
    const isAllDayBlocked = bookedSlots.some(s => s.time === 'ALL');
    if (isAllDayBlocked) return { locked: true, reason: 'Libur Seharian' };

    const match = bookedSlots.find(s => s.time === time);
    if (match) {
      return { locked: true, reason: match.reason || 'Penuh' };
    }
    return { locked: false, reason: '' };
  };

  // Validation per step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedService) {
        warning('Silakan pilih salah satu layanan treatment terlebih dahulu.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!bookingDate) {
        warning('Silakan pilih tanggal kunjungan.');
        return;
      }
      if (!selectedTime) {
        warning('Silakan pilih salah satu preferensi waktu kunjungan.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!momName.trim()) {
        warning('Nama Bunda wajib diisi.');
        return;
      }
      if (!whatsapp.trim() || whatsapp.trim().length < 9) {
        warning('Nomor WhatsApp aktif wajib diisi (minimal 9 digit).');
        return;
      }
      if (visitType === 'Homecare - Bidan ke Rumah' && !address.trim()) {
        warning('Alamat lengkap wajib diisi untuk layanan Homecare.');
        return;
      }

      // Save customer data to localStorage
      const profileToSave: SavedCustomerData = {
        mom_name: momName.trim(),
        whatsapp_number: whatsapp.trim(),
        child_name: childName.trim(),
        child_age: childAge.trim(),
        address: address.trim(),
      };
      localStorage.setItem('indah_spa_customer_profile', JSON.stringify(profileToSave));
      localStorage.setItem('imb_customer_profile', JSON.stringify(profileToSave));
      setIsSavedCustomer(true);

      setCurrentStep(4);
    }
  };

  // Final Action: Save to Supabase & Trigger WhatsApp
  const handleConfirmAndWhatsApp = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        visit_type: visitType,
        service_id: selectedService.id,
        service_name: selectedService.name,
        service_price: 0,
        booking_date: bookingDate,
        booking_time: selectedTime,
        mom_name: momName.trim(),
        whatsapp_number: whatsapp.trim(),
        child_name: childName.trim() || undefined,
        child_age: childAge.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'pending',
      });

      if (result.success && result.booking) {
        setCreatedBooking(result.booking);
        success(`Reservasi berhasil dibuat dengan kode ${result.booking.booking_code}!`);

        // Simpan / update profil pelanggan ke localStorage
        const latestProfile: SavedCustomerData = {
          mom_name: momName.trim(),
          whatsapp_number: whatsapp.trim(),
          child_name: childName.trim(),
          child_age: childAge.trim(),
          address: address.trim(),
        };
        localStorage.setItem('indah_spa_customer_profile', JSON.stringify(latestProfile));
        localStorage.setItem('imb_customer_profile', JSON.stringify(latestProfile));
        setIsSavedCustomer(true);

        // Format Pesan WhatsApp (Tanpa Harga)
        const cleanClinicWa = clinicWaLink;
        const formattedDate = new Date(bookingDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const waText =
          `*RESERVASI BARU INDAH MOM & BABY SPA COMAL*
---------------------------------------
*Kode Booking:* ${result.booking.booking_code}
*Layanan Treatment:* ${selectedService.name}
*Kategori:* ${selectedService.category}

*Tipe Kunjungan:* ${visitType}
*Hari/Tanggal:* ${formattedDate}
*Preferensi Waktu:* ${selectedTime}

*DATA BUNDA & SI KECIL:*
- Nama Bunda: ${momName.trim()}
- No. WhatsApp: ${whatsapp.trim()}
- Nama Si Kecil: ${childName.trim() || '-'}
- Usia Anak: ${childAge.trim() || '-'}
${visitType === 'Homecare - Bidan ke Rumah' ? `- Alamat Homecare: ${address.trim()}\n` : ''}- Catatan / Keluhan: ${notes.trim() || '-'}
---------------------------------------
Halo Bidan Indah, saya telah mengisi form reservasi di website. Mohon konfirmasi jadwal kunjungan kami. Terima kasih!`;

        const waUrl = `https://wa.me/${cleanClinicWa}?text=${encodeURIComponent(waText)}`;

        // Open WhatsApp in new window
        window.open(waUrl, '_blank');
      } else {
        error('Terjadi kendala saat menyimpan reservasi. Silakan hubungi WA Bidan langsung.');
      }
    } catch (err) {
      console.error(err);
      error('Gagal memproses reservasi. Silakan periksa koneksi internet Bunda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section id="reservasi" className="py-20 bg-cream-100 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulir Cerdas</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-3">
            Reservasi Jadwal Perawatan
          </h2>
          <p className="text-sm text-charcoal-light">
            Slot real-time langsung terhubung dengan jadwal praktik Bidan Indah.
          </p>
        </div>

        {/* Wizard Container Card */}
        <div className="bg-white rounded-3xl shadow-card border border-primary/10 overflow-hidden">
          {/* Banner Pemberitahuan Status Operasional (Homecare / Tutup Hari Ini) */}
          {operationalStatus && operationalStatus.status !== 'open' && (
            <div
              className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                operationalStatus.status === 'busy_homecare'
                  ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                  : 'bg-rose-50/90 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    operationalStatus.status === 'busy_homecare'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {operationalStatus.status === 'busy_homecare' ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    {operationalStatus.status === 'busy_homecare'
                      ? 'Informasi: Bidan Sedang Bertugas Homecare / Membantu Persalinan'
                      : 'Pemberitahuan: Praktik Hari Ini Tutup Sementara'}
                  </h4>
                  <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">
                    {operationalStatus.note ||
                      (operationalStatus.status === 'busy_homecare'
                        ? 'Bunda tetap dipersilakan memilih layanan dan mengirim formulir reservasi. Jadwal kedatangan dan jam final akan dikonfirmasi langsung oleh Bidan melalui WhatsApp.'
                        : 'Klinik hari ini sedang libur praktik. Bunda tetap dapat membuat pemesanan jadwal untuk hari-hari berikutnya.')}
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                  operationalStatus.status === 'busy_homecare'
                    ? 'Halo Bidan Indah, saya ingin memastikan ketersediaan jadwal hari ini.'
                    : 'Halo Bidan Indah, saya ingin konsultasi mengenai jadwal perawatan Si Kecil.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-center transition-colors ${
                  operationalStatus.status === 'busy_homecare'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <span>Konsultasi WA Langsung</span>
              </a>
            </div>
          )}

          {/* Progress Bar Header */}
          <div className="bg-primary/5 border-b border-primary/10 px-4 sm:px-8 py-5">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Layanan' },
                { step: 2, label: 'Jadwal' },
                { step: 3, label: 'Data Diri' },
                { step: 4, label: 'Konfirmasi' },
              ].map(s => {
                const isActive = currentStep === s.step;
                const isPassed = currentStep > s.step;
                return (
                  <div key={s.step} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isPassed
                        ? 'bg-emerald-600 text-white'
                        : isActive
                          ? 'bg-accent text-white shadow-gold scale-110'
                          : 'bg-white text-charcoal-light border border-slate-300'
                        }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-primary font-bold' : 'text-charcoal-light'
                        }`}
                    >
                      {s.label}
                    </span>
                    {s.step < 4 && (
                      <div className="w-6 sm:w-12 h-0.5 bg-slate-200 mx-1 sm:mx-2 hidden xs:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard Body Steps */}
          <div className="p-6 sm:p-8">
            {/* STEP 1: VISIT TYPE & SERVICE */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-bounce-in">
                <div>
                  <label className="block text-sm font-bold text-primary mb-3">
                    1. Pilih Tipe Kunjungan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setVisitType('Datang ke Klinik')}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${visitType === 'Datang ke Klinik'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visitType === 'Datang ke Klinik'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-charcoal'
                          }`}
                      >
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">Datang ke Klinik</div>
                        <p className="text-xs text-charcoal-light mt-0.5 leading-relaxed">
                          Nikmati fasilitas spa lengkap, kolam air hangat steril, dan musik relaksasi di klinik Comal.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitType('Homecare - Bidan ke Rumah')}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${visitType === 'Homecare - Bidan ke Rumah'
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visitType === 'Homecare - Bidan ke Rumah'
                          ? 'bg-accent text-white'
                          : 'bg-slate-100 text-charcoal'
                          }`}
                      >
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-accent-dark">
                          Homecare (Bidan ke Rumah)
                        </div>
                        <p className="text-xs text-charcoal-light mt-0.5 leading-relaxed">
                          Bidan datang membawa perlengkapan steril ke rumah Bunda (Comal & sekitarnya).
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-3">
                    2. Pilih Paket Layanan Treatment:
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {activeServices.map(srv => {
                      const isSelected = selectedService?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${isSelected
                            ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {srv.category}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-base text-primary mb-1">
                              {srv.name}
                            </h4>
                            <p className="text-xs text-charcoal-light line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-light">
                            {srv.duration_minutes ? (
                              <span>Durasi: {srv.duration_minutes} Menit</span>
                            ) : null}
                            {srv.target_age || srv.age_range ? (
                              <span>Sasaran: {srv.target_age || srv.age_range}</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & REAL-TIME TIME SLOT */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-bounce-in">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Pilih Tanggal Kunjungan:
                  </label>
                  <div className="relative max-w-sm">
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-charcoal"
                    />
                  </div>
                  <p className="text-xs text-charcoal-light mt-1.5">
                    *Klinik beroperasi setiap hari hingga pukul 18.00 WIB.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-primary">
                      Pilih Preferensi Waktu Kunjungan:
                    </label>
                    {isLoadingSlots && (
                      <span className="text-xs text-primary animate-pulse font-medium">
                        Mengecek jadwal operasional...
                      </span>
                    )}
                  </div>

                  {bookedSlots.some(s => s.time === 'ALL') ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <strong className="block font-bold">Klinik Libur Penuh pada Tanggal Ini</strong>
                        <span>
                          {bookedSlots.find(s => s.time === 'ALL')?.reason || 'Jadwal Libur Operasional Bidan'}.
                          Silakan pilih tanggal lain di atas.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {TIME_SESSION_OPTIONS.map(session => {
                        const isSelected = selectedTime === session.value;
                        const isAllDayBlocked = bookedSlots.some(s => s.time === 'ALL');

                        return (
                          <button
                            key={session.id}
                            type="button"
                            disabled={isAllDayBlocked}
                            onClick={() => setSelectedTime(session.value)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                              isAllDayBlocked
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                                : isSelected
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm font-medium'
                                  : 'border-slate-200 hover:border-primary/40 bg-white hover:bg-cream/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-serif font-bold text-sm text-primary">
                                    {session.name}
                                  </h4>
                                  <span className="text-xs font-semibold text-accent-dark">
                                    {session.timeRange}
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-charcoal-light mt-1 leading-relaxed">
                              {session.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-primary/10 text-xs text-charcoal-light flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Pilihan waktu di atas merupakan preferensi awal Bunda. Jam pasti kedatangan / kunjungan homecare akan dikonfirmasi kembali oleh Bidan Indah melalui WhatsApp sesuai jadwal praktik hari tersebut.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER & CHILD DATA */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-bounce-in">
                {isSavedCustomer && momName && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-[#FAF6F0] to-primary/5 border border-accent/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-5 h-5 text-accent-dark" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-primary">
                          Selamat datang kembali, Bunda {momName}! 🌸
                        </div>
                        <p className="text-[11px] sm:text-xs text-charcoal-light mt-0.5">
                          Data Bunda &amp; Si Kecil sudah kami siapkan agar reservasi lebih cepat.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearCustomerData}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-bold text-charcoal-light hover:text-rose-700 transition-all shrink-0 self-end sm:self-auto shadow-xs"
                      title="Kosongkan form jika perangkat digunakan oleh Bunda lain"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ganti Data / Bunda Lain</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Nama Bunda *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Contoh: Bunda Rina Setyowati"
                        value={momName}
                        onChange={e => setMomName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Nama Si Kecil (Opsional jika Mom Treatment)
                    </label>
                    <div className="relative">
                      <Baby className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Contoh: Baby Alvaro"
                        value={childName}
                        onChange={e => setChildName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">
                      Usia Anak (Bulan / Tahun)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 6 Bulan / 3 Tahun"
                      value={childAge}
                      onChange={e => setChildAge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>

                {visitType === 'Homecare - Bidan ke Rumah' && (
                  <div>
                    <label className="block text-xs font-bold text-accent-dark mb-1">
                      Alamat Lengkap Rumah (Wajib untuk Homecare) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <textarea
                        rows={2}
                        placeholder="Contoh: Jl. Ahmad Yani No. 12, RT 02/RW 03, Comal (Patokan dekat Polsek Comal)"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Catatan Khusus / Keluhan Si Kecil / Bunda
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      placeholder="Contoh: Bayi batuk pilek 2 hari, perut agak kembung / ASI sebelah kanan nyeri"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ORDER SUMMARY & WHATSAPP ACTION (NO PRICE DISPLAY) */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-bounce-in">
                <div className="p-5 rounded-2xl bg-cream border border-primary/15 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-primary/10">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Ringkasan Jadwal Reservasi
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/20 text-accent-dark">
                      {visitType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal">
                    <div>
                      <span className="text-charcoal-light block">Layanan Treatment:</span>
                      <strong className="text-primary font-bold text-sm block">
                        {selectedService?.name}
                      </strong>
                      <span className="text-[11px] text-charcoal-light">
                        Kategori: {selectedService?.category} ({selectedService?.duration_minutes || 45} Menit)
                      </span>
                    </div>

                    <div>
                      <span className="text-charcoal-light block">Hari & Preferensi Waktu:</span>
                      <strong className="text-primary font-bold text-sm block">
                        {new Date(bookingDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                      <span className="text-accent-dark font-bold">
                        {selectedTime.includes('WIB') || selectedTime.includes('Fleksibel')
                          ? selectedTime
                          : `Pukul ${selectedTime} WIB`}
                      </span>
                    </div>

                    <div>
                      <span className="text-charcoal-light block">Data Bunda:</span>
                      <strong className="text-charcoal font-semibold block">
                        {momName} ({whatsapp})
                      </strong>
                    </div>

                    <div>
                      <span className="text-charcoal-light block">Data Si Kecil:</span>
                      <strong className="text-charcoal font-semibold block">
                        {childName || '-'} {childAge ? `(${childAge})` : ''}
                      </strong>
                    </div>

                    {visitType === 'Homecare - Bidan ke Rumah' && (
                      <div className="sm:col-span-2">
                        <span className="text-charcoal-light block">Alamat Kunjungan Homecare:</span>
                        <p className="font-semibold text-charcoal">{address}</p>
                      </div>
                    )}

                    {notes && (
                      <div className="sm:col-span-2">
                        <span className="text-charcoal-light block">Catatan / Keluhan:</span>
                        <p className="italic text-charcoal">{notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Saat tombol konfirmasi diklik, sistem akan otomatis mencatat jadwal Bunda di database dan
                    mengarahkan ke WhatsApp Bidan Indah dengan rincian yang telah diformat rapi.
                  </span>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-charcoal hover:bg-slate-50 font-semibold text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAndWhatsApp}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-xs sm:text-sm shadow-gold transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi & Kirim ke WhatsApp'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {createdBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-bounce-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-4 border border-primary/20">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h3 className="font-serif font-bold text-2xl text-primary">
                Reservasi Berhasil Dicatat!
              </h3>

              <div className="p-3 bg-cream rounded-2xl border border-primary/10">
                <span className="text-xs text-charcoal-light block">Kode Booking Bunda:</span>
                <span className="font-mono font-bold text-lg text-primary tracking-wider">
                  {createdBooking.booking_code}
                </span>
              </div>

              <p className="text-xs text-charcoal-light leading-relaxed">
                Terima kasih Bunda <strong className="text-primary">{createdBooking.mom_name}</strong>.
                Data sudah masuk ke sistem Bidan Indah. Jika WhatsApp belum terbuka secara otomatis,
                Bunda dapat mengklik tombol di bawah ini:
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${clinicWaLink}?text=Halo%20Bidan%20Indah,%20saya%20sudah%20reservasi%20dengan%20Kode%20Booking%20*${createdBooking.booking_code}*`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-sm shadow-gold"
                >
                  <Send className="w-4 h-4" />
                  <span>Buka Chat WhatsApp Bidan</span>
                </a>

                <button
                  onClick={() => {
                    setCreatedBooking(null);
                    setCurrentStep(1);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-charcoal hover:bg-slate-50"
                >
                  Selesai & Buat Reservasi Lain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
