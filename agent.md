# Agent Tracking & Project Plan

## 🎯 Project Overview
- **Goal:** Membangun platform solusi makanan praktis untuk mahasiswa yang mengalami decision fatigue. Sistem ini bertujuan menyederhanakan proses pemilihan makanan dengan menyediakan menu yang terkurasi, cepat, dan efisien sehingga pengguna tidak perlu menghabiskan banyak energi mental untuk memilih makanan di tengah kesibukan akademik.

## 📋 Requirements
### Functional Requirements
- Curated Menu Display: Sistem harus menampilkan pilihan menu yang sudah disederhanakan (tidak overchoice) untuk mempercepat pengambilan keputusan.

- Quick Order System: Alur pemesanan yang minimalis untuk mendukung gaya hidup fast-paced mahasiswa.

- Location-Based Integration: Pengguna dapat menemukan titik pengambilan (outlet) Cabi terdekat dengan lokasi kampus atau tempat kerja.

- Availability Real-time: Menampilkan status ketersediaan stok produk secara langsung untuk menghindari pembatalan pesanan.

### Non-Functional Requirements
- Mobile-First Responsiveness: Mengingat target audiens adalah mahasiswa dengan mobilitas tinggi, platform harus optimal di perangkat mobile.

- High Speed Loading: Waktu muat halaman harus di bawah 2 detik untuk menjaga pengalaman pengguna yang bebas stres.

- Scalability: Sistem mampu menangani lonjakan pesanan pada jam istirahat kuliah atau jam makan siang.

- Visual Consistency: Antarmuka harus mencerminkan identitas brand yang ceria dan energik (Orange & Warm Yellow).

## 🎨 Design & UI/UX
- **Moodboard / Inspiration:** [Link to external references or describe the vibe here]
- *(Note: You can drop images directly into our chat, or place them in an `assets/` folder in this workspace and link them here like `![My Design](./assets/design.png)`)*
- **Color Palette:** 
  - Primary: Orange (Ceria, Playful, Energi).
  - Accent: Warm Yellow / Cream (Gurih, Hangat, Konsistensi bumbu).
- **Typography:** Body: Clean Sans-Serif (untuk keterbacaan tinggi dan kesan modern).

## 📍 Current Progress (Status Saat Ini)
- **Landing Page Foundation:** Struktur HTML, styling CSS, dan base interaksi JS sudah dibuat dari awal (scratch).
- **Nearby Cabi Feature:** Telah menambahkan fitur lokasi Cabi terdekat, termasuk estimasi waktu pengambilan dan tombol CTA "Pre-order now".
- **End-to-End Demo Flow:** Mengembangkan alur pengalaman pengguna (UX) secara penuh:
  - Pemilihan dari 4 lokasi spesifik.
  - Informasi ketersediaan stok secara real-time.
  - Instruksi pengambilan pesanan (pickup guidance).
  - Proses checkout "Click and Collect" yang menghasilkan link WhatsApp pre-filled untuk admin.
- **Location-Based Selection Screen:** Menjadikan pemilihan lokasi sebagai halaman depan (Welcome Overlay) dengan deskripsi detail seperti petunjuk pickup khusus per lokasi.
- **Menu Detail Pop-ups:** Menambahkan popup detail untuk menu, berisi komposisi dan cara memasak.
- **Location-Specific WhatsApp:** Menggunakan nomor WhatsApp berbeda berdasarkan lokasi pembelian yang dipilih.
- **Pickup Time Field:** Menambahkan input waktu pengambilan (pickup time) saat proses checkout.
- **Admin Panel:** Telah membuat halaman admin (`admin.html`) untuk melihat transaksi, pendapatan, dan pengelolaan stok.
- **Supabase Integration:** Seluruh data menu, lokasi, stok, dan transaksi sekarang terhubung ke Supabase secara real-time.
- **Admin Menu CRUD:** Admin sekarang dapat menambahkan, mengedit, dan menghapus menu, termasuk fitur upload foto langsung ke Supabase Storage.
- **Enhanced Location UI:** Menambahkan simbol pin lokasi bergaya Google Maps untuk memperjelas identitas titik pickup di halaman depan.
- **Komposisi & Pop-up Menu:** Detail komposisi dan cara memasak sudah tersedia di pop-up menu.
- **Supabase Integration & RLS:** Menggunakan Supabase untuk tabel `locations`, `menus`, `location_stocks`, dan `transactions`. *PENTING*: RLS (Row Level Security) dimatikan sementara untuk kemudahan development. Bucket `menu-images` dibuat public dengan SQL policy khusus untuk upload.
- **Landing Page Promosi:** Landing page selesai dibuat dan diset sebagai `index.html` (halaman utama). Aplikasi utama dipindahkan ke `app.html`.

## 🚀 Next Steps (Langkah Selanjutnya)
- **Integrasi Payment Gateway:** (Rencana Masa Depan) Mengotomatisasi pembayaran menggunakan QRIS via Midtrans/Xendit.
- **Autentikasi User:** (Rencana Masa Depan) Sistem login pelanggan untuk menyimpan riwayat pesanan (Supabase Auth).
- **Upload ke Hosting Permanen:** Push ke GitHub dan deploy ke Netlify / Vercel dengan *build* otomatis.

## ❓ Questions & Ideas (Pertanyaan & Ide)
*(Kamu bisa menuliskan pertanyaan, ide fitur baru, atau hal-hal yang ingin didiskusikan di sini)*
- **Isu Fake Order (Troll):** Karena tanpa login, user bisa asal klik checkout dan ngurangin stok tanpa bayar. Solusi yang akan diimplementasikan besok: **Stok baru berkurang kalau Admin udah konfirmasi pesanan/pembayaran**, BUKAN pas user klik checkout.
- Ada saran lain untuk pembayaran yang aman dan praktis? (Baru Nanya okey, belom implementasi) 