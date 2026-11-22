import { Testimonial } from '../types';

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-initial-1',
    image_url: '/testimoni/chat-1.svg',
    caption: 'Bunda Rina - Baby Spa (Comal)',
    is_active: true,
    created_at: new Date('2026-11-20T08:30:00Z').toISOString(),
  },
  {
    id: 'testi-initial-2',
    image_url: '/testimoni/chat-2.svg',
    caption: 'Bunda Anisa - Paket Bapil (Sinar, Massage, Uap)',
    is_active: true,
    created_at: new Date('2026-11-21T19:50:00Z').toISOString(),
  },
  {
    id: 'testi-initial-3',
    image_url: '/testimoni/chat-3.svg',
    caption: 'Bunda Dewi - Pijat Laktasi & Newborn',
    is_active: true,
    created_at: new Date('2026-11-22T16:30:00Z').toISOString(),
  },
];
