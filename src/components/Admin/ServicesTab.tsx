import React, { useState, useEffect } from 'react';
import { Service, ServiceCategory } from '../../types';
import {
  fetchAllServices,
  saveService,
  toggleServiceStatus,
  deleteService,
  isValidUuid,
} from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Check, X, Clock, Users, RefreshCw, ArrowUpDown } from 'lucide-react';

interface ServicesTabProps {
  adminPin: string;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [category, setCategory] = useState<ServiceCategory>('Baby & Kids Treatment');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [duration, setDuration] = useState<number>(45);
  const [targetAge, setTargetAge] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dapatkan PIN otorisasi admin dari sessionStorage atau props
  const getEffectivePin = (): string => {
    if (typeof window !== 'undefined') {
      const sessionPin =
        sessionStorage.getItem('indah_spa_session_pin') ||
        sessionStorage.getItem('imb_admin_pin');
      if (sessionPin) return sessionPin;
    }
    return adminPin || '';
  };

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllServices();
      setServices(data);
    } catch (e) {
      console.error(e);
      error('Gagal memuat daftar layanan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [adminPin]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setCategory('Baby & Kids Treatment');
    setName('');
    setDescription('');
    setDuration(45);
    setTargetAge('');
    setSortOrder(services.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (srv: Service) => {
    setEditingService(srv);
    setCategory(srv.category);
    setName(srv.name);
    setDescription(srv.description);
    setDuration(srv.duration_minutes || 45);
    setTargetAge(srv.target_age || srv.age_range || '');
    setSortOrder(srv.sort_order ?? 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      warning('Nama layanan treatment wajib diisi.');
      return;
    }

    const pin = getEffectivePin();
    if (!pin) {
      error('Sesi admin tidak ditemukan. Silakan masukkan PIN kembali.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Service> & {
        name: string;
        category: ServiceCategory;
      } = {
        id: editingService ? editingService.id : undefined,
        category,
        name: name.trim(),
        description: description.trim(),
        duration_minutes: Number(duration),
        price: 0,
        target_age: targetAge.trim(),
        age_range: targetAge.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: editingService ? editingService.is_active : true,
      };

      const result = await saveService(pin, payload);

      if (result.success) {
        const isTrueUpdate = editingService && isValidUuid(editingService.id);
        success(isTrueUpdate ? 'Layanan berhasil diupdate!' : 'Layanan baru berhasil ditambahkan!');
        setIsModalOpen(false);
        await loadServices();
      } else {
        // Jangan tampilkan toast sukses jika RPC error atau ID bukan UUID valid
        error(result.error || 'Gagal menyimpan layanan ke Supabase.');
      }
    } catch (e: any) {
      console.error(e);
      error(e?.message || 'Terjadi kesalahan saat menyimpan layanan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    const pin = getEffectivePin();
    if (!pin) {
      error('Sesi admin tidak ditemukan. Silakan masukkan PIN kembali.');
      return;
    }

    try {
      const result = await toggleServiceStatus(pin, id);
      if (result.success) {
        success('Status aktif layanan berhasil diubah.');
        await loadServices();
      } else {
        error(result.error || 'Gagal mengubah status layanan.');
      }
    } catch (e: any) {
      console.error(e);
      error(e?.message || 'Gagal mengubah status layanan.');
    }
  };

  const handleDelete = async (id: string, srvName: string) => {
    if (!confirm(`Hapus layanan "${srvName}" secara permanen?`)) return;

    const pin = getEffectivePin();
    if (!pin) {
      error('Sesi admin tidak ditemukan. Silakan masukkan PIN kembali.');
      return;
    }

    try {
      const result = await deleteService(pin, id);
      if (result.success) {
        success(`Layanan "${srvName}" berhasil dihapus.`);
        await loadServices();
      } else {
        error(result.error || 'Gagal menghapus layanan.');
      }
    } catch (e: any) {
      console.error(e);
      error(e?.message || 'Gagal menghapus layanan.');
    }
  };

  const filteredServices = services.filter(s => {
    if (activeCategoryFilter === 'all') return true;
    return s.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'Baby & Kids Treatment', 'Terapi & Paket Spesial', 'Mom Treatment'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategoryFilter === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-cream text-charcoal hover:bg-cream-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow-gold transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Layanan Treatment</span>
        </button>
      </div>

      {/* Services List Table / Cards (NO PRICE DISPLAY) */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-charcoal-light">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-xs">Memuat daftar layanan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(srv => (
            <div
              key={srv.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                srv.is_active
                  ? 'border-primary/10 shadow-soft'
                  : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {srv.category}
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal-light bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-accent" />
                    Urutan #{srv.sort_order ?? 0}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-primary mb-1">
                  {srv.name}
                </h4>

                <p className="text-xs text-charcoal-light line-clamp-3 leading-relaxed mb-4">
                  {srv.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-light py-2 border-t border-slate-100 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {srv.duration_minutes || 45} Menit
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {srv.target_age || srv.age_range || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleToggle(srv.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      srv.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {srv.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(srv)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      title="Edit Layanan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id, srv.name)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Layanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal (NO PRICE FIELD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-bounce-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-primary/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-primary">
                {editingService ? 'Edit Layanan Treatment' : '+ Tambah Layanan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Kategori:
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ServiceCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="Baby & Kids Treatment">Baby & Kids Treatment</option>
                  <option value="Terapi & Paket Spesial">Terapi & Paket Spesial</option>
                  <option value="Mom Treatment">Mom Treatment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Nama Layanan Treatment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pijat Bayi Sehat"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Durasi (Mnt) *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    step={5}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Sasaran Usia
                  </label>
                  <input
                    type="text"
                    placeholder="0 - 24 Bulan"
                    value={targetAge}
                    onChange={e => setTargetAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="1"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Deskripsi & Manfaat Treatment
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan manfaat perawatan ini secara singkat dan jelas untuk Bunda."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-charcoal hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-gold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Layanan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
