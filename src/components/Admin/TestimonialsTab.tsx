import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../../types';
import {
  fetchAllTestimonialsAdmin,
  saveTestimonial,
  toggleTestimonialStatus,
  deleteTestimonial,
  uploadTestimonialImage,
  isSupabaseConfigured,
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
} from 'lucide-react';

interface TestimonialsTabProps {
  adminPin: string;
}

export const TestimonialsTab: React.FC<TestimonialsTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isActiveOnUpload, setIsActiveOnUpload] = useState<boolean>(true);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lightbox Modal for previewing
  const [previewImage, setPreviewImage] = useState<{ url: string; caption?: string } | null>(null);
  // Broken image tracker to prevent rendering broken image icons
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllTestimonialsAdmin();
      setTestimonials(data);
    } catch (e) {
      console.error(e);
      error('Gagal memuat daftar testimoni.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [adminPin]);

  // Handle image selection & automatic browser-side compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      warning('Harap pilih berkas foto/gambar yang valid.');
      return;
    }

    setSelectedFile(file);
    setIsCompressing(true);
    try {
      // Auto kompresi canvas HTML5: max width 720px, kualitas JPEG 0.8
      const result = await compressImage(file, 720, 0.8);
      setCompressionResult(result);
    } catch (err) {
      console.error('Gagal mengompres gambar:', err);
      error('Terjadi kesalahan saat memproses gambar.');
      setSelectedFile(null);
      setCompressionResult(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleResetForm = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setCaption('');
    setIsActiveOnUpload(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!compressionResult) {
      warning('Silakan pilih foto screenshot testimoni terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = compressionResult.dataUrl;
      let storageMode: 'supabase' | 'local' = 'local';

      // 1. Jika Supabase aktif, upload blob ke Supabase Storage bucket 'testimonials'
      if (isSupabaseConfigured) {
        const fileExt = 'jpg';
        const cleanName = caption
          ? caption.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
          : 'testi';
        const fileName = `wa-${cleanName}-${Date.now()}.${fileExt}`;

        const uploadRes = await uploadTestimonialImage(compressionResult.blob, fileName);
        if (uploadRes.error || !uploadRes.url) {
          throw new Error(`Upload ke Storage gagal: ${uploadRes.error || 'URL tidak tersedia'}`);
        }
        finalImageUrl = uploadRes.url;
        storageMode = 'supabase';
      }

      // 2. Simpan record data via RPC admin_manage_testimonial
      const result = await saveTestimonial(adminPin, {
        image_url: finalImageUrl,
        caption: caption.trim() || undefined,
        is_active: isActiveOnUpload,
      });

      if (result) {
        if (storageMode === 'supabase') {
          success('Foto testimoni berhasil di-upload ke Supabase Cloud!');
        } else {
          success('Testimoni berhasil disimpan di Local Storage (Mode Preview)!');
        }
        handleResetForm();
        loadTestimonials();
      } else {
        error('Gagal menyimpan data testimoni.');
      }
    } catch (err: any) {
      console.error(err);
      error(err?.message || 'Terjadi kendala saat upload testimoni.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const ok = await toggleTestimonialStatus(adminPin, id);
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

    try {
      const ok = await deleteTestimonial(adminPin, id);
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

        <form onSubmit={handleSubmitUpload} className="space-y-5">
          {/* File Picker Area */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Pilih Foto Screenshot WhatsApp <span className="text-rose-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="testimonial-file-input"
            />

            {!compressionResult && (
              <label
                htmlFor="testimonial-file-input"
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
                      Sedang Mengompres Gambar Otomatis...
                    </p>
                    <p className="text-xs text-charcoal-light">
                      Memperkecil dimensi hingga 720px & kompresi JPEG 0.8 di browser.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        Klik di sini untuk Memilih / Mengambil Foto
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        Format JPG, PNG, atau WEBP. Langsung dari Galeri atau Kamera HP.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-accent-dark bg-accent/15 px-3 py-1 rounded-full">
                      Auto-Kompres Otomatis & Super Ringan
                    </span>
                  </div>
                )}
              </label>
            )}

            {/* Preview of Compressed Image & Comparison Stats */}
            {compressionResult && (
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center">
                {/* Thumbnail Preview */}
                <div className="relative group shrink-0">
                  <img
                    src={compressionResult.dataUrl}
                    alt="Preview"
                    className="w-28 h-44 sm:w-32 sm:h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        url: compressionResult.dataUrl,
                        caption: caption || 'Preview Foto Terkompresi',
                      })
                    }
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity"
                    title="Klik untuk perbesar"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Compression Info */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">
                      Gambar Berhasil Dikompres Otomatis di Browser!
                    </span>
                  </div>

                  {/* Size comparison pill */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-charcoal-light block text-[10px] uppercase font-semibold">
                        Ukuran Asli
                      </span>
                      <strong className="text-slate-700 text-sm">
                        {formatFileSize(compressionResult.originalSize)}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                        Ukuran Terkompres
                      </span>
                      <strong className="text-emerald-700 text-sm">
                        {formatFileSize(compressionResult.compressedSize)}
                      </strong>
                    </div>

                    <div className="bg-emerald-100/70 p-2.5 rounded-lg border border-emerald-300 col-span-2 sm:col-span-1">
                      <span className="text-emerald-800 block text-[10px] uppercase font-semibold">
                        Hemat Kuota
                      </span>
                      <strong className="text-emerald-800 text-sm">
                        -{compressionResult.ratio}% Lebih Ringan
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-charcoal-light">
                    Dimensi disesuaikan: {compressionResult.width} &times; {compressionResult.height}px. Sangat cepat dibuka oleh pengunjung web!
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <label
                      htmlFor="testimonial-file-input"
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Ganti Foto Lain
                    </label>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Caption / Nama Bunda */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Keterangan Singkat / Nama Bunda <span className="text-charcoal-light font-normal text-[11px]">(Opsional)</span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Misal: Bunda Rina - Baby Spa Comal"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-charcoal focus:ring-2 focus:ring-accent focus:border-accent outline-none"
              />
              <p className="text-[11px] text-charcoal-light mt-1">
                Keterangan ini akan muncul sebagai label manis di bawah mockup HP.
              </p>
            </div>

            {/* Toggle Status On Upload */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Status Tampil
              </label>
              <label className="flex items-center gap-2.5 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            {compressionResult && (
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-charcoal text-xs font-semibold"
              >
                Reset
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !compressionResult}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all ${
                isSubmitting || !compressionResult
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white hover:shadow-md active:translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Testimoni...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Simpan & Upload Testimoni</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DAFTAR & KONTROL TESTIMONI */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-soft border border-primary/10">
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
