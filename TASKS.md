# ✅ TASKS.md — Development Checklist

## CABI: Click & Collect Platform

---

## Milestone 1: Foundation & Planning
- [x] Buat project structure (HTML + CSS + JS)
- [x] Setup Vite sebagai build tool
- [x] Integrasikan Tailwind CSS v4
- [x] Buat landing page dasar
- [x] Tulis PRD.md

## Milestone 2: Database & Backend
- [x] Setup Supabase project
- [x] Buat tabel: `locations`, `menus`, `location_stocks`, `transactions`, `admins`
- [x] Setup Row Level Security (RLS) policies
- [x] Konfigurasi Supabase Auth untuk admin
- [x] Buat `supabase_setup.sql`
- [x] Tulis CLAUDE.md

## Milestone 3: Customer App (app.html)
- [x] Welcome overlay — pilih lokasi pickup
- [x] GPS sorting (urutkan lokasi by jarak)
- [x] Fetch menu dari Supabase
- [x] Render menu cards dengan stok real-time
- [x] Cart system (add/remove, validasi stok limit)
- [x] Cart bar floating di bawah
- [x] Checkout modal (nama, waktu pickup)
- [x] Toggle: Ambil Sendiri / Delivery
- [x] Input alamat (conditional, untuk Delivery)
- [x] Generate template WhatsApp otomatis
- [x] Insert transaction ke Supabase
- [x] Success modal dengan detail pembayaran BCA
- [x] Tombol "Kirim Bukti ke WA Admin"
- [x] Menu detail modal (deskripsi + saran penyajian)
- [x] Location change modal

## Milestone 4: Admin Dashboard (admin.html)
- [x] Login page dengan Supabase Auth
- [x] Admin-to-location mapping via `admins` table
- [x] Tab navigation: Stok Makanan / Pesanan Masuk
- [x] Manajemen stok (input per menu per lokasi)
- [x] Simpan stok ke Supabase (upsert)
- [x] CRUD Menu (tambah, edit, hapus)
- [x] Upload foto menu ke Supabase Storage
- [x] Image preview saat edit menu
- [x] Pesanan masuk — list pending orders
- [x] Terima pesanan (auto-deduct stok)
- [x] Tolak pesanan (stok utuh)
- [x] Statistik: total transaksi + estimasi pendapatan
- [x] Pending badge di tab pesanan
- [x] Tulis TASKS.md (file ini)

## Milestone 5: UI/UX Polish
- [x] Landing page: hero, problem section, cara kerja, CTA
- [x] Responsive design (mobile-first)
- [x] Foto produk asli (bukan stock photo)
- [x] Logo Cabi di navbar + footer
- [x] Animasi hover, active states, transitions
- [x] Proportional modal design (menu detail + success)
- [x] Loading states di semua async button
- [x] Toast notifications (ganti native alert)
- [x] Lokasi tersimpan di localStorage
- [x] Auto-refresh stok saat tab aktif kembali
- [x] Kontak darurat + Instagram di footer

## Milestone 6: Security & Deployment
- [x] RLS policies aktif di semua tabel
- [x] Environment variables untuk Supabase secrets
- [x] `.env` tidak di-commit ke Git
- [x] Rename asset files (hapus spasi & karakter spesial)
- [x] Tulis SECURITY-AUDIT.md
- [x] `npm run build` — 0 warnings
- [x] Deploy ke Netlify (drag & drop dist/)
- [x] Test live URL end-to-end

## Milestone 7: Final Submission
- [x] README.md komprehensif
- [x] PRD.md final
- [x] CLAUDE.md final
- [x] TASKS.md final (file ini)
- [x] SECURITY-AUDIT.md
- [ ] Demo video (2 menit)
- [ ] Upload ke GitHub (min 15 commits)
- [ ] Refleksi singkat (1 halaman)
- [ ] Submit ke Google Drive

---

*Last updated: May 14, 2026*
