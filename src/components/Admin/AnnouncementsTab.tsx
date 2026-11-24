import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  CalendarOff,
  Bell,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Heart,
  Clock,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { ClinicAnnouncement, AnnouncementCategory } from '../../types';
import {
  fetchAdminAnnouncements,
  publishAnnouncement,
  deleteAnnouncement,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface AnnouncementsTabProps {
  adminPin: string;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();

  const [announcements, setAnnouncements] = useState<ClinicAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'all' | AnnouncementCategory>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<AnnouncementCategory>('info');
  const [message, setMessage] = useState<string>('');

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAnnouncements(adminPin);
      setAnnouncements(data || []);
    } catch (e: any) {
      console.error('Error memuat pengumuman:', e);
      error(e?.message || 'Gagal memuat pengumuman dari database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();

    const handleUpdate = () => {
      loadAnnouncements();
    };
    window.addEventListener('indah_spa_announcements_updated', handleUpdate);
    return () => {
      window.removeEventListener('indah_spa_announcements_updated', handleUpdate);
    };
  }, [adminPin]);

  const handleApplyTemplate = (type: 'colic' | 'lactation' | 'holiday') => {
    if (type === 'colic') {
      setTitle('Tips Stimulasi Sensori & Redakan Kolik Bayi');
      setCategory('health_tip');
      setMessage(
        'Bunda, jika si kecil sering gelisah atau kembung terutama di sore hari, lakukan pijatan lembut gerakan "I Love You" searah jarum jam dengan minyak telon atau baby oil hangat setelah mandi. Posisikan kaki si kecil seperti mengayuh sepeda secara perlahan untuk membantu membuang gas dalam perut.'
      );
    } else if (type === 'lactation') {
      setTitle('Tips Pijat Oksitosin & Lancarkan ASI di Rumah');
      setCategory('health_tip');
      setMessage(
        'Pijat oksitosin di area tulang belakang dan pundak oleh Ayah sangat efektif memicu refleks aliran ASI (let-down reflex). Ciptakan suasana rileks, dengarkan musik lembut, dan kompres hangat payudara sebelum mulai memompa atau menyusui langsung.'
      );
    } else if (type === 'holiday') {
      setTitle('Pemberitahuan Libur Operasional Sementara');
      setCategory('holiday');
      setMessage(
        'Klinik Indah Mom & Baby Spa Comal libur sementara pada tanggal tersebut. Seluruh reservasi online untuk tanggal berikutnya tetap dibuka dan akan kami konfirmasi kembali saat klinik buka.'
      );
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      warning('Harap isi judul broadcast atau tips kesehatan.');
      return;
    }

    if (!message.trim()) {
      warning('Harap isi pesan broadcast atau tips kesehatan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await publishAnnouncement(adminPin, title, message, category);
      success(
        `Pengumuman "${res.title}" berhasil dipublikasikan dan langsung tayang di aplikasi publik Bunda.`
      );
      // Reset form
      setTitle('');
      setMessage('');
      setCategory('info');
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Error publikasi pengumuman:', err);
      error(err?.message || 'Gagal mempublikasikan pengumuman. Periksa kembali PIN Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const ok = await deleteAnnouncement(adminPin, id);
      if (ok) {
        success('Pengumuman berhasil dihapus dari sistem.');
        setDeleteConfirmId(null);
        await loadAnnouncements();
      } else {
        error('Gagal menghapus pengumuman.');
      }
    } catch (err: any) {
      console.error('Error menghapus pengumuman:', err);
      error(err?.message || 'Terjadi kesalahan saat menghapus pengumuman.');
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Halaman */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-primary">
                  Broadcast Info Bidan & Tips Kesehatan
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-dark px-2 py-0.5 rounded-md">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-charcoal-light mt-0.5">
                Kirim pesan pengumuman, edukasi kebidanan, atau info libur klinik langsung ke
                halaman utama pelanggan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnnouncements}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream hover:bg-cream-dark text-charcoal border border-slate-200 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Grid: Form Input Pengumuman & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Input (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-primary/10">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
                <Send className="w-4 h-4 text-accent" />
                <span>Kirim Info / Tips Kesehatan ke Aplikasi Bunda</span>
              </h3>
              <p className="text-xs text-charcoal-light mt-0.5">
                Pengumuman yang dikirim akan langsung muncul di halaman utama website.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mb-4">
            <span className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider block mb-2">
              Template Cepat Bidan:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('colic')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Tips Pijat Kolik</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('lactation')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
              >
                <Heart className="w-3 h-3 text-purple-600" />
                <span>Tips Pijat Laktasi</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('holiday')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <CalendarOff className="w-3 h-3 text-amber-600" />
                <span>Pengumuman Libur</span>
              </button>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Pilihan Kategori */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-2">
                Pilih Kategori Broadcast <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Info Klinik */}
                <button
                  type="button"
                  onClick={() => setCategory('info')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${category === 'info'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${category === 'info' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <Info className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal">Info Klinik</span>
                  </div>
                  <p className="text-[10px] text-charcoal-light leading-tight">
                    Jadwal, promo paket, atau kabar operasional klinik.
                  </p>
                </button>

                {/* 2. Tips Kesehatan Ibu & Bayi */}
                <button
                  type="button"
                  onClick={() => setCategory('health_tip')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${category === 'health_tip'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${category === 'health_tip'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal">Tips Kesehatan</span>
                  </div>
                  <p className="text-[10px] text-charcoal-light leading-tight">
                    Edukasi perawatan bayi, pijat laktasi, dan tips Bunda.
                  </p>
                </button>

                {/* 3. Pengumuman Libur */}
                <button
                  type="button"
                  onClick={() => setCategory('holiday')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${category === 'holiday'
                    ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${category === 'holiday'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      <CalendarOff className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-charcoal">Pengumuman Libur</span>
                  </div>
                  <p className="text-[10px] text-charcoal-light leading-tight">
                    Klinik tutup sementara pada hari raya atau tanggal khusus.
                  </p>
                </button>
              </div>
            </div>

            {/* Input Judul */}
            <div>
              <label htmlFor="ann-title" className="block text-xs font-bold text-charcoal mb-1.5">
                Judul Pengumuman / Tips <span className="text-rose-500">*</span>
              </label>
              <input
                id="ann-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tips Pijat Kolik Mandiri di Rumah untuk Bayi Baru Lahir"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal bg-white"
                required
              />
            </div>

            {/* Textarea Isi Pesan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="ann-message" className="text-xs font-bold text-charcoal">
                  Isi Pesan / Tips Kesehatan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-charcoal-light">
                  {message.length} karakter
                </span>
              </div>
              <textarea
                id="ann-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan pesan yang hangat dari Bidan Indah. Dukung jeda baris (enter) untuk memudahkan Bunda membaca..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal bg-white resize-y"
                required
              />
              <p className="text-[11px] text-charcoal-light mt-1">
                Tips: Gunakan bahasa yang ramah khas bidan untuk memberikan rasa aman dan percaya bagi Bunda.
              </p>
            </div>

            {/* Tombol Publikasi */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mempublikasikan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publikasikan & Kirim Notifikasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#FAF4FD] to-cream rounded-2xl p-5 border border-primary/10 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-primary/10">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-accent" />
                <span>Live Preview Tampilan di Halaman Bunda</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-charcoal-light font-medium border border-primary/10">
                Pratinjau
              </span>
            </div>

            {/* Kartu Simulasi */}
            <div
              className={`rounded-2xl p-4 transition-all shadow-sm ${category === 'holiday'
                ? 'bg-rose-50 border border-rose-200'
                : category === 'health_tip'
                  ? 'bg-emerald-50/80 border border-emerald-200'
                  : 'bg-white border border-primary/15'
                }`}
            >
              {/* Badge Kategori */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${category === 'holiday'
                    ? 'bg-rose-600 text-white'
                    : category === 'health_tip'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary text-white'
                    }`}
                >
                  {category === 'holiday' ? (
                    <CalendarOff className="w-3 h-3" />
                  ) : category === 'health_tip' ? (
                    <Sparkles className="w-3 h-3" />
                  ) : (
                    <Megaphone className="w-3 h-3" />
                  )}
                  <span>
                    {category === 'holiday'
                      ? 'Pengumuman Libur Klinik'
                      : category === 'health_tip'
                        ? 'Tips Kesehatan Bidan Indah'
                        : 'Info Resmi Klinik'}
                  </span>
                </span>
                <span className="text-[10px] text-charcoal-light">Baru saja</span>
              </div>

              {/* Judul */}
              <h4 className="font-serif font-bold text-sm text-charcoal mb-1.5">
                {title.trim() || 'Judul Pengumuman Akan Tampil di Sini'}
              </h4>

              {/* Isi Pesan */}
              <p className="text-xs text-charcoal/80 whitespace-pre-line leading-relaxed">
                {message.trim() ||
                  'Isi pesan edukasi kebidanan atau pengumuman jadwal klinik akan tampil di sini secara rapi dan nyaman dibaca oleh Bunda...'}
              </p>

              {/* Footer info bidan */}
              <div className="mt-3 pt-2.5 border-t border-charcoal/10 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-accent/40 shrink-0">
                  <img src="/logo.png" alt="Bidan" className="w-full h-full object-cover" />
                </div>
                <div className="text-[10px]">
                  <p className="font-bold text-primary leading-none">Bidan Dwi Nur Indah Sari</p>
                  <p className="text-charcoal-light leading-none mt-0.5">
                    Indah Mom & Baby Spa Comal
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-light mt-3 text-center">
              Tampilan otomatis menyesuaikan layar smartphone dan laptop Bunda.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Riwayat Pengumuman yang Bisa Dihapus */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-primary">
                Daftar Riwayat Pengumuman & Broadcast
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {announcements.length}
              </span>
            </div>
            <p className="text-xs text-charcoal-light mt-0.5">
              Kelola pengumuman yang aktif atau hapus pengumuman lama yang sudah tidak berlaku.
            </p>
          </div>

          {/* Filter Kategori */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterCategory === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                }`}
            >
              Semua ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('info')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterCategory === 'info'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                }`}
            >
              Info Klinik
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('health_tip')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterCategory === 'health_tip'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                }`}
            >
              Tips Kesehatan
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('holiday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterCategory === 'holiday'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-charcoal hover:bg-slate-200'
                }`}
            >
              Pengumuman Libur
            </button>
          </div>
        </div>

        {/* List Data Pengumuman */}
        {isLoading ? (
          <div className="py-12 text-center text-charcoal-light flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Memuat riwayat pengumuman...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-12 text-center text-charcoal-light bg-cream/40 rounded-2xl border border-dashed border-slate-200 p-8">
            <Megaphone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-charcoal">Belum Ada Pengumuman</p>
            <p className="text-xs text-charcoal-light mt-1 max-w-sm mx-auto">
              Gunakan formulir di atas untuk membagikan tips kesehatan atau informasi klinik kepada
              pelanggan setia Bunda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${item.is_active
                  ? 'bg-white border-primary/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.category === 'holiday'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.category === 'health_tip'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                    >
                      {item.category === 'holiday' ? (
                        <CalendarOff className="w-3 h-3" />
                      ) : item.category === 'health_tip' ? (
                        <Sparkles className="w-3 h-3" />
                      ) : (
                        <Info className="w-3 h-3" />
                      )}
                      <span>
                        {item.category === 'holiday'
                          ? 'Pengumuman Libur'
                          : item.category === 'health_tip'
                            ? 'Tips Kesehatan'
                            : 'Info Klinik'}
                      </span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {item.is_active ? 'Aktif Tayang' : 'Arsip'}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-charcoal mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-charcoal/80 whitespace-pre-line leading-relaxed mb-3">
                    {item.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-charcoal-light">
                    <Clock className="w-3 h-3" />
                    <span>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'Waktu tidak tercatat'}
                    </span>
                  </div>

                  {/* Tombol Hapus dengan Konfirmasi */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-lg text-[10px] font-medium transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                      title="Hapus pengumuman ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
