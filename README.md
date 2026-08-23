# NER Text to Speech

Aplikasi text-to-speech dengan 3 mode:

1. **Bicara** — Web Speech API di browser (offline)
2. **Simpan MP3** — TTS daring sederhana
3. **Generate AI (WAV)** — Gemini TTS (suara lebih manusiawi)

## Mode AI Gemini

1. Buat API key di [Google AI Studio](https://aistudio.google.com/apikey)
2. Buka `index.html`
3. Aktifkan **Mode AI Gemini**
4. Tempel API key
5. Pilih model, suara, dan gaya
6. Tekan **Generate AI (WAV)**

Key hanya disimpan di localStorage browser, tidak dikirim ke repo.

Model default: `gemini-3.1-flash-tts-preview` (fallback `gemini-2.5-flash-preview-tts`).
Hasil AI berupa **WAV** karena Gemini mengirim PCM 24 kHz, bukan MP3.

## Unduh

[Release terbaru](https://github.com/rwandi07/NER-Text-to-Speech/releases)

## Lisensi

MIT
