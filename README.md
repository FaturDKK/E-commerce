# 🏍️ FathurProject - Motorcycle Spare Parts Marketplace

> **Modern 2026 Motorcycle Spare Parts Marketplace** untuk Gen Z dan pecinta motor.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.18.x-lightgrey)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Folder](#-struktur-folder)
- [Instalasi](#-instalasi)
- [Menjalankan Server](#-menjalankan-server)
- [API Endpoints](#-api-endpoints)
- [Default Account](#-default-account)
- [Screenshots](#-screenshots)
- [Migrasi ke MongoDB](#-migrasi-ke-mongodb)
- [Lisensi](#-lisensi)

---

## 🚀 Tentang Proyek

**FathurProject** adalah marketplace spare part motor modern dengan desain premium terinspirasi dari Apple, Tesla, Nike, Shopee, Tokopedia, Stripe, dan Vercel Dashboard.

Dibangun untuk memenuhi kebutuhan **Gen Z dan young motorcycle enthusiasts** yang mencari spare part motor berkualitas dengan pengalaman belanja yang sleek dan modern.

### 🎨 Design System

| Elemen | Value |
|--------|-------|
| Background | `#09090B` |
| Card | `#18181B` |
| Primary | `#3B82F6` (Blue) |
| Accent | `#F97316` (Orange) |
| Font | Poppins |
| Effects | Glassmorphism, Neon Glow, Gradient |

---

## ✨ Fitur Utama

### 🏠 Landing Page
- ✅ Sticky Navbar dengan efek glass
- ✅ Hero Section dengan animasi
- ✅ Kategori produk
- ✅ Flash Sale dengan timer
- ✅ Produk terpopuler
- ✅ Testimonial
- ✅ Newsletter subscription
- ✅ Footer lengkap

### 🛍️ Halaman Produk
- ✅ 150+ produk realistis
- ✅ Pencarian real-time
- ✅ Filter (kategori, harga, rating, stok)
- ✅ Sorting (populer, terbaru, harga)
- ✅ Pagination
- ✅ Skeleton loading

### 📦 Detail Produk
- ✅ Gallery dengan zoom
- ✅ Rating & review
- ✅ Harga dengan diskon
- ✅ Spesifikasi produk
- ✅ Quantity selector
- ✅ Wishlist & Add to Cart
- ✅ Related products

### 🛒 Keranjang Belanja
- ✅ Tambah/update quantity
- ✅ Hapus item
- ✅ Auto total
- ✅ Ongkos kirim
- ✅ Grand total
- ✅ Save ke localStorage

### ❤️ Wishlist
- ✅ Toggle heart button
- ✅ Simpan produk favorit
- ✅ Pindah ke keranjang
- ✅ Hapus dari wishlist

### 💳 Checkout
- ✅ Form pelanggan
- ✅ Alamat pengiriman
- ✅ Pilihan kurir
- ✅ Metode pembayaran
- ✅ Order summary
- ✅ Invoice & success page

### 🔐 Autentikasi
- ✅ Login
- ✅ Register
- ✅ Logout
- ✅ JWT Token
- ✅ Proteksi route

### 👤 User Profile
- ✅ Edit profil
- ✅ Ubah password
- ✅ Riwayat pesanan

### 🛠️ Admin Dashboard
- ✅ Statistik (produk, pesanan, user, revenue)
- ✅ CRUD Produk
- ✅ CRUD Kategori
- ✅ Manajemen Pesanan
- ✅ Manajemen User

---

## 🛠️ Tech Stack

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 18.x | Runtime JavaScript |
| Express.js | 4.18.x | Web Framework |
| bcryptjs | 2.4.x | Password Hashing |
| jsonwebtoken | 9.0.x | JWT Authentication |
| multer | 1.4.x | File Upload |
| uuid | 8.3.x | Generate Unique ID |
| cors | 2.8.x | CORS Middleware |
| dotenv | 16.0.x | Environment Variables |

### Frontend
| Teknologi | Fungsi |
|-----------|--------|
| HTML5 | Struktur Halaman |
| CSS3 | Styling & Animasi |
| Vanilla JS (ES6) | Interaktivitas |
| Font Awesome 6 | Icon Library |
| Google Fonts | Poppins Font |

### Database
| Teknologi | Fungsi |
|-----------|--------|
| JSON Files | Database Sementara |
| File System (fs) | Baca/Tulis File |

---


---

## 💻 Instalasi

### Prasyarat

- Node.js 16.x atau lebih tinggi
- npm atau yarn
- Termux (Android) atau terminal (Linux/Mac/Windows)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/yourusername/FathurProject.git
cd FathurProject

# 2. Install dependencies
npm install

# 3. Jalankan server
npm start
