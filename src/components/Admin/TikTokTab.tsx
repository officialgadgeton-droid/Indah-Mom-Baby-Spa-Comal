import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Video,
  Film,
  Play,
  Heart,
  Users,
} from 'lucide-react';
import { TikTokVideo } from '../../types';
import {
  fetchAdminTikTokVideos,
  saveTikTokVideo,
  toggleTikTokVideoStatus,
  deleteTikTokVideo,
  extractTikTokVideoId,
  isTikTokShortLink,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { TikTokIcon } from '../TikTokSection';

interface TikTokTabProps {
  adminPin: string;
}

export const TikTokTab: React.FC<TikTokTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();

  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');

  // Form State
  const [title, setTitle] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live validation
  const detectedVideoId = extractTikTokVideoId(urlInput);
  const isShortLink = isTikTokShortLink(urlInput);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminTikTokVideos();
      setVideos(data || []);
    } catch (e: any) {
      console.error('Error memuat video TikTok:', e);
      error(e?.message || 'Gagal memuat video TikTok dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [adminPin]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      warning('Harap masukkan judul atau keterangan video.');
      return;
    }

    if (!urlInput.trim()) {
      warning('Harap masukkan link video TikTok atau angka ID videonya.');
      return;
    }

    if (isShortLink) {
      warning(
        'Tautan vt.tiktok.com adalah link pendek. Silakan buka di browser terlebih dahulu, lalu salin URL lengkap yang berisi /video/angka...'
      );
      return;
    }

    if (!detectedVideoId) {
      warning(
        'Format URL tidak valid. Harap gunakan URL video TikTok lengkap (misal: https://www.tiktok.com/@user/video/7438291029384712345) atau angka ID langsung.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Pastikan ada full URL jika user hanya menginput ID
      const finalUrl = urlInput.trim().startsWith('http')
        ? urlInput.trim()
        : `https://www.tiktok.com/@indah_mom.baby_spa_comal/video/${detectedVideoId}`;

      const saved = await saveTikTokVideo(adminPin, {
        title: title.trim(),
        tiktok_url: finalUrl,
        video_id: detectedVideoId,
        is_active: true,
      });

      if (saved) {
        success('Video TikTok berhasil ditambahkan dan ditayangkan!');
        setTitle('');
        setUrlInput('');
        loadVideos();
      }
    } catch (err: any) {
      console.error('Gagal menyimpan video TikTok:', err);
      error(err?.message || 'Terjadi kesalahan saat menyimpan video TikTok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const ok = await toggleTikTokVideoStatus(adminPin, id);
      if (ok) {
        success(
          currentStatus
            ? 'Video berhasil disembunyikan dari halaman depan.'
            : 'Video berhasil diaktifkan kembali ke halaman depan.'
        );
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, is_active: !v.is_active } : v))
        );
      }
    } catch (err: any) {
      console.error('Gagal toggle status video:', err);
      error(err?.message || 'Gagal mengubah status video.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const ok = await deleteTikTokVideo(adminPin, id);
      if (ok) {
        success('Video TikTok berhasil dihapus.');
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      console.error('Gagal menghapus video:', err);
      error(err?.message || 'Gagal menghapus video TikTok.');
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (filterStatus === 'active') return v.is_active;
    if (filterStatus === 'hidden') return !v.is_active;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Profil TikTok Resmi Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55]">
              <TikTokIcon className="w-5 h-5" />
            </span>
            <h2 className="font-serif font-bold text-xl text-primary">
              Kelola Galeri Video TikTok
            </h2>
          </div>
          <p className="text-xs text-charcoal-light max-w-2xl leading-relaxed">
            Sematkan video edukasi, testimoni, atau mini vlog dari TikTok Bidan Indah Rahayu. Video akan tampil interaktif dalam player vertikal resmi TikTok di halaman utama website.
          </p>
        </div>

        {/* Profil Resmi Badge */}
        <div className="shrink-0 flex items-center gap-3 bg-[#121212] text-white px-4 py-3 rounded-2xl border border-white/10 shadow-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shrink-0 border border-accent/40">
            <img src="/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span>@indah_mom.baby_spa_comal</span>
              <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-semibold">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-white/70">
              10,9 Rb+ Pengikut • 58 Rb+ Suka
            </p>
          </div>
          <a
            href="https://www.tiktok.com/@indah_mom.baby_spa_comal"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-2 rounded-xl bg-white/10 hover:bg-[#FE2C55] text-white transition-colors"
            title="Buka Profil TikTok"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. Form Tambah Video Baru */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-serif font-bold text-base text-primary mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-accent" />
          <span>Tambah Video TikTok Baru</span>
        </h3>

        <form onSubmit={handleAddVideo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Judul Video */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Judul / Keterangan Video <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Misal: Mini Vlog Homecare & Baby Swim"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal"
                disabled={isSubmitting}
              />
              <span className="text-[10px] text-charcoal-light/70 mt-1 block">
                Judul singkat yang akan tampil di bawah video.
              </span>
            </div>

            {/* Link Video TikTok */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Link Video TikTok atau ID Angka <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.tiktok.com/@indah_mom.baby_spa_comal/video/7438291029384712345"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal"
                disabled={isSubmitting}
              />
              <span className="text-[10px] text-charcoal-light/70 mt-1 block">
                Salin tautan video lengkap dari aplikasi atau browser.
              </span>
            </div>
          </div>

          {/* Feedback Auto-Detection Real-Time */}
          {urlInput.trim() && (
            <div className="mt-2">
              {isShortLink ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Tautan Pendek (vt.tiktok.com) Terdeteksi!</strong>
                    <span>
                      Harap buka link tersebut di browser HP atau laptop Bunda terlebih dahulu. Setelah halaman video terbuka penuh di browser, salin URL di address bar yang berisi <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">/video/743829...</code> lalu tempelkan ke sini.
                    </span>
                  </div>
                </div>
              ) : detectedVideoId ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    <strong>ID Video Terdeteksi:</strong> <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-bold">{detectedVideoId}</code> (Siap disematkan ke player resmi)
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Pola URL belum dikenali. Pastikan URL berisi <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">/video/[angka_id]</code> atau langsung tempelkan angka ID-nya.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !detectedVideoId || !title.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Video TikTok</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Daftar Video Tersimpan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-base text-primary flex items-center gap-2">
              <Film className="w-4 h-4 text-accent" />
              <span>Daftar Video Tersimpan ({videos.length})</span>
            </h3>
            <p className="text-xs text-charcoal-light mt-0.5">
              Atur visibilitas video atau hapus video yang sudah tidak ingin ditampilkan.
            </p>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Semua ({videos.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Aktif ({videos.filter((v) => v.is_active).length})
            </button>
            <button
              onClick={() => setFilterStatus('hidden')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'hidden'
                  ? 'bg-white text-charcoal-light shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Disembunyikan ({videos.filter((v) => !v.is_active).length})
            </button>
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-charcoal-light">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
            <span>Memuat daftar video TikTok...</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-light rounded-xl border border-dashed border-slate-200">
            <Film className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-charcoal">Tidak ada video pada filter ini.</p>
            <p className="mt-1 text-charcoal-light">
              {filterStatus === 'all'
                ? 'Tambahkan video TikTok pertama Bunda melalui formulir di atas.'
                : 'Ubah filter atau tambahkan video baru.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                  video.is_active
                    ? 'border-slate-200 bg-white hover:shadow-md'
                    : 'border-slate-200/70 bg-slate-50/60 opacity-80'
                }`}
              >
                {/* Embed Player */}
                <div className="relative aspect-[9/16] w-full bg-black overflow-hidden border-b border-slate-100">
                  <iframe
                    src={`https://www.tiktok.com/player/v1/${video.video_id}?music_info=0&description=0&rel=0`}
                    title={video.title}
                    className="w-full h-full border-0 bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                  {/* Status Overlay Badge */}
                  <div className="absolute top-2 left-2 z-10 pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                        video.is_active
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-white/90'
                      }`}
                    >
                      {video.is_active ? '✓ Tayang di Web' : 'Disembunyikan'}
                    </span>
                  </div>
                </div>

                {/* Card Meta & Control */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-charcoal line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                    <p className="text-[10px] text-charcoal-light mt-1 font-mono truncate">
                      ID: {video.video_id}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Buka di TikTok */}
                    <a
                      href={video.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-charcoal-light hover:text-primary hover:bg-slate-100 transition-colors"
                      title="Buka Video di TikTok"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Toggle Status & Hapus Action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(video.id, video.is_active)}
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          video.is_active
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title={video.is_active ? 'Sembunyikan dari web' : 'Tayangkan di web'}
                      >
                        {video.is_active ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tayangkan</span>
                          </>
                        )}
                      </button>

                      {deleteConfirmId === video.id ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-charcoal rounded-lg text-[10px] font-bold"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(video.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus video ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
