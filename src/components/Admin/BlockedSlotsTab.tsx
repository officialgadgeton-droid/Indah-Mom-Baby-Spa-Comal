import React, { useState, useEffect } from 'react';
import { BlockedSlot } from '../../types';
import { OPERATING_SLOTS } from '../../data/initialServices';
import { fetchBlockedSlots, addBlockedSlot, deleteBlockedSlot } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { CalendarOff, Plus, Trash2, Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface BlockedSlotsTabProps {
  adminPin: string;
}

export const BlockedSlotsTab: React.FC<BlockedSlotsTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [blockDate, setBlockDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [blockTime, setBlockTime] = useState<string>(''); // empty string means full day
  const [reason, setReason] = useState<string>('Jadwal Praktik Luar / Libur Bidan');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadSlots = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlockedSlots();
      setBlockedSlots(data);
    } catch (e) {
      console.error(e);
      error('Gagal memuat jadwal libur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [adminPin]);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      warning('Tanggal blokir wajib ditentukan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addBlockedSlot(
        adminPin,
        blockDate,
        blockTime ? blockTime : null,
        reason.trim() || 'Libur Operasional'
      );
      if (ok) {
        success('Slot jadwal libur berhasil ditambahkan & terkunci di publik!');
        setReason('Jadwal Praktik Luar / Libur Bidan');
        loadSlots();
      } else {
        error('Gagal menambahkan slot libur.');
      }
    } catch (e) {
      console.error(e);
      error('Terjadi kesalahan saat memblokir slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Buka kembali slot jadwal ini agar tersedia untuk umum?')) return;
    try {
      const ok = await deleteBlockedSlot(adminPin, id);
      if (ok) {
        success('Slot jadwal berhasil dibuka kembali.');
        loadSlots();
      } else {
        error('Gagal membuka blokir jadwal.');
      }
    } catch (e) {
      console.error(e);
      error('Terjadi kesalahan.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Blokir Jadwal */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-primary/10 shadow-card space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarOff className="w-3.5 h-3.5" />
            <span>Tutup Slot / Hari Libur</span>
          </div>
          <h3 className="font-serif font-bold text-xl text-primary">
            Kunci Jadwal Bidan
          </h3>
          <p className="text-xs text-charcoal-light mt-1">
            Gunakan form ini jika Bidan berhalangan praktik, cuti, atau sedang ada kunjungan luar, 
            sehingga Bunda di web tidak dapat memilih jam tersebut.
          </p>
        </div>

        <form onSubmit={handleAddBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Pilih Tanggal Libur / Tutup *
            </label>
            <input
              type="date"
              required
              value={blockDate}
              onChange={e => setBlockDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Pilih Jam yang Ditutup:
            </label>
            <select
              value={blockTime}
              onChange={e => setBlockTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-charcoal"
            >
              <option value="">-- Tutup Seharian Penuh --</option>
              {OPERATING_SLOTS.map(t => (
                <option key={t} value={t}>
                  Jam {t} WIB saja
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              *Pilih opsi pertama jika Bidan libur 1 hari penuh.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Alasan Penutupan (Ditampilkan ke Bunda jika slot dipilih)
            </label>
            <input
              type="text"
              placeholder="Contoh: Praktik Luar / Cuti / Penuh"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <CalendarOff className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Kunci / Blokir Jadwal Ini'}</span>
          </button>
        </form>
      </div>

      {/* List Active Blocked Slots */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-primary/10 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-serif font-bold text-lg text-primary">
              Daftar Jadwal yang Sedang Ditutup
            </h4>
            <p className="text-xs text-charcoal-light">
              Total {blockedSlots.length} jadwal terkunci saat ini.
            </p>
          </div>
          <button
            onClick={loadSlots}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-charcoal-light">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Memuat data slot libur...</p>
          </div>
        ) : blockedSlots.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-charcoal-light">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">Tidak ada jadwal yang diblokir.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua slot jam beroperasi normal.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {blockedSlots.map(slot => (
              <div
                key={slot.id}
                className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-rose-800">
                      {new Date(slot.block_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                      {slot.block_time ? `Pukul ${slot.block_time} WIB` : 'Libur Seharian'}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-light">
                    Alasan: <span className="font-medium text-charcoal">{slot.reason}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(slot.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Buka Kembali</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
