# HASIL PENILAIAN PROYEK SAJAKVISUAL

**Tanggal:** 9 Juli 2026
**Proyek:** SajakVisual - Digital Wedding Invitation Platform (Express.js + Supabase)

---

## 1. KEAMANAN SISTEM — Nilai: **25/100 (Sangat Kurang)**

### ❌ Kritis (Harus Segera Diperbaiki)

| #   | Masalah                                         | File                            | Dampak                                                                                                          |
| --- | ----------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | **Server-Side Template Injection (SSTI)**       | `invitation/controller.js:6-18` | Attacker bisa eksekusi kode server dengan memanipulasi parameter `slug`. Celah **RCE (Remote Code Execution)**. |
| 2   | **Service Role Key Supabase terekspos**         | `.env`                          | Key `service_role` (bukan anon key) memiliki akses admin penuh ke database, **melewati Row-Level Security**.    |
| 3   | **API Key KlikQris & Password Gmail terekspos** | `.env`                          | Akses ke payment gateway dan email akun pribadi.                                                                |
| 4   | **`.env` masuk tracking git**                   | Root                            | Semua rahasia sudah tercatat di history git — **tidak bisa dihapus hanya dengan remove file**.                  |
| 5   | **Callback payment tidak ada autentikasi**      | `checkout/routes.js`            | Siapa pun bisa POST ke `/payment/callback` dan memanipulasi status pembayaran.                                  |

### ⚠️ Tinggi

| #   | Masalah                                              | File                      | Dampak                                                                                 |
| --- | ---------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| 6   | **Validasi file upload tidak ada**                   | `helpers/save_photo.js`   | Tidak ada cek tipe file, ukuran, atau konten berbahaya.                                |
| 7   | **Middleware cek cookie saja, bukan validasi token** | `middleware/authGuard.js` | Siapa pun bisa set cookie `admin_token` palsu dan akses dashboard admin.               |
| 8   | **Typo-squatting dependencies**                      | `package.json`            | `expresss` (extra s) dan `cookieparser` (tanpa hyphen) — berpotensi malicious package. |
| 9   | **`upload.any()` tanpa batasan field**               | `form/routes.js`          | Menerima file dari field apa pun, termasuk field tidak terduga.                        |
| 10  | **Form edit tanpa autentikasi**                      | `form/controller.js`      | Siapa pun yang tahu nomor invoice bisa edit data undangan.                             |

### 📋 Ringkasan Keamanan

- **Rata-rata ancaman:** Kritikal (5), Tinggi (5), Sedang (5+)
- **Masalah utama:** Tidak ada autentikasi yang ketat, secret management buruk, validasi input minim, dan ada celah RCE.
- **Rekomendasi segera:** Rotasi semua API key & password, hapus `.env` dari git history (BFG Repo Cleaner), perbaiki SSTI di controller invitation.

---

## 2. SISTEM (ARSITEKTUR & KODE) — Nilai: **55/100 (Cukup)**

### ✅ Kelebihan

- **Struktur modular** yang cukup rapi (auth, checkout, form, invitation, payment, dll dipisah per-module).
- **Menggunakan EJS** server-side rendering untuk SEO-friendly pages.
- **Separation of concerns** lumayan: controller, service, routes dipisah.
- **Menggunakan Supabase** sebagai BaaS (Backend-as-a-Service) — mengurangi beban server sendiri.
- **Ada middleware pattern** untuk autentikasi.

### ❌ Kekurangan

| #   | Masalah                                        | Detail                                                                                                                                |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Duplikasi route yang tidak konsisten**       | `routes.js` meng-import `main-website/routes.js` sebanyak 3 kali dengan nama berbeda (apiRoutes, mainRoutes, transectionCheckRoutes). |
| 2   | **File service banyak yang kosong/minim**      | `auth/service.js` kosong. `src/config/` kosong padahal `structure.md` mereferensikan `src/config/supabase.js`.                        |
| 3   | **Naming convention tidak konsisten**          | `transectionCheck` (salah eja — harus `transactionCheck`), `GanerateToken`, file `send_email.js.js` (double extension).               |
| 4   | **Dead code & commented code**                 | Banyak `console.log` di production, baris dikomentari, variable tidak dipakai (`token` di auth controller).                           |
| 5   | **Dependency tidak terpakai**                  | `resend` di package.json tapi tidak digunakan (nodemailer yang dipakai). `bun` sebagai dependency npm — seharusnya runtime.           |
| 6   | **Hardcoded values**                           | Nama admin di dashboard (`Halo, Arif Suryana!`), nomor WhatsApp di email.                                                             |
| 7   | **Error handling tidak konsisten**             | Response error ada yang pakai `res.json(...)`, `res.status(500).json(...)`, ada yang empty catch block.                               |
| 8   | **Penggunaan `==` bukan `===`**                | Di beberapa tempat (checkout service line 187).                                                                                       |
| 9   | **Tidak ada type checking / validasi payload** | `JSON.parse(req.body.data_undangan)` langsung tanpa validasi.                                                                         |

---

## 3. PERFORMA — Nilai: **60/100 (Cukup)**

### ✅ Kelebihan

- **Supabase** sebagai backend mengurangi beban kalkulasi server.
- **EJS Server-Side Rendering** cukup cepat untuk page loads awal.
- Proyek masih skala kecil, sehingga bottleneck besar belum terasa.

### ❌ Kekurangan

| #   | Masalah                                     | Detail                                                                                            |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | **Tidak ada pagination untuk query orders** | `getAllOrders` select semua data tanpa limit — berbahaya jika ribuan order.                       |
| 2   | **Email transporter dibuat setiap kirim**   | `send_email.js.js` bikin Nodemailer transport baru tiap panggilan — overhead koneksi SMTP.        |
| 3   | **Tidak ada caching**                       | Tidak ada in-memory cache (Redis, Node-cache) untuk data undangan yang statis.                    |
| 4   | **File statis tanpa versioning hash**       | CSS/JS cache-buster pakai `Date.now()` — tidak efisien karena mencegah browser caching.           |
| 5   | **Inline CSS di email templates**           | 3 template email hampir identik dengan total ~1000 baris — duplikasi besar.                       |
| 6   | **Tidak ada rate limiting**                 | Endpoint publik tidak dilindungi dari brute force / abuse (login, callback payment, form submit). |
| 7   | **Bun.lock + package-lock.json**            | Dua file lock berbeda menandakan ada konflik dependency manager.                                  |

---

## 4. SKOR AKHIR

| Kategori            | Skor       | Grade            |
| ------------------- | ---------- | ---------------- |
| Keamanan Sistem     | **25/100** | ❌ Sangat Kurang |
| Sistem (Arsitektur) | **55/100** | ⚠️ Cukup         |
| Performa            | **60/100** | ⚠️ Cukup         |
| **Rata-rata**       | **47/100** | **❌ Kurang**    |

---

## 5. SARAN PERBAIKAN PRIORITAS

### 🔴 Segera (Critical — minggu ini)

1. **Perbaiki SSTI di invitation controller** --Done
   - Jangan pakai `req.params.slug` langsung di `res.render()`.
   - Gunakan whitelist template yang valid:
     ```js
     const validTemplates = ['rustic-elegant', 'traditional-royale', 'minimalist-clean'];
     if (!validTemplates.includes(slug)) return res.status(404).send('Not found');
     ```

2. **Rotasi semua secret & hapus dari git** --Done
   - Rotasi: Supabase service_role key, KlikQris API key, Gmail App Password.
   - Hapus `.env` dari history dengan **BFG Repo Cleaner** atau `git filter-branch`.
   - Tambahkan `.env` ke `.gitignore` (sudah ada tapi file tetap ke-track — perlu `git rm --cached .env`).

3. **Amankan payment callback**
   - Tambahkan secret API key di header request callback.
   - Validasi IP address asal request (dari KlikQris).
   - Gunakan cryptographic signature verification.

4. **Hapus dependency mencurigakan** --Done

   ```bash
   npm uninstall expresss cookieparser bun path resend
   ```

   - Ganti `expresss` → `express`, `cookieparser` → `cookie-parser`.

   ```

   ```

### 🟡 Penting (High — bulan ini)

6. **Validasi file upload**
   - Cek MIME type sebenarnya (bukan dari `file.mimetype`).
   - Batasi ukuran file (misal 5MB).
   - Gunakan whitelist extension: `['jpg', 'jpeg', 'png', 'webp']`.

7. **Tambahkan autentikasi di form edit**
   - Minimal require `checkSession` middleware.
   - Atau gunakan token berbasis invoice (dikirim ke email pemesan).

8. **Pagination untuk query database**
   - Gunakan `.range(start, end)` dari Supabase untuk semua query list.

9. **Konsistenkan error handling**
   - Buat global error handler middleware Express.
   - Hapus empty `catch` block.

10. **Rate limiting**
    - Gunakan `express-rate-limit` untuk endpoint login, callback payment, dan form submit.

### 🟢 Perbaikan Tambahan (Medium — per minggu)

11. **Refactor email templates** → 1 template base + parameter.
12. **Hapus semua `console.log`** dari production code.
13. **Perbaiki typo di variable/function names** → `transectionCheck` → `transactionCheck`, `Ganerate` → `Generate`.
14. **Gunakan environment variable untuk hardcoded values** (nama admin, nomor WA).
15. **Tambahkan input validation** dengan library seperti `Joi` atau `Zod`.
16. **Implementasi caching** untuk data undangan (Redis atau in-memory dengan TTL).
17. **Tambahkan security headers** (Helmet.js) di Express app.
18. **Perbaiki struktur route** — hindari import file yang sama berkali-kali.

---

## 6. KESIMPULAN

**SajakVisual** memiliki fondasi arsitektur yang cukup baik (modular, separation of concerns), tetapi memiliki **kelemahan keamanan yang sangat serius**. Celah SSTI, secret exposure, dan absennya autentikasi di beberapa endpoint membuat proyek ini **tidak aman untuk production**.

**Prioritas #1 adalah keamanan** — perbaiki celah kritis sebelum menambahkan fitur baru. Setelah itu, lakukan refactoring kode untuk konsistensi dan maintainability, serta optimasi performa dasar (pagination, caching, rate limiting).

---

_Laporan dibuat berdasarkan analisis kode statis. Beberapa kerentanan mungkin tidak terdeteksi tanpa pengujian dinamis (penetration testing)._
