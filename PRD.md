# 📋 PRD — Product Requirements Document
## CABI: Click & Collect Cimol/Cilok Platform

---

## 1. Ringkasan Produk

**CABI** adalah platform web pre-order makanan Click & Collect yang dirancang khusus untuk mahasiswa di area kampus Bandung. Platform ini menghilangkan tiga masalah utama mahasiswa dalam memesan makanan: *decision fatigue* (terlalu banyak pilihan), ongkos kirim mahal, dan waktu tunggu driver yang lama.

### Value Proposition
> "Pesan cimol/cilok favorit dalam 30 detik, ambil di titik pickup dekat kampus, tanpa ongkir."

---

## 2. Target Pengguna

### Primary: Mahasiswa (Customer)
- Usia 18–24 tahun
- Tinggal/kuliah di area Bandung
- Butuh solusi makan cepat, murah, tanpa ribet
- Familiar dengan WhatsApp untuk komunikasi

### Secondary: Admin/Pemilik Usaha
- Mengelola stok dan pesanan dari dashboard
- Membutuhkan sistem sederhana tanpa learning curve tinggi

---

## 3. Fitur MVP (V1)

### 3.1 Landing Page (`index.html`)
- [x] Hero section dengan CTA "Pesan Sekarang"
- [x] Problem statement (Decision Fatigue, Ongkir Mahal, Lama Nunggu)
- [x] Step-by-step "Cara Kerja" (3 langkah)
- [x] Section "Kenapa CABI" dengan value proposition
- [x] Footer dengan kontak (WhatsApp + Instagram)
- [x] Responsive design (mobile-first)

### 3.2 Aplikasi Pemesanan (`app.html`)
- [x] Welcome overlay — pilih lokasi pickup
- [x] GPS sorting — urutkan lokasi berdasarkan jarak terdekat
- [x] Menu listing dengan stok real-time per lokasi
- [x] Detail menu (deskripsi lengkap + saran penyajian)
- [x] Keranjang belanja (add/remove items, validasi stok)
- [x] Checkout modal (nama, waktu pickup)
- [x] Toggle metode: Ambil Sendiri / Delivery (+ input alamat)
- [x] Integrasi WhatsApp — pesan otomatis ke admin
- [x] Modal sukses dengan detail pembayaran (BCA)
- [x] Persistensi lokasi (localStorage) — skip welcome saat kembali
- [x] Auto-refresh stok saat tab aktif kembali

### 3.3 Dashboard Admin (`admin.html`)
- [x] Login dengan Supabase Auth (email + password)
- [x] Manajemen stok per lokasi per menu
- [x] CRUD menu lengkap (nama, harga, foto, deskripsi, cara masak)
- [x] Upload foto menu ke Supabase Storage
- [x] Pesanan masuk — terima/tolak dengan loading state
- [x] Statistik (total transaksi selesai + estimasi pendapatan)
- [x] Toast notification (menggantikan alert browser)
- [x] Tab navigation (Stok Makanan / Pesanan Masuk)
- [x] Pending badge di tab pesanan

---

## 4. Arsitektur Teknis

### Stack
- **Frontend**: HTML5, Tailwind CSS v4, Vanilla JavaScript (ES Modules)
- **Build**: Vite 8 (multi-page)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Hosting**: Netlify (static)

### Database Schema
| Tabel | Fungsi |
|---|---|
| `locations` | Daftar titik pickup (nama, alamat, koordinat, guidance) |
| `menus` | Daftar menu (nama, harga, deskripsi, foto, cara masak) |
| `location_stocks` | Stok per menu per lokasi |
| `transactions` | Record pesanan (status: Pending/Selesai/Ditolak) |
| `admins` | Mapping user auth → location_id |

### Security
- Row Level Security (RLS) aktif di semua tabel
- API key hanya anon key (read-only untuk public)
- Admin actions memerlukan authenticated session
- Environment variables untuk secrets (`.env`)

---

## 5. User Flow

```
Customer:
Landing Page → Pilih Lokasi → Browse Menu → Add to Cart → Checkout 
→ Pilih Pickup/Delivery → Kirim ke WA → Transfer BCA → Konfirmasi ke Admin

Admin:
Login → Dashboard → Update Stok / Kelola Menu → Terima/Tolak Pesanan
→ Stok otomatis terpotong → Statistik terupdate
```

---

## 6. Non-Goals (V2 — Tidak termasuk V1)

- ❌ User registration/login untuk customer
- ❌ Payment gateway integration (Midtrans, dll)
- ❌ Push notification / real-time updates (WebSocket)
- ❌ Rating & review system
- ❌ Multi-admin role management
- ❌ Order history untuk customer
- ❌ Promo code / diskon system

---

## 7. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| End-to-end order flow | Berjalan tanpa error |
| Waktu checkout | < 60 detik dari buka app |
| Admin stok update | Real-time sync ke customer app |
| Mobile responsiveness | Berfungsi di layar 375px+ |

---

*Dokumen ini merupakan versi final PRD untuk submission Milestone 1.*
