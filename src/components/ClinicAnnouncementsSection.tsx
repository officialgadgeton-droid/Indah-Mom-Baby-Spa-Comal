import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Clock,
  MessageCircle,
  Heart,
  Calendar,
} from 'lucide-react';
import { ClinicAnnouncement } from '../types';
import { fetchActiveAnnouncements, supabase } from '../lib/supabase';

interface ClinicAnnouncementsSectionProps {
  whatsappNumber?: string;
}

export const ClinicAnnouncementsSection: React.FC<ClinicAnnouncementsSectionProps> = ({
  whatsappNumber = '6287856960422',
}) => {
  const [announcements, setAnnouncements] = useState<ClinicAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('indah_dismiss_announcements') === 'true';
    } catch {
      return false;
    }
  });

  const loadAnnouncements = async () => {
    try {
      const data = await fetchActiveAnnouncements();
      setAnnouncements(data || []);
      if (currentIndex >= (data?.length || 0)) {
        setCurrentIndex(0);
      }
    } catch (e) {
      console.warn('Gagal memuat pengumuman aktif:', e);
    }
  };

  useEffect(() => {
    loadAnnouncements();

    const handleUpdate = () => {
      loadAnnouncements();
      // Saat ada pengumuman baru, buka kembali banner jika sempat ditutup
      setIsDismissed(false);
      try {
        sessionStorage.removeItem('indah_dismiss_announcements');
      } catch {}
    };

    window.addEventListener('indah_spa_announcements_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public_clinic_announcements_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clinic_announcements' },
          () => {
            handleUpdate();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_announcements_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanWa = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  // Cek apakah ada pengumuman libur khusus
  const holidayAnnouncements = announcements.filter((a) => a.category === 'holiday');
  const tipAndInfoAnnouncements = announcements.filter((a) => a.category !== 'holiday');

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('indah_dismiss_announcements', 'true');
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      sessionStorage.removeItem('indah_dismiss_announcements');
    } catch {}
  };

  const currentAnnouncement =
    tipAndInfoAnnouncements.length > 0
      ? tipAndInfoAnnouncements[currentIndex % tipAndInfoAnnouncements.length]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-20 space-y-4">
      {/* 1. Pengumuman Libur / Jam Khusus (Selalu Ditampilkan Paling Menonjol) */}
      {holidayAnnouncements.map((holiday) => (
        <div
          key={holiday.id}
          className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-amber-50/70 to-rose-50 border-2 border-rose-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in"
          role="alert"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <CalendarOff className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                  Pengumuman Libur Klinik
                </span>
                <span className="text-xs text-charcoal-light font-medium">
                  Informasi Jadwal Bidan Indah
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-rose-950 mt-1">
                {holiday.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/85 mt-1 whitespace-pre-line leading-relaxed">
                {holiday.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <a
              href={`https://wa.me/${cleanWa}?text=Halo%20Bidan%20Indah,%20saya%20ingin%20bertanya%20mengenai%20jadwal%20layanan%20klinik.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Tanya Bidan via WA</span>
            </a>
          </div>
        </div>
      ))}

      {/* 2. Kartu Tips Kesehatan & Info Klinik Bidan Indah */}
      {currentAnnouncement && (
        <>
          {isDismissed ? (
            /* Pill Ringkas jika pengguna sempat menutup kartu */
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRestore}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/20 text-primary shadow-sm hover:bg-primary/5 text-xs font-bold transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>Lihat Tips Kesehatan Bidan Indah ({tipAndInfoAnnouncements.length})</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-white via-[#FAF4FD]/50 to-cream border border-primary/20 shadow-md relative overflow-hidden transition-all animate-fade-in">
              {/* Aksen Latar Belakang Lingkaran Halus */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-primary/5 pointer-events-none blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-accent/10 pointer-events-none blur-2xl" />

              <div className="relative z-10">
                {/* Header Kartu: Kategori & Tombol Aksi */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-primary/10">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                        currentAnnouncement.category === 'health_tip'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-primary/15 text-primary border border-primary/25'
                      }`}
                    >
                      {currentAnnouncement.category === 'health_tip' ? (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Megaphone className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>
                        {currentAnnouncement.category === 'health_tip'
                          ? 'Tips Kesehatan Ibu & Bayi'
                          : 'Info Resmi Klinik Bidan Indah'}
                      </span>
                    </span>

                    {tipAndInfoAnnouncements.length > 1 && (
                      <span className="text-[11px] font-semibold text-charcoal-light hidden sm:inline-block">
                        Tips {currentIndex + 1} dari {tipAndInfoAnnouncements.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Navigasi Next & Prev jika ada lebih dari 1 pengumuman */}
                    {tipAndInfoAnnouncements.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentIndex((prev) =>
                              prev === 0 ? tipAndInfoAnnouncements.length - 1 : prev - 1
                            )
                          }
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-charcoal hover:text-primary transition-colors"
                          aria-label="Tips sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentIndex((prev) => (prev + 1) % tipAndInfoAnnouncements.length)
                          }
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-charcoal hover:text-primary transition-colors"
                          aria-label="Tips berikutnya"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Tombol Sembunyikan */}
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="p-1.5 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-slate-100 transition-colors"
                      title="Sembunyikan pesan ini"
                      aria-label="Sembunyikan pesan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Konten Utama Tips */}
                <div className="space-y-2.5">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-primary leading-snug">
                    {currentAnnouncement.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal/85 whitespace-pre-line leading-relaxed">
                    {currentAnnouncement.message}
                  </p>
                </div>

                {/* Footer Identitas Bidan & Link Konsultasi */}
                <div className="mt-4 pt-3 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-accent/40 shadow-xs shrink-0 flex items-center justify-center">
                      <img
                        src="/logo.png"
                        alt="Bidan Indah"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary leading-tight">
                        Bidan Indah, S.Tr.Keb
                      </p>
                      <p className="text-[10px] text-charcoal-light">
                        Praktik Mandiri Bidan & Spa Bayi Comal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${cleanWa}?text=Halo%20Bidan%20Indah,%20saya%20membaca%20tips:%20"${encodeURIComponent(
                        currentAnnouncement.title
                      )}"%20dan%20ingin%20berkonsultasi.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary rounded-xl text-xs font-bold transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 text-accent" />
                      <span>Konsultasi Tips Ini</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
