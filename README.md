# BogorCam Dashboard

Dashboard CCTV publik bergaya dark map: daftar kamera di sisi kiri, filter, peta interaktif, dan panel detail mengambang.

## Menjalankan

```bash
npm install
npm run dev
```

Buka URL lokal yang diberikan Vite (biasanya `http://localhost:5173`).

## Build produksi

```bash
npm run build
npm run preview
```

## Struktur

```text
bogorcam-dashboard/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── data/
    │   └── cameras.js
    └── components/
        ├── CameraSidebar.jsx
        ├── CameraPlayer.jsx
        └── MapView.jsx
```

## Sumber CCTV resmi yang telah ditelusuri

Katalog berisi nama kamera yang ditemukan di portal BSW Kota Bogor dan tautan detail untuk beberapa halaman yang berhasil diverifikasi. Kabupaten Bogor diarahkan ke portal ATCS resmi. Data kamera ada di `src/data/cameras.js`. Setiap item mendukung:

- `name`, `area`, `location`, `source`, `sourceUrl`
- `latitude`, `longitude`
- `streamUrl` untuk HLS yang memang diizinkan untuk diakses publik
- `embedUrl` untuk embed resmi yang diizinkan
- `status`: `online`, `offline`, atau `unverified`

**Penting:** `streamUrl` dan `embedUrl` tidak diisi otomatis karena alamat stream harus diverifikasi dari portal resmi dan kebijakan aksesnya. Jangan memasukkan URL tebakan. Titik peta awal adalah titik area/landmark untuk demo UI, bukan klaim lokasi CCTV; ubah setelah lokasi kamera resmi terverifikasi.

Sumber resmi yang ditelusuri:
- Kota Bogor: https://bsw.kotabogor.go.id/cctv
- Kabupaten Bogor: https://itscctv-dishub.bogorkab.go.id/

Jika URL HLS gagal diputar, periksa dukungan format, CORS, autentikasi, dan ketentuan penggunaan dari pemilik stream.


## Stream CCTV ATCS Kabupaten Bogor

Kamera pertama yang dipilih saat aplikasi dibuka adalah ATCS PEMDA, menggunakan playlist HLS publik yang diberikan dan diperiksa oleh pengguna:

`https://itscctv-dishub.bogorkab.go.id/stream/PEMDA/index.m3u8`

Pemutaran menggunakan `hls.js` pada browser desktop, dan pemutar HLS native jika browser mendukungnya. Jika video tidak tampil, periksa Console/Network untuk memastikan playlist dan segmen `.ts` dapat diakses; status HTTP 200 pada playlist saja belum menjamin semua segmen dapat diputar.

Peta awal menampilkan area Bogor yang lebih luas dan mencakup 10 lokasi yang terlihat di portal ATCS: SENTUL, PEMDA, PDAM, CIBINONG, CIKARET, CIAWI, GADOG, KANTOR DISHUB, TAMAN SAFARI, dan BAPPENDA. Selain PEMDA, URL stream kamera lain belum dimasukkan karena belum diverifikasi. Koordinat marker hanya perkiraan kawasan.

### Kamera CCTV Nusantara — Simpang Denpom

Katalog kini mencakup `Simpang Denpom — Pintu Utama Istana` (`bogor-111`) sebagai titik perkiraan di Kota Bogor. Halaman sumber: https://www.cctvnusantara.com/?cam=bogor-111. Endpoint API yang diberikan menggunakan token `t` dinamis pada playlist dan setiap segmen, sehingga token DevTools tidak ditanam sebagai URL tetap. Untuk pemutaran langsung di BogorCam diperlukan endpoint/embed publik yang stabil atau integrasi resmi yang dapat memperbarui token secara sah.
