import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../../types';
import {
  fetchAdminTestimonials,
  fetchAllTestimonialsAdmin,
  saveTestimonial,
  toggleTestimonialStatus,
  deleteTestimonial,
  uploadTestimonialImage,
  isSupabaseConfigured,
  getAdminSessionPin,
} from '../../lib/supabase';
import { compressImage, formatFileSize, CompressionResult } from '../../lib/imageCompression';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Sparkles,
  Smartphone,
  Info,
  Maximize2,
  X,
  FileCheck,
  Zap,
  AlertCircle,
  AlertTriangle,
  Layers,
  Plus,
} from 'lucide-react';

export interface QueuedPhoto {
  id: string;
  file: File;
  compressionResult: CompressionResult;
  caption: string;
  status: 'ready' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface TestimonialsTabProps {
  adminPin: string;
}

export const TestimonialsTab: React.FC<TestimonialsTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');

  // Form State (Mendukung upload banyak foto sekaligus)
  const [uploadQueue, setUploadQueue] = useState<QueuedPhoto[]>([]);
  const [defaultCaption, setDefaultCaption] = useState<string>('');
  const [isActiveOnUpload, setIsActiveOnUpload] = useState<boolean>(true);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number } | null>(null);

  // Status & Notification Banners
  const [uploadStepMessage, setUploadStepMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Lightbox Modal for previewing
  const [previewImage, setPreviewImage] = useState<{ url: string; caption?: string } | null>(null);
  // Broken image tracker to prevent rendering broken image icons
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const totalOriginalSize = uploadQueue.reduce((acc, it) => acc + it.compressionResult.originalSize, 0);
  const totalCompressedSize = uploadQueue.reduce((acc, it) => acc + it.compressionResult.compressedSize, 0);
  const totalSavingsRatio = totalOriginalSize > 0
    ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
    : 0;

  const loadTestimonials = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAdminTestimonials();
      setTestimonials(data);
    } catch (e: any) {
      console.error('Error memuat testimoni:', e);
      const msg = e?.message || 'Gagal memuat daftar testimoni dari server.';
      setFetchError(msg);
      error(`Gagal memuat testimoni: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [adminPin]);

  // Handle pemilihan foto sekaligus (multiple) & kompresi canvas HTML5 otomatis
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    const validImageFiles = rawFiles.filter((f) => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      warning('Harap pilih berkas foto/gambar yang valid (JPG, PNG, WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (validImageFiles.length < rawFiles.length) {
      warning(`${rawFiles.length - validImageFiles.length} berkas dilewati karena bukan gambar.`);
    }

    setUploadError(null);
    setUploadSuccessBanner(null);
    setIsCompressing(true);
    setCompressProgress({ current: 0, total: validImageFiles.length });

    const newQueued: QueuedPhoto[] = [];
    for (let i = 0; i < validImageFiles.length; i++) {
      const file = validImageFiles[i];
      setCompressProgress({ current: i + 1, total: validImageFiles.length });
      try {
        // Auto kompresi canvas HTML5: max width 720px, kualitas JPEG 0.8
        const result = await compressImage(file, 720, 0.8);
        newQueued.push({
          id: `queue-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          compressionResult: result,
          caption: defaultCaption.trim() || '',
          status: 'ready',
        });
      } catch (err) {
        console.error(`Gagal mengompres ${file.name}:`, err);
      }
    }

    setUploadQueue((prev) => [...prev, ...newQueued]);
    setIsCompressing(false);
    setCompressProgress(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (newQueued.length > 0) {
      success(`${newQueued.length} foto berhasil dikompres otomatis & siap diunggah!`);
    }
  };

  const handleRemoveQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQueueCaption = (id: string, newCaption: string) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption: newCaption } : item))
    );
  };

  const handleApplyDefaultCaptionToAll = () => {
    if (!defaultCaption.trim()) {
      warning('Silakan ketik keterangan terlebih dahulu.');
      return;
    }
    setUploadQueue((prev) =>
      prev.map((item) => ({ ...item, caption: defaultCaption.trim() }))
    );
    success('Keterangan berhasil diterapkan ke seluruh foto antrean!');
  };

  const handleResetForm = () => {
    setUploadQueue([]);
    setDefaultCaption('');
    setIsActiveOnUpload(true);
    setUploadStepMessage(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToUpload = uploadQueue.filter((item) => item.status !== 'success');
    if (itemsToUpload.length === 0) {
      warning('Silakan pilih minimal 1 foto screenshot terlebih dahulu.');
      return;
    }

    const pinToUse = adminPin || getAdminSessionPin();
    if (!pinToUse && isSupabaseConfigured) {
      const pinMsg = 'PIN sesi admin tidak ditemukan. Silakan login kembali ke portal admin.';
      setUploadError(pinMsg);
      error(pinMsg);
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccessBanner(null);

    let successCount = 0;
    let failedCount = 0;
    const total = itemsToUpload.length;

    for (let i = 0; i < total; i++) {
      const item = itemsToUpload[i];
      const percent = Math.round(((i + 1) / total) * 100);
      setUploadProgress({ current: i + 1, total, percent });
      setUploadStepMessage(
        `Mengunggah foto ${i + 1} dari ${total} (${percent}%)...`
      );

      // Tandai item sedang diunggah
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'uploading' } : it))
      );

      try {
        let finalImageUrl = item.compressionResult.dataUrl;

        // 1. Jika Supabase aktif, upload blob ke Supabase Storage bucket 'testimonials'
        if (isSupabaseConfigured) {
          const fileExt = 'jpg';
          const cleanName = item.caption
            ? item.caption.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
            : 'testi';
          const fileName = `wa-${cleanName}-${Date.now()}-${i}.${fileExt}`;

          const uploadRes = await uploadTestimonialImage(item.compressionResult.blob, fileName);
          if (uploadRes.error || !uploadRes.url) {
            throw new Error(uploadRes.error || 'Gagal mengunggah foto ke storage Supabase.');
          }
          finalImageUrl = uploadRes.url;
        }

        // 2. Simpan record data via RPC admin_manage_testimonial
        const result = await saveTestimonial(pinToUse, {
          image_url: finalImageUrl,
          caption: item.caption.trim() || undefined,
          is_active: isActiveOnUpload,
        });

        if (!result) {
          throw new Error('Gagal menyimpan testimoni: Server tidak mengembalikan konfirmasi data.');
        }

        successCount++;
        setUploadQueue((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'success' } : it))
        );
      } catch (err: any) {
        console.error(`Kendala saat upload foto ${item.file.name}:`, err);
        failedCount++;
        const msg = err?.message || 'Gagal menyimpan testimoni.';
        setUploadQueue((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: msg } : it
          )
        );
      }
    }

    // Refresh daftar testimoni
    await loadTestimonials();
    setIsSubmitting(false);
    setUploadStepMessage(null);
    setUploadProgress(null);

    if (failedCount === 0) {
      const successMsg = isSupabaseConfigured
        ? `Alhamdulillah! Seluruh ${successCount} foto testimoni WhatsApp berhasil diunggah ke Supabase Cloud & database!`
        : `Seluruh ${successCount} foto testimoni WhatsApp berhasil disimpan di penyimpanan lokal (Mode Preview)!`;
      setUploadSuccessBanner(successMsg);
      success(successMsg);
      setUploadQueue([]);
      setDefaultCaption('');
    } else {
      const partialMsg = `${successCount} foto berhasil diunggah, ${failedCount} foto mengalami kendala. Periksa daftar antrean di bawah.`;
      setUploadError(partialMsg);
      warning(partialMsg);
      // Sisakan yang gagal dalam antrean agar Bidan bisa mencoba lagi
      setUploadQueue((prev) => prev.filter((it) => it.status !== 'success'));
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const pinToUse = adminPin || getAdminSessionPin();
    try {
      const ok = await toggleTestimonialStatus(pinToUse, id);
      if (ok) {
        success(
          currentStatus
            ? 'Testimoni disembunyikan dari halaman depan.'
            : 'Testimoni berhasil diaktifkan di halaman depan!'
        );
        loadTestimonials();
      } else {
        error('Gagal mengubah status testimoni.');
      }
    } catch (e: any) {
      console.error(e);
      error(e?.message || 'Terjadi kesalahan saat mengubah status testimoni.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Bunda yakin ingin menghapus foto testimoni ini?')) return;

    const pinToUse = adminPin || getAdminSessionPin();
    try {
      const ok = await deleteTestimonial(pinToUse, id);
      if (ok) {
        success('Testimoni berhasil dihapus.');
        loadTestimonials();
      } else {
        error('Gagal menghapus testimoni.');
      }
    } catch (e: any) {
      console.error(e);
      error(e?.message || 'Terjadi kesalahan saat menghapus testimoni.');
    }
  };

  // Filtered testimonials
  const filteredList = testimonials.filter((item) => {
    if (filterStatus === 'active') return item.is_active;
    if (filterStatus === 'hidden') return !item.is_active;
    return true;
  });

  const totalCount = testimonials.length;
  const activeCount = testimonials.filter((t) => t.is_active).length;
  const hiddenCount = totalCount - activeCount;

  return (
    <div className="space-y-8">
      {/* Header & Status Notice */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-accent-dark" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-primary">
                Kelola Testimoni WhatsApp
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-light mt-1">
              Upload tangkapan layar (screenshot) chat WA kepuasan Bunda untuk disinkronkan ke galeri layar HP di halaman depan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Dual-Storage: Supabase Aktif' : 'Mode Offline: LocalStorage'}</span>
            </span>

            <button
              onClick={loadTestimonials}
              disabled={isLoading}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-charcoal-light transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-cream/60 rounded-xl p-3 text-center border border-accent/20">
            <span className="text-[11px] font-semibold text-charcoal-light uppercase tracking-wider block">
              Total Foto
            </span>
            <span className="text-xl sm:text-2xl font-bold text-primary">{totalCount}</span>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 text-center border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Aktif di Web
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-700">{activeCount}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <span className="text-[11px] font-semibold text-charcoal-light uppercase tracking-wider block">
              Disembunyikan
            </span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-light">{hiddenCount}</span>
          </div>
        </div>
      </div>

      {/* FORM UPLOAD PRAKTIS */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-soft border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-serif font-bold text-base sm:text-lg text-primary">
            Upload Screenshot Baru dari HP / Laptop
          </h3>
        </div>

        {/* Banner Sukses Unggah */}
        {uploadSuccessBanner && (
          <div className="mb-5 bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Testimoni Berhasil Disimpan & Sinkron!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {uploadSuccessBanner}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccessBanner(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Tutup Pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner Error Upload */}
        {uploadError && (
          <div className="mb-5 bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start justify-between gap-3 animate-shake shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Kendala Saat Menyimpan Testimoni
                </h4>
                <p className="text-xs text-rose-800 mt-1 font-mono text-[11px] break-all bg-white/70 p-2 rounded-lg border border-rose-200">
                  {uploadError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
              title="Tutup Pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitBatchUpload} className="space-y-5">
          {/* File Picker Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Pilih Foto Screenshot WhatsApp <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-accent-dark bg-accent/15 px-2.5 py-0.5 rounded-full">
                Mendukung Banyak Foto Sekaligus
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="hidden"
              id="testimonial-files-input"
            />

            {/* Dropzone utama (ketika antrean masih kosong) */}
            {uploadQueue.length === 0 && (
              <label
                htmlFor="testimonial-files-input"
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isCompressing
                    ? 'border-accent bg-accent/5'
                    : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                }`}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm font-bold text-primary">
                      Sedang Mengompres Gambar Otomatis ({compressProgress?.current || 0}/{compressProgress?.total || 0})...
                    </p>
                    <p className="text-xs text-charcoal-light">
                      Memperkecil dimensi hingga 720px & kompresi JPEG 0.8 langsung di browser.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        Klik di sini untuk Memilih / Mengambil Foto (Bisa Banyak Sekaligus)
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        Format JPG, PNG, atau WEBP. Pilih puluhan foto langsung dari Galeri HP atau Folder Komputer.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      Auto-Kompres Otomatis • Hemat Storage & Ringan
                    </span>
                  </div>
                )}
              </label>
            )}

            {/* Jika ada foto dalam antrean */}
            {uploadQueue.length > 0 && (
              <div className="space-y-4">
                {/* Ringkasan Kompresi Antrean */}
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-900">
                          {uploadQueue.length} Foto Siap Diunggah & Tersinkron!
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          Seluruh gambar telah dikompres otomatis di browser dengan rasio hemat terbaik.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="testimonial-files-input"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 cursor-pointer shadow-2xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Foto Lagi</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        disabled={isSubmitting}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  {/* Statistik Ukuran Kompresi */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-charcoal-light block text-[10px] uppercase font-semibold">
                        Total Ukuran Asli
                      </span>
                      <strong className="text-slate-700 text-sm">
                        {formatFileSize(totalOriginalSize)}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                        Total Terkompresi
                      </span>
                      <strong className="text-emerald-700 text-sm">
                        {formatFileSize(totalCompressedSize)}
                      </strong>
                    </div>

                    <div className="bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-300">
                      <span className="text-emerald-800 block text-[10px] uppercase font-semibold">
                        Hemat Kuota
                      </span>
                      <strong className="text-emerald-800 text-sm">
                        -{totalSavingsRatio}% Lebih Ringan
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Pengaturan Massal: Default Caption & Toggle Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                      Keterangan Seragam / Nama Bunda <span className="text-charcoal-light font-normal text-[10px]">(Opsional)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={defaultCaption}
                        onChange={(e) => setDefaultCaption(e.target.value)}
                        placeholder="Misal: Bunda Alvaro - Baby Spa Comal"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-charcoal focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDefaultCaptionToAll}
                        className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold shrink-0 transition-colors cursor-pointer"
                        title="Terapkan teks ini ke seluruh foto dalam antrean"
                      >
                        Terapkan ke Semua
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider mb-1">
                      Status Publikasi
                    </label>
                    <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-white transition-colors bg-white">
                      <input
                        type="checkbox"
                        checked={isActiveOnUpload}
                        onChange={(e) => setIsActiveOnUpload(e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-accent"
                      />
                      <span className="text-xs font-semibold text-charcoal">
                        Langsung Tampilkan di Web
                      </span>
                    </label>
                  </div>
                </div>

                {/* Grid Kartu Foto dalam Antrean */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {uploadQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 relative shadow-2xs group"
                    >
                      {/* Thumbnail Preview */}
                      <div className="relative w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={item.compressionResult.dataUrl}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: item.compressionResult.dataUrl,
                              caption: item.caption || item.file.name,
                            })
                          }
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Perbesar"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Detail & Input Keterangan Foto */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-slate-700 truncate" title={item.file.name}>
                              #{idx + 1} {item.file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQueueItem(item.id)}
                              disabled={isSubmitting}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                              title="Hapus foto ini dari antrean"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-charcoal-light mb-2">
                            <span>{formatFileSize(item.compressionResult.originalSize)}</span>
                            <span>&rarr;</span>
                            <span className="text-emerald-700 font-bold">
                              {formatFileSize(item.compressionResult.compressedSize)} (-{item.compressionResult.ratio}%)
                            </span>
                          </div>

                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => handleUpdateQueueCaption(item.id, e.target.value)}
                            placeholder="Keterangan foto ini..."
                            className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs text-charcoal focus:ring-1 focus:ring-accent outline-none"
                          />
                        </div>

                        {/* Status Badge */}
                        <div className="pt-2 flex items-center justify-between text-[10px]">
                          {item.status === 'ready' && (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Siap Unggah
                            </span>
                          )}
                          {item.status === 'uploading' && (
                            <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-accent" />
                              Mengunggah...
                            </span>
                          )}
                          {item.status === 'success' && (
                            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Berhasil
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full" title={item.errorMessage}>
                              Gagal Upload
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator saat Proses Upload & Simpan */}
          {isSubmitting && (
            <div className="space-y-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-accent shrink-0" />
                  <span>{uploadStepMessage || 'Sedang memproses upload foto...'}</span>
                </span>
                {uploadProgress && <span>{uploadProgress.percent}%</span>}
              </div>
              {uploadProgress && (
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary via-accent to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            {uploadQueue.length > 0 && (
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-charcoal text-xs font-semibold cursor-pointer"
              >
                Reset Antrean
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || uploadQueue.length === 0}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all ${
                isSubmitting || uploadQueue.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white hover:shadow-md active:translate-y-0.5 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengunggah {uploadQueue.length} Foto...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {uploadQueue.length > 0
                      ? `Upload & Simpan ${uploadQueue.length} Foto Testimoni`
                      : 'Pilih Foto Terlebih Dahulu'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DAFTAR & KONTROL TESTIMONI */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-soft border border-primary/10">
        {/* Banner Peringatan Fetch Error */}
        {fetchError && (
          <div className="mb-5 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start justify-between gap-3 text-xs text-amber-900 shadow-xs animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-[11px]">
                  Kendala Mengambil Data dari Supabase:
                </span>
                <span className="font-mono text-[11px] block mt-1 bg-white/70 p-2 rounded border border-amber-200 break-all text-amber-800">
                  {fetchError}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={loadTestimonials}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1.5 shrink-0 px-2 py-1 bg-white rounded-lg border border-amber-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-primary">
              Daftar Foto Testimoni WhatsApp ({filteredList.length})
            </h3>
            <p className="text-xs text-charcoal-light mt-0.5">
              Atur testimoni mana saja yang tampil di galeri mockup HP halaman depan klinik.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('hidden')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'hidden'
                  ? 'bg-white text-charcoal shadow-xs font-bold'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Disembunyikan ({hiddenCount})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center text-charcoal-light space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-accent animate-spin" />
            <p className="text-xs">Memuat galeri testimoni...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredList.length === 0 && (
          <div className="py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-charcoal-light mx-auto flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-charcoal">
              Belum ada foto testimoni
            </h4>
            <p className="text-xs text-charcoal-light max-w-sm mx-auto">
              {filterStatus !== 'all'
                ? 'Tidak ada testimoni yang cocok dengan filter yang dipilih.'
                : 'Silakan upload tangkapan layar testimoni WhatsApp Bunda di atas.'}
            </p>
          </div>
        )}

        {/* Grid Testimoni */}
        {!isLoading && filteredList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-card ${
                  item.is_active
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                {/* Image Preview Container (Smartphone Aspect Ratio) */}
                <div className="relative aspect-[9/14] bg-slate-900/5 overflow-hidden">
                  {brokenImages[item.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-2">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">Foto Gagal Dimuat</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Tautan gambar tidak valid</span>
                    </div>
                  ) : (
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Testimoni WhatsApp'}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                    />
                  )}

                  {/* Gradient Overlay & Hover Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          setPreviewImage({
                            url: item.image_url,
                            caption: item.caption,
                          })
                        }
                        className="w-8 h-8 rounded-full bg-white/90 text-charcoal hover:bg-white flex items-center justify-center shadow-sm"
                        title="Perbesar Foto"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-white text-[11px] leading-snug">
                      <span className="font-semibold block truncate">
                        {item.caption || 'Tanpa keterangan'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                        item.is_active
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700/80 text-white'
                      }`}
                    >
                      {item.is_active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Sembunyi</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Info & Action Footer */}
                <div className="p-3.5 space-y-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-primary truncate" title={item.caption}>
                      {item.caption || 'Testimoni WhatsApp Bunda'}
                    </h4>
                    <p className="text-[10px] text-charcoal-light mt-0.5">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Baru saja'}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.is_active)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                        item.is_active
                          ? 'border-slate-200 hover:bg-slate-100 text-charcoal'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                      title={item.is_active ? 'Sembunyikan dari web' : 'Tampilkan di web'}
                    >
                      {item.is_active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-charcoal-light" />
                          <span>Sembunyikan</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Tampilkan</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Testimoni"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL LIGHTBOX PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 sm:right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Preview */}
            {brokenImages[previewImage.url] ? (
              <div className="bg-slate-900/90 text-white p-8 rounded-2xl flex flex-col items-center text-center max-w-sm">
                <ImageIcon className="w-12 h-12 text-slate-400 mb-3" />
                <p className="font-bold text-sm">Gambar Gagal Dimuat</p>
                <p className="text-xs text-slate-400 mt-1">Berkas foto tidak dapat diakses atau URL tidak valid.</p>
              </div>
            ) : (
              <img
                src={previewImage.url}
                alt={previewImage.caption || 'Preview'}
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
                onError={() => setBrokenImages((prev) => ({ ...prev, [previewImage.url]: true }))}
              />
            )}

            {previewImage.caption && (
              <div className="mt-3 bg-black/60 px-4 py-2 rounded-full text-white text-xs font-semibold border border-white/20 text-center">
                {previewImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
