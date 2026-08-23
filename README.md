# NER Text to Speech

Aplikasi text-to-speech berbasis **Web Speech API**. Buka `index.html` di browser — tidak perlu instal, server, atau API key.

## Cara pakai

1. Unduh `index.html` dari [Release terbaru](https://github.com/rwandi07/NER-Text-to-Speech/releases).
2. Buka file itu di Chrome, Edge, atau Firefox.
3. Ketik teks, pilih suara, atur kecepatan/nada, lalu tekan **Bicara**.

Atau clone repo ini:

```bash
git clone https://github.com/rwandi07/NER-Text-to-Speech.git
cd NER-Text-to-Speech
```

Lalu buka `index.html` di browser.

## Fitur

- Input teks bebas
- Pilih suara yang terpasang di perangkat
- Preferensi bahasa Indonesia (`id-ID`)
- Atur kecepatan dan pitch
- Bicara, jeda, lanjut, dan stop

## Batas teks

| Sumber | Batas |
| --- | --- |
| Spesifikasi Web Speech API | Maksimal **32.767 karakter** per ucapan |
| Chrome + suara Google (praktik) | Sering terpotong sekitar **200–300 karakter** atau ~15 detik |
| Suara lokal sistem (Windows/macOS) | Biasanya jauh lebih longgar |

## Browser

Paling lengkap di **Chrome** dan **Edge**. Daftar suara mengikuti sistem operasi.

## Lisensi

MIT
