import React, { useState, useEffect } from 'react';
import { getLocalSettings, updateAppSetting, isSupabaseConfigured } from '../../lib/supabase';
import { AppSettings } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Settings, Phone, MapPin, KeyRound, Database, Check, ShieldCheck, Info } from 'lucide-react';

interface SettingsTabProps {
  adminPin: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ adminPin }) => {
  const { success, error, warning } = useToast();
  const [settings, setSettings] = useState<AppSettings>(() => getLocalSettings());

  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const s = getLocalSettings();
    setSettings(s);
    setWhatsapp(s.whatsapp_number);
    setAddress(s.clinic_address);
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) {
      warning('Nomor WhatsApp wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await updateAppSetting(adminPin, 'whatsapp_number', whatsapp.trim());
      await updateAppSetting(adminPin, 'clinic_address', address.trim());
      success('Pengaturan kontak & alamat klinik berhasil diperbarui!');
    } catch (e) {
      console.error(e);
      error('Gagal memperbarui pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      warning('PIN baru harus tepat 6 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      warning('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    setIsSaving(true);
    try {
      await updateAppSetting(adminPin, 'admin_pin', newPin);
      sessionStorage.setItem('imb_admin_pin', newPin);
      success('PIN Admin berhasil diubah! Gunakan PIN baru ini untuk login berikutnya.');
      setNewPin('');
      setConfirmPin('');
    } catch (e) {
      console.error(e);
      error('Gagal mengubah PIN.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Clinic Contact & Location Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-card">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-primary">
              Pengaturan Profil Klinik
            </h3>
            <p className="text-xs text-charcoal-light">
              Informasi ini digunakan pada link pesan WhatsApp otomatis dan informasi kontak publik.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveContact} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Nomor WhatsApp Resmi Klinik *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="6287856960422"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              *Gunakan awalan 62 (contoh: 6287856960422) agar link WhatsApp otomatis berfungsi lancar di semua perangkat.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Alamat Lengkap Klinik Comal
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-charcoal focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow-gold flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan Klinik</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Admin PIN Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/10 shadow-card">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-primary">
              Ubah PIN Admin (6 Digit)
            </h3>
            <p className="text-xs text-charcoal-light">
              Pastikan PIN baru mudah diingat oleh Bidan Indah dan jangan bagikan kepada siapapun.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              PIN Baru (6 Digit Angka) *
            </label>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="Contoh: 889900"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tracking-widest font-bold text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Ulangi PIN Baru *
            </label>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="Ulangi 6 digit angka"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tracking-widest font-bold text-charcoal"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Perbarui PIN Keamanan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Status Banner */}
      <div className="bg-cream/80 p-5 rounded-2xl border border-primary/15 text-xs text-charcoal space-y-2">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Database className="w-4 h-4 text-accent" />
          <span>Status Database Supabase</span>
        </div>
        <p className="leading-relaxed text-charcoal-light">
          {isSupabaseConfigured ? (
            <span className="text-emerald-700 font-semibold">
              ✓ Terhubung dengan Supabase Cloud secara live. Semua data layanan, booking, dan slot libur sinkron dengan tabel PostgreSQL.
            </span>
          ) : (
            <span>
              ℹ️ Saat ini aplikasi berjalan dalam mode <strong>Local Storage Persistent</strong>. Data tersimpan aman di browser Anda. 
              Untuk menghubungkan ke Supabase Cloud, salin SQL dari <code className="bg-white px-1.5 py-0.5 rounded border">supabase/schema.sql</code> ke Supabase SQL Editor Anda, lalu isi file <code className="bg-white px-1.5 py-0.5 rounded border">.env</code> dengan URL dan ANON KEY proyek Supabase Anda.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
