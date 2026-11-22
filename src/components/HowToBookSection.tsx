import React from 'react';
import { Sparkles, CalendarCheck2, FileText, SendHorizontal } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

export const HowToBookSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Pilih Layanan & Tipe Kunjungan',
      desc: 'Pilih paket Baby Treatment, Kids Treatment, atau Mom Treatment. Tentukan apakah Bunda ingin datang ke klinik atau meminta Bidan datang ke rumah (Homecare).',
      icon: <Sparkles className="w-6 h-6 text-accent" />,
    },
    {
      num: '02',
      title: 'Tentukan Tanggal & Jam',
      desc: 'Pilih tanggal dan slot jam operasional yang tersedia secara real-time. Jam yang telah terisi atau libur otomatis terkunci agar jadwal tidak bentrok.',
      icon: <CalendarCheck2 className="w-6 h-6 text-primary" />,
    },
    {
      num: '03',
      title: 'Lengkapi Data Bunda & Anak',
      desc: 'Masukkan nama Bunda, kontak WhatsApp, nama Si Kecil, dan keluhan (misal: batuk pilek/kembung). Data akan tersimpan aman di perangkat Bunda untuk pemesanan berikutnya.',
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
    },
    {
      num: '04',
      title: 'Konfirmasi via WhatsApp',
      desc: 'Sistem otomatis mengarahkan ke WhatsApp resmi Bidan Indah dengan format rincian pesanan yang rapi untuk konfirmasi akhir.',
      icon: <SendHorizontal className="w-6 h-6 text-accent" />,
    },
  ];

  return (
    <section id="cara-reservasi" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <span>Panduan Mudah</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
              Alur Reservasi Cepat & Nyaman
            </h2>
            <p className="text-base text-charcoal-light">
              Hanya butuh 1 menit untuk mengamankan slot perawatan terbaik bagi Bunda dan Si Kecil tercinta.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <RevealOnScroll
              key={idx}
              variant="fade-up"
              delay={idx * 150}
              className="h-full"
            >
              <div className="bg-cream rounded-3xl p-6 border border-primary/10 relative flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-accent/30 group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                      {step.icon}
                    </div>
                    <span className="font-serif font-bold text-3xl text-primary/20 group-hover:text-primary/40 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-primary/5 flex items-center gap-1 text-[11px] font-bold text-accent">
                  <span>Langkah {step.num}</span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
