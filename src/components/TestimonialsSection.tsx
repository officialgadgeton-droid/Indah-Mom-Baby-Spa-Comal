import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Quote,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  MessageCircle,
  Pause,
  Play,
  ShieldCheck,
  ArrowLeft,
  Images,
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { Testimonial } from '../types';
import { fetchActiveTestimonials } from '../lib/supabase';

// SVG Icon WhatsApp Resmi
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
  </svg>
);

// Google Icon Resmi
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Data Sample Chat WhatsApp jika database belum mengunggah foto
interface SampleChatData {
  id: string;
  senderName: string;
  senderSubtitle: string;
  avatarEmoji: string;
  chatText: string;
  replyText: string;
  time: string;
  serviceTag: string;
  caption: string;
}

const SAMPLE_CHATS: SampleChatData[] = [
  {
    id: 'sample-alvaro',
    senderName: 'Bunda Alvaro',
    senderSubtitle: 'Comal • Pasien Terverifikasi',
    avatarEmoji: '👶',
    chatText:
      'Assalamualaikum Bu Bidan Indah.. Mau ngabari, semalam adik Alvaro pules bgt tidurnya abis ikutan Baby Spa! Biasanya rewel jam 1, ini nyenyak sampai pagi 🥰👶',
    replyText:
      "Wa'alaikumsalam Bunda Alvaro.. Alhamdulillah ya Bun! Rileksasi pijat & gymball memang bikin otot bayi lebih rileks & nyaman. Terima kasih ya Bun 🌸🙏",
    time: '08:15',
    serviceTag: 'Paket Baby Spa & Pijat Stimulasi',
    caption: 'Bunda Alvaro • Tidur Nyenyak Sampai Pagi',
  },
  {
    id: 'sample-zahra',
    senderName: 'Bunda Zahra',
    senderSubtitle: 'Pemalang • Pasien Terverifikasi',
    avatarEmoji: '🌸',
    chatText:
      'Bu Bidan Indah, makasih banyak yaa. Pijat bapilnya manjur bgt, dahaknya keluar & dedek ga grok-grok lagi napasnya. Langsung plong bobonya 🌸🙏',
    replyText:
      'Alhamdulillah Bunda Zahra.. Senang sekali mendengarnya. Hangat minyak telon herbal bantu pernapasan dedek lebih lega & rileks ya Bun ❤️',
    time: '10:42',
    serviceTag: 'Terapi Batuk Pilek (Bapil)',
    caption: 'Bunda Zahra • Terapi Bapil Manjur & Lega',
  },
  {
    id: 'sample-kimi',
    senderName: 'Bunda Kimi',
    senderSubtitle: 'Ulujami • Pasien Terverifikasi',
    avatarEmoji: '✨',
    chatText:
      'Suka bgt kliniknya estetik, bersih & wangi.. Bu Bidan telaten & ramah bgt sama anak. Dedek yg biasanya takut orang baru malah ceria bgt 😍',
    replyText:
      'Terima kasih banyak Bunda Kimi atas kepercayaannya! Ditunggu kedatangan adik Kimi berikutnya yaa Bun, salam hangat 🌸🥰',
    time: '14:20',
    serviceTag: 'Baby Swim & Gymball Therapy',
    caption: 'Bunda Kimi • Klinik Bersih & Bidan Telaten',
  },
  {
    id: 'sample-rayyan',
    senderName: 'Bunda Rayyan',
    senderSubtitle: 'Comal • Pasien Terverifikasi',
    avatarEmoji: '🏡',
    chatText:
      'Pelayanan homecare nya mantap bgt Bu Bidan! Tepat waktu, alat higienis & dedek nyaman bgt dipijat di rumah tanpa drama rewel 🏠✨',
    replyText:
      'Sama-sama Bunda Rayyan! Senang bisa mendampingi Si Kecil tanpa Bunda harus repot keluar rumah. Sehat selalu adik ganteng ya Bun 🙏',
    time: '16:05',
    serviceTag: 'Homecare Bidan ke Rumah',
    caption: 'Bunda Rayyan • Homecare Nyaman & Tepat Waktu',
  },
];

// Unified Card Item Type
type DisplayItem =
  | {
      type: 'image';
      id: string;
      imageUrl: string;
      caption: string;
      subtitle: string;
      createdAt?: string;
    }
  | {
      type: 'sample';
      id: string;
      sample: SampleChatData;
      caption: string;
      subtitle: string;
      createdAt?: string;
    };

export const TestimonialsSection: React.FC = () => {
  const googleMapsReviewsUrl = 'https://maps.app.goo.gl/c1cY4NA9KrtNzVz57';

  // Testimonials state (uploaded from Supabase / localStorage)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isFullGalleryOpen, setIsFullGalleryOpen] = useState<boolean>(false);
  const [galleryVisibleCount, setGalleryVisibleCount] = useState<number>(12);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchActiveTestimonials();
        if (data && Array.isArray(data)) {
          setTestimonials(data);
        }
      } catch (err) {
        console.warn('Gagal memuat testimoni:', err);
      }
    };

    loadTestimonials();

    // Dengarkan perubahan localStorage jika admin mengupload di tab lain
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'indah_spa_testimonials') {
        loadTestimonials();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Kunci scrolling halaman latar belakang saat modal galeri penuh terbuka
  useEffect(() => {
    if (isFullGalleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullGalleryOpen]);

  // Format list item unik untuk galeri (semua testimoni aktif dari Supabase/lokal)
  const uniqueItems: DisplayItem[] = useMemo(() => {
    if (testimonials.length > 0) {
      return testimonials.map((t) => ({
        type: 'image' as const,
        id: t.id,
        imageUrl: t.image_url,
        caption: t.caption || 'Testimoni WhatsApp',
        subtitle: 'Bunda Bahagia • Pasien Terverifikasi',
        createdAt: t.created_at,
      }));
    }
    return SAMPLE_CHATS.map((s) => ({
      type: 'sample' as const,
      id: s.id,
      sample: s,
      caption: s.caption,
      subtitle: s.senderSubtitle,
      createdAt: undefined,
    }));
  }, [testimonials]);

  // Batasi Marquee Halaman Depan ke maksimal 10 Testimoni Aktif Terbaru
  // Animasi tetap mulus & ringan di HP meskipun data sudah ratusan
  const marqueeCards: DisplayItem[] = useMemo(() => {
    const latestTen = uniqueItems.slice(0, 10);
    if (latestTen.length === 0) return [];
    let list = [...latestTen];
    while (list.length < 6) {
      list = [...list, ...latestTen];
    }
    return list;
  }, [uniqueItems]);

  // Helper pemformat tanggal postingan testimoni
  const formatCardDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  // Keyboard navigation untuk Lightbox Pop-up & Modal Full Gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else if (isFullGalleryOpen) {
          setIsFullGalleryOpen(false);
        }
        return;
      }
      if (lightboxIndex !== null && uniqueItems.length > 1) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % uniqueItems.length : null
          );
        }
        if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + uniqueItems.length) % uniqueItems.length : null
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, isFullGalleryOpen, uniqueItems.length]);

  // Touch Swipe Handlers untuk Lightbox di Layar HP
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || uniqueItems.length <= 1) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && lightboxIndex !== null) {
      // Swipe kiri -> Berikutnya
      setLightboxIndex((lightboxIndex + 1) % uniqueItems.length);
    } else if (distance < -50 && lightboxIndex !== null) {
      // Swipe kanan -> Sebelumnya
      setLightboxIndex((lightboxIndex - 1 + uniqueItems.length) % uniqueItems.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Google Maps Reviews Pilihan
  const googleReviews = [
    {
      initial: 'M',
      author: 'Bunda M',
      avatarBg: 'bg-[#5B2C6F] text-[#F4E8C1]',
      badgeColor: 'bg-primary/10 text-primary',
      serviceTag: 'Google Review • Pelayanan Bidan & Treatment Bayi',
      comment: 'Puas dg pelayanan ibu bidan yg ramah, tretmennya jg bkin bdan adek jd enakan 🫶🙌',
      rating: 5,
    },
    {
      initial: 'N',
      author: 'Bunda N',
      avatarBg: 'bg-[#C59B27] text-white',
      badgeColor: 'bg-accent/15 text-accent-dark',
      serviceTag: 'Google Review • Tempat Estetik & Sharing Tumbuh Kembang',
      comment: 'Tempatnya estetik ..juga gampang diajak seringg tumbuh kembang anak 🥰🥰🥰🥰',
      rating: 5,
    },
    {
      initial: 'Z',
      author: 'Bunda Z',
      avatarBg: 'bg-[#2F0B3D] text-[#C59B27]',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      serviceTag: 'Google Review • Pelayanan Bidan Indah Memuaskan',
      comment: 'Masya Allah makasih bidan indah pelayanane bagus memuaskan Alhamdulillah. .',
      rating: 5,
    },
  ];

  // Helper render kartu chat WhatsApp interaktif
  const renderCardContent = (item: DisplayItem) => {
    if (item.type === 'image' && !brokenImages[item.id]) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-slate-900">
          <img
            src={item.imageUrl}
            alt={item.caption}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
          />
          {/* Vignette Gradasi Halus */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
          
          {/* Tombol Perbesar Hover */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
            <ZoomIn className="w-4 h-4 text-accent" />
          </div>

          {/* Label Nama / Keterangan di Bagian Bawah */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2F0B3D]/95 via-[#2F0B3D]/75 to-transparent pt-12 pb-3.5 px-3.5 text-white pointer-events-none">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <WhatsAppIcon className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white truncate drop-shadow-sm">
                {item.caption}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 ml-auto" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/80 font-medium">
              <span className="truncate">{item.subtitle}</span>
              {item.createdAt && formatCardDate(item.createdAt) && (
                <span className="shrink-0 text-white/75 ml-1 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full font-sans">
                  {formatCardDate(item.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Tampilan Ilustrasi Chat WhatsApp jika tipe sample atau gambar rusak
    const chatData =
      item.type === 'sample'
        ? item.sample
        : {
            senderName: item.caption || 'Bunda Bahagia',
            senderSubtitle: 'Pasien Terverifikasi',
            avatarEmoji: '🌸',
            chatText: 'Terima kasih banyak Bu Bidan Indah! Pelayanannya sangat ramah dan adik nyaman sekali.',
            replyText: 'Sama-sama Bunda.. Senang sekali bisa membantu Si Kecil tercinta 🙏❤️',
            time: '09:00',
            serviceTag: 'Layanan Indah Spa Comal',
            caption: item.caption,
          };

    return (
      <div className="w-full h-full bg-[#EFEAE2] flex flex-col justify-between font-sans select-none overflow-hidden relative text-left">
        {/* WhatsApp Wallpaper Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '14px 14px',
          }}
        />

        {/* WhatsApp Header Bar */}
        <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-xs relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold text-white shadow-2xs">
              {chatData.avatarEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold leading-tight tracking-tight truncate">
                  Bidan Indah Comal
                </span>
                <ShieldCheck className="w-3 h-3 text-[#25D366] shrink-0" />
              </div>
              <span className="text-[8.5px] text-white/80 block leading-tight">online</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px]">
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-2.5 overflow-hidden space-y-2 relative z-10 text-[10.5px]">
          {/* Date Chip */}
          <div className="flex justify-center my-0.5">
            <span className="bg-white/90 shadow-2xs text-charcoal-light text-[8px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              Hari ini
            </span>
          </div>

          {/* Bubble 1: Bunda Customer */}
          <div className="flex justify-end">
            <div className="bg-[#E7FFDB] text-charcoal rounded-xl rounded-tr-xs p-2 max-w-[90%] shadow-2xs relative">
              <p className="leading-snug text-[10px] line-clamp-4">{chatData.chatText}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] text-charcoal-light">
                <span>{chatData.time}</span>
                <span className="text-[#34B7F1] font-bold">✓✓</span>
              </div>
            </div>
          </div>

          {/* Bubble 2: Bidan Indah */}
          <div className="flex justify-start">
            <div className="bg-white text-charcoal rounded-xl rounded-tl-xs p-2 max-w-[92%] shadow-2xs relative border border-slate-100">
              <p className="leading-snug text-[9.5px] line-clamp-4">{chatData.replyText}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] text-charcoal-light">
                <span>{chatData.time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Label di Bagian Bawah Kartu */}
        <div className="bg-gradient-to-t from-[#2F0B3D]/95 via-[#2F0B3D]/75 to-transparent pt-8 pb-3 px-3 text-white relative z-10">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0">
              <WhatsAppIcon className="w-2 h-2 text-white" />
            </div>
            <span className="text-xs font-bold text-white truncate drop-shadow-sm">
              {chatData.senderName}
            </span>
            <CheckCircle2 className="w-3 h-3 text-accent shrink-0 ml-auto" />
          </div>
          <p className="text-[9.5px] text-white/80 font-medium truncate">{chatData.serviceTag}</p>
        </div>

        {/* Hover Zoom Icon */}
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-20">
          <ZoomIn className="w-3.5 h-3.5 text-accent" />
        </div>
      </div>
    );
  };

  return (
    <section id="ulasan" className="py-20 bg-gradient-to-b from-[#FAF4FD] via-[#FDFBF7] to-cream relative overflow-hidden">
      {/* Decorative Floating Orbs */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-float-slow-2" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-float-slow-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title with Scroll Reveal */}
        <RevealOnScroll variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Apa Kata Bunda?</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">
              Ulasan Asli & Bukti Kasih Bunda
            </h2>
            <p className="text-base text-charcoal-light max-w-2xl mx-auto">
              Kisah nyata penuh kehangatan dari para Bunda di Comal dan sekitarnya yang telah mempercayakan perawatan Si Kecil di Indah Mom & Baby Spa.
            </p>
          </div>
        </RevealOnScroll>

        {/* ======================================================== */}
        {/* FITUR 1: BARISAN KARTU WHATSAPP SMOOTH HORIZONTAL MARQUEE */}
        {/* ======================================================== */}
        <RevealOnScroll variant="fade-up" delay={100}>
          <div className="mb-20">
            {/* Subheader Gallery */}
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {testimonials.length > 0
                    ? 'Tangkapan Layar Chat WhatsApp Asli'
                    : 'Preview Chat WhatsApp Pelanggan'}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                Bunda Berbagi Kebahagiaan
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-light mt-1">
                Sentuh atau arahkan kursor untuk menjeda obrolan. Klik kartu untuk membaca tangkapan layar dalam resolusi penuh.
              </p>
            </div>

            {/* MARQUEE CAROUSEL CONTAINER (Overflow Hidden dengan Edge Vignette) */}
            <div className="relative w-full overflow-hidden py-4 select-none">
              {/* Left Gradient Edge Mask (Fade Effect) */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#FAF4FD] via-[#FAF4FD]/80 to-transparent z-10 pointer-events-none" />

              {/* Right Gradient Edge Mask (Fade Effect) */}
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#FAF4FD] via-[#FAF4FD]/80 to-transparent z-10 pointer-events-none" />

              {/* Interactive Marquee Strip */}
              <div
                className="flex w-max"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {/* SET 1: Bergerak ke kiri secara berkelanjutan */}
                <div
                  className="flex shrink-0 gap-4 sm:gap-6 animate-marquee-scroll pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                  {marqueeCards.map((item, idx) => {
                    const originalIdx = uniqueItems.findIndex((u) => u.id === item.id);
                    return (
                      <div
                        key={`set1-${item.id}-${idx}`}
                        onClick={() => setLightboxIndex(originalIdx !== -1 ? originalIdx : 0)}
                        className="w-[210px] sm:w-[245px] h-[340px] sm:h-[380px] shrink-0 rounded-2xl overflow-hidden bg-white border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 relative group cursor-pointer"
                        title="Klik untuk melihat resolusi penuh"
                      >
                        {renderCardContent(item)}
                      </div>
                    );
                  })}
                </div>

                {/* SET 2: Duplikasi presisi untuk menciptakan seamless loop tanpa patah */}
                <div
                  className="flex shrink-0 gap-4 sm:gap-6 animate-marquee-scroll pr-4 sm:pr-6"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  aria-hidden="true"
                >
                  {marqueeCards.map((item, idx) => {
                    const originalIdx = uniqueItems.findIndex((u) => u.id === item.id);
                    return (
                      <div
                        key={`set2-${item.id}-${idx}`}
                        onClick={() => setLightboxIndex(originalIdx !== -1 ? originalIdx : 0)}
                        className="w-[210px] sm:w-[245px] h-[340px] sm:h-[380px] shrink-0 rounded-2xl overflow-hidden bg-white border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 relative group cursor-pointer"
                        title="Klik untuk melihat resolusi penuh"
                      >
                        {renderCardContent(item)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Kontrol Interaksi & Indikator Status Marquee */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-charcoal-light">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-primary/10 shadow-2xs backdrop-blur-xs">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span>
                  {isPaused
                    ? 'Animasi dijeda • Klik foto untuk memperbesar'
                    : 'Arahkan kursor atau sentuh layar untuk menjeda'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-primary/15 text-primary text-xs font-bold hover:bg-primary/5 shadow-2xs transition-all active:scale-95"
                title={isPaused ? 'Lanjutkan Animasi' : 'Jeda Animasi'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-primary text-primary" />
                    <span>Lanjutkan Bergerak</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-primary text-primary" />
                    <span>Jeda Sementara</span>
                  </>
                )}
              </button>
            </div>

            {/* Tombol Utama: "Lihat Semua Testimoni (X Ulasan)" */}
            <div className="flex flex-col items-center justify-center mt-7 mb-2">
              <button
                type="button"
                onClick={() => {
                  setGalleryVisibleCount(12);
                  setIsFullGalleryOpen(true);
                }}
                className="btn-shimmer group relative inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-primary via-[#5B2C6F] to-primary text-white font-bold text-sm sm:text-base shadow-soft hover:shadow-card border-2 border-accent/40 hover:border-accent transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
              >
                <Images className="w-5 h-5 text-accent animate-pulse" />
                <span>Lihat Semua Testimoni ({uniqueItems.length} Ulasan)</span>
                <ChevronRight className="w-4 h-4 text-accent transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <p className="text-xs text-charcoal-light mt-2.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tangkapan layar chat asli tanpa rekayasa dari para Bunda</span>
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* ======================================================== */}
        {/* FITUR 2: GOOGLE MAPS REVIEWS & 5.0 RATING BANNER         */}
        {/* ======================================================== */}

        {/* Header Ringkasan Rating Google Banner (Zoom-in Reveal) */}
        <RevealOnScroll variant="zoom-in" delay={100}>
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-[#2F0B3D] via-[#5B2C6F] to-[#481A5B] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-accent/30 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Subtle gold glow overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
              {/* Left: Google Brand & Score */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-lg flex items-center justify-center shrink-0 border border-white/20">
                  <GoogleIcon className="w-10 h-10" />
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
                      5,0
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[#F4E8C1]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-accent-light font-semibold tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        <span>Rating Sempurna & Terverifikasi</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-white/90 font-medium mt-1">
                    Berdasarkan <strong className="text-accent underline decoration-accent/40 underline-offset-4">100 Ulasan</strong> di Google Maps
                  </p>
                </div>
              </div>

              {/* Right: CTA Button with Shimmer Effect */}
              <div className="shrink-0 w-full sm:w-auto">
                <a
                  href={googleMapsReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
                >
                  <span className="relative z-10">Lihat Semua 100 Ulasan di Google</span>
                  <ExternalLink className="w-4 h-4 text-white relative z-10" />
                </a>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* 3 Kartu Testimoni Pilihan dari Google Maps with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {googleReviews.map((rev, idx) => (
            <RevealOnScroll
              key={idx}
              variant="fade-up"
              delay={idx * 150}
              className="h-full"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full relative group">
                <div>
                  {/* Header card: Star rating & Quote icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                      <span className="text-xs font-bold text-accent-dark ml-1">5,0</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/30 group-hover:text-accent transition-colors duration-200">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-charcoal leading-relaxed italic mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Author profile & badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shadow-sm ${rev.avatarBg}`}
                  >
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary leading-tight">
                      {rev.author}
                    </h4>
                    <p className="text-[11px] text-charcoal-light mt-0.5">
                      {rev.serviceTag}
                    </p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / LAYAR PENUH GALERI SEMUA TESTIMONI               */}
      {/* ======================================================== */}
      {isFullGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF4FD] overflow-y-auto flex flex-col animate-fade-in select-none">
          {/* Header Sticky */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-primary/10 px-4 sm:px-6 py-3.5 sm:py-4 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsFullGalleryOpen(false)}
                  className="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors shadow-2xs active:scale-95 shrink-0 cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-base sm:text-xl text-primary truncate">
                      Galeri Testimoni WhatsApp
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0">
                      <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                      100% Asli
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-light mt-0.5 truncate">
                    Menampilkan {Math.min(galleryVisibleCount, uniqueItems.length)} dari {uniqueItems.length} Ulasan Bunda Terverifikasi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullGalleryOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs sm:text-sm transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Tutup Galeri</span>
              </button>
            </div>
          </header>

          {/* Body Grid Foto Screenshot WhatsApp */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {uniqueItems.slice(0, galleryVisibleCount).map((item, idx) => (
                <div
                  key={`full-grid-${item.id}-${idx}`}
                  onClick={() => setLightboxIndex(idx)}
                  className="w-full aspect-[9/16] rounded-2xl overflow-hidden bg-white border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 relative group cursor-pointer"
                  title="Klik untuk melihat resolusi penuh"
                >
                  {renderCardContent(item)}
                </div>
              ))}
            </div>

            {/* Pagination / Tombol "Muat Lebih Banyak (+12 Foto)" */}
            {galleryVisibleCount < uniqueItems.length ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-14 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setGalleryVisibleCount((prev) => prev + 12)}
                  className="btn-shimmer inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-card transition-all active:scale-95 border border-accent/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Muat Lebih Banyak (+{Math.min(12, uniqueItems.length - galleryVisibleCount)} Foto)</span>
                </button>
                <span className="text-xs text-charcoal-light">
                  Tersisa {uniqueItems.length - galleryVisibleCount} foto lainnya
                </span>
              </div>
            ) : (
              <div className="text-center pt-10 pb-14 text-xs sm:text-sm font-semibold text-charcoal-light flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seluruh {uniqueItems.length} foto testimoni telah dimuat</span>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL LIGHTBOX: POP-UP RESOLUSI PENUH                    */}
      {/* ======================================================== */}
      {lightboxIndex !== null && uniqueItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox Modal Box */}
          <div
            className="relative max-w-lg w-full max-h-[95vh] flex flex-col items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar (Counter, Caption, Close Button) */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                {`${lightboxIndex + 1} dari ${uniqueItems.length}`}
              </span>

              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs text-center">
                {uniqueItems[lightboxIndex].caption}
              </span>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors shadow-lg"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Content with Left & Right Arrow controls */}
            <div className="relative w-full flex items-center justify-center my-auto">
              {/* Previous Button inside Lightbox */}
              {uniqueItems.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + uniqueItems.length) % uniqueItems.length
                    )
                  }
                  className="absolute left-2 sm:-left-12 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all shadow-lg active:scale-95"
                  title="Foto Sebelumnya (Panah Kiri)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Tampilan Konten Resolusi Penuh */}
              {uniqueItems[lightboxIndex].type === 'image' &&
              !brokenImages[uniqueItems[lightboxIndex].id] ? (
                <img
                  src={(uniqueItems[lightboxIndex] as any).imageUrl}
                  alt={uniqueItems[lightboxIndex].caption}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  onError={() =>
                    setBrokenImages((prev) => ({
                      ...prev,
                      [uniqueItems[lightboxIndex].id]: true,
                    }))
                  }
                />
              ) : (
                <div className="w-[300px] sm:w-[340px] aspect-[9/17.5] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  {renderCardContent(uniqueItems[lightboxIndex])}
                </div>
              )}

              {/* Next Button inside Lightbox */}
              {uniqueItems.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % uniqueItems.length)
                  }
                  className="absolute right-2 sm:-right-12 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all shadow-lg active:scale-95"
                  title="Foto Berikutnya (Panah Kanan)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom helper info */}
            <p className="text-[11px] text-white/70 mt-3 text-center">
              {uniqueItems.length > 1
                ? 'Gunakan tombol panah keyboard atau geser layar untuk beralih foto • Tekan ESC untuk menutup'
                : 'Tekan ESC atau klik area luar untuk menutup'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};