import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Users,
  Play,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { TikTokVideo } from '../types';
import { fetchActiveTikTokVideos, supabase } from '../lib/supabase';

// SVG Icon Resmi TikTok
export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

export const TikTokSection: React.FC = () => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const officialProfile = {
    username: '@indah_mom.baby_spa_comal',
    displayName: 'Indah Mom & Baby Spa Comal',
    followers: '10,9 Rb+',
    likes: '58 Rb+',
    url: 'https://www.tiktok.com/@indah_mom.baby_spa_comal',
    bio: 'Bidan Praktik Mandiri • Spesialis Baby Spa, Pijat Bapil, & Homecare Comal - Pemalang',
  };

  const loadVideos = async () => {
    try {
      const data = await fetchActiveTikTokVideos();
      setVideos(data || []);
    } catch (e) {
      console.warn('Gagal memuat video TikTok:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();

    const handleUpdate = () => loadVideos();
    window.addEventListener('indah_spa_tiktok_videos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public_view_tiktok_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tiktok_videos' },
          () => {
            loadVideos();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_tiktok_videos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="tiktok" className="py-20 bg-gradient-to-b from-white via-cream/40 to-white relative overflow-hidden scroll-mt-20 sm:scroll-mt-24">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Koleksi Video & Edukasi</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold tracking-tight">
              Keseruan & Edukasi di TikTok
            </h2>
            <p className="mt-3 text-sm text-charcoal-light leading-relaxed">
              Tonton kelucuan si kecil saat berenang baby spa, kehangatan pijat terapi bapil, serta tips kesehatan & stimulasi tumbuh kembang langsung dari Bidan Dwi Nur Indah Sari.
            </p>
          </div>
        </RevealOnScroll>

        {/* ========================================================= */}
        {/* KARTU BANNER PROFIL RESMI TIKTOK (SELALU TAMPIL & MENARIK) */}
        {/* ========================================================= */}
        <RevealOnScroll delay={100}>
          <div className="max-w-4xl mx-auto mb-14">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] via-[#1F1B24] to-[#2B0938] text-white p-6 sm:p-8 shadow-2xl border border-white/10 group">
              {/* Neon Glow TikTok Accent */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#25F4EE]/15 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-[#25F4EE]/25" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#FE2C55]/20 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-[#FE2C55]/30" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Avatar + Identity */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#FE2C55] via-white to-[#25F4EE] shadow-lg">
                      <img
                        src="/logo.png"
                        alt="Profil TikTok Indah Mom & Baby Spa"
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    {/* TikTok Badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black text-white p-1 border-2 border-white shadow flex items-center justify-center">
                      <TikTokIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wide">
                        {officialProfile.displayName}
                      </h3>
                      <span className="inline-flex items-center text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full border border-accent/40">
                        <CheckCircle2 className="w-3 h-3 text-accent mr-0.5" />
                        Resmi
                      </span>
                    </div>

                    <a
                      href={officialProfile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-0.5 text-sm font-semibold text-white/80 hover:text-[#25F4EE] transition-colors"
                    >
                      {officialProfile.username}
                    </a>

                    <p className="mt-2 text-xs text-white/70 max-w-md leading-relaxed">
                      {officialProfile.bio}
                    </p>

                    {/* Social Proof Stats */}
                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-5">
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Users className="w-4 h-4 text-[#25F4EE]" />
                        <div className="text-left">
                          <span className="block text-xs sm:text-sm font-extrabold text-white">
                            {officialProfile.followers}
                          </span>
                          <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                            Pengikut
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Heart className="w-4 h-4 text-[#FE2C55] fill-[#FE2C55]" />
                        <div className="text-left">
                          <span className="block text-xs sm:text-sm font-extrabold text-white">
                            {officialProfile.likes}
                          </span>
                          <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                            Suka
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: CTA Follow Button */}
                <div className="shrink-0 w-full md:w-auto flex flex-col items-center sm:items-end">
                  <a
                    href={officialProfile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FE2C55] via-[#ff4d6d] to-[#FE2C55] hover:opacity-95 text-white font-bold text-sm shadow-[0_4px_20px_rgba(254,44,85,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <TikTokIcon className="w-4 h-4" />
                    <span>Ikuti & Tonton di TikTok</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="mt-2 text-[11px] text-white/50 text-center sm:text-right">
                    Update video baru setiap minggu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* ========================================================= */}
        {/* GRID / CAROUSEL VIDEO TIKTOK EMBED (IFRAME) */}
        {/* ========================================================= */}
        <RevealOnScroll delay={200}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-primary flex items-center gap-2">
                  <span>Video Unggulan Pilihan</span>
                  <span className="text-xs font-normal text-charcoal-light bg-purple-100/60 px-2 py-0.5 rounded-full">
                    {videos.length} Video Aktif
                  </span>
                </h3>
                <p className="text-xs text-charcoal-light mt-0.5">
                  Geser untuk melihat keseruan baby spa dan edukasi Bunda
                </p>
              </div>

              {/* Carousel Controls */}
              {videos.length > 2 && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => handleScroll('left')}
                    className="p-2.5 rounded-full bg-white border border-purple-100 text-charcoal hover:bg-primary hover:text-white shadow-xs transition-colors"
                    aria-label="Gulir ke kiri"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleScroll('right')}
                    className="p-2.5 rounded-full bg-white border border-purple-100 text-charcoal hover:bg-primary hover:text-white shadow-xs transition-colors"
                    aria-label="Gulir ke kanan"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Video List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="aspect-[9/16] max-w-[310px] mx-auto w-full rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-1 px-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="shrink-0 w-[280px] sm:w-[305px] snap-center flex flex-col group"
                  >
                    {/* Card Player Container */}
                    <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-purple-100 transition-all duration-300 group-hover:shadow-2xl group-hover:border-accent/40">
                      <iframe
                        src={`https://www.tiktok.com/player/v1/${video.video_id}?music_info=0&description=0&rel=0`}
                        title={video.title}
                        className="w-full h-full border-0 rounded-2xl bg-black"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>

                    {/* Card Title & Link */}
                    <div className="mt-3 px-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-charcoal line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {video.title}
                      </h4>
                      <div className="mt-2 flex items-center justify-between">
                        <a
                          href={video.tiktok_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-dark hover:text-primary transition-colors"
                        >
                          <TikTokIcon className="w-3.5 h-3.5" />
                          <span>Buka di TikTok</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <span className="text-[10px] text-charcoal-light/60">
                          {video.created_at
                            ? new Date(video.created_at).toLocaleDateString('id-ID', {
                              month: 'short',
                              year: 'numeric',
                            })
                            : 'Terbaru'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Fallback Banner */
              <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-8 text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-primary mb-3">
                  <Play className="w-6 h-6 text-accent-dark" />
                </div>
                <h4 className="font-serif font-bold text-charcoal text-base">
                  Video Edukasi Sedang Disiapkan
                </h4>
                <p className="text-xs text-charcoal-light mt-1.5 leading-relaxed">
                  Bidan Indah sedang menyiapkan kurasi video edukasi baby spa terbaik. Bunda tetap dapat menonton ratusan video menarik langsung di akun resmi TikTok kami.
                </p>
                <a
                  href={officialProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                  <span>Buka Akun TikTok Resmi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
