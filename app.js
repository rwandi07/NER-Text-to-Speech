const synth = window.speechSynthesis;
const textEl = document.getElementById('text');
const voiceEl = document.getElementById('voice');
const langEl = document.getElementById('lang');
const rateEl = document.getElementById('rate');
const pitchEl = document.getElementById('pitch');
const rateVal = document.getElementById('rateVal');
const pitchVal = document.getElementById('pitchVal');
const statusEl = document.getElementById('status');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const mp3Btn = document.getElementById('mp3Btn');
const aiBtn = document.getElementById('aiBtn');
const preview = document.getElementById('preview');
const aiBox = document.getElementById('aiBox');
const aiToggle = document.getElementById('aiToggle');
const apiKeyEl = document.getElementById('apiKey');
const aiModelEl = document.getElementById('aiModel');
const aiVoiceEl = document.getElementById('aiVoice');
const aiStyleEl = document.getElementById('aiStyle');
const MP3_API = 'https://tts-api.netlify.app/';
const CHUNK = 180;
const LS_KEY = 'ner_tts_gemini_key';
const LS_ON = 'ner_tts_ai_on';
let voices = [];
function setStatus(msg) { statusEl.textContent = msg; }
apiKeyEl.value = localStorage.getItem(LS_KEY) || '';
if (localStorage.getItem(LS_ON) === '1') { aiToggle.checked = true; aiBox.classList.add('on'); }
aiToggle.addEventListener('change', function () { aiBox.classList.toggle('on', aiToggle.checked); localStorage.setItem(LS_ON, aiToggle.checked ? '1' : '0'); });
apiKeyEl.addEventListener('change', function () { localStorage.setItem(LS_KEY, apiKeyEl.value.trim()); });
function populateVoices() {
  voices = synth.getVoices();
  voiceEl.innerHTML = '';
  if (!voices.length) { const opt = document.createElement('option'); opt.textContent = 'Memuat daftar suara...'; voiceEl.appendChild(opt); return; }
  const sorted = voices.slice().sort(function (a, b) {
    const aId = (a.lang || '').toLowerCase().indexOf('id') === 0 ? 0 : 1;
    const bId = (b.lang || '').toLowerCase().indexOf('id') === 0 ? 0 : 1;
    if (aId !== bId) return aId - bId;
    return a.name.localeCompare(b.name);
  });
  sorted.forEach(function (v) {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name + ' (' + (v.lang || 'n/a') + ')';
    voiceEl.appendChild(opt);
  });
}
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = populateVoices;
rateEl.addEventListener('input', function () { rateVal.textContent = Number(rateEl.value).toFixed(1) + 'x'; });
pitchEl.addEventListener('input', function () { pitchVal.textContent = Number(pitchEl.value).toFixed(1); });
function updateButtons(state) {
  speakBtn.disabled = state === 'speaking';
  pauseBtn.disabled = state !== 'speaking';
  resumeBtn.disabled = state !== 'paused';
  stopBtn.disabled = state === 'idle';
}
speakBtn.addEventListener('click', function () {
  const text = textEl.value.trim();
  if (!text) { setStatus('Masukkan teks dulu.'); return; }
  if (!('speechSynthesis' in window)) { setStatus('Browser tidak mendukung Web Speech API.'); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const match = voices.find(function (v) { return v.name === voiceEl.value; });
  if (match) u.voice = match;
  if (langEl.value) u.lang = langEl.value;
  u.rate = Number(rateEl.value);
  u.pitch = Number(pitchEl.value);
  u.onstart = function () { setStatus('Sedang berbicara...'); updateButtons('speaking'); };
  u.onend = function () { setStatus('Selesai.'); updateButtons('idle'); };
  u.onerror = function (e) { setStatus('Error: ' + (e.error || 'gagal')); updateButtons('idle'); };
  u.onpause = function () { updateButtons('paused'); };
  u.onresume = function () { setStatus('Melanjutkan...'); updateButtons('speaking'); };
  synth.speak(u);
});
pauseBtn.addEventListener('click', function () { if (synth.speaking && !synth.paused) { synth.pause(); setStatus('Dijeda.'); updateButtons('paused'); } });
resumeBtn.addEventListener('click', function () { if (synth.paused) synth.resume(); });
stopBtn.addEventListener('click', function () { synth.cancel(); setStatus('Dihentikan.'); updateButtons('idle'); });
updateButtons('idle');
function mp3Lang() {
  const v = langEl.value || 'id-ID';
  if (v.indexOf('id') === 0) return 'id';
  if (v.indexOf('ms') === 0) return 'ms';
  if (v.indexOf('jv') === 0) return 'jw';
  if (v.indexOf('en-GB') === 0) return 'en-uk';
  if (v.indexOf('en') === 0) return 'en';
  return v.split('-')[0] || 'id';
}
function splitChunks(text, maxLen) {
  const parts = [];
  let remain = text.replace(/\s+/g, ' ').trim();
  while (remain.length > maxLen) {
    let cut = remain.lastIndexOf(' ', maxLen);
    if (cut < maxLen * 0.5) cut = maxLen;
    parts.push(remain.slice(0, cut).trim());
    remain = remain.slice(cut).trim();
  }
  if (remain) parts.push(remain);
  return parts;
}
function concatBytes(buffers) {
  var total = 0, i;
  for (i = 0; i < buffers.length; i++) total += buffers[i].byteLength;
  var out = new Uint8Array(total);
  var offset = 0;
  for (i = 0; i < buffers.length; i++) { out.set(new Uint8Array(buffers[i]), offset); offset += buffers[i].byteLength; }
  return out;
}
function stamp(ext) {
  var d = new Date();
  function p(n) { return String(n).padStart(2, '0'); }
  return 'ner-tts-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + ext;
}
function playAndDownload(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  preview.src = url; preview.classList.add('show');
}
mp3Btn.addEventListener('click', async function () {
  var text = textEl.value.trim();
  if (!text) { setStatus('Masukkan teks dulu.'); return; }
  mp3Btn.disabled = true;
  try {
    var chunks = splitChunks(text, CHUNK);
    var buffers = [];
    for (var i = 0; i < chunks.length; i++) {
      setStatus('Mengunduh MP3 bagian ' + (i + 1) + ' / ' + chunks.length + '...');
      var params = new URLSearchParams({ text: chunks[i], lang: mp3Lang(), speed: String(rateEl.value) });
      var res = await fetch(MP3_API + '?' + params.toString());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      buffers.push(await res.arrayBuffer());
    }
    var blob = new Blob([concatBytes(buffers)], { type: 'audio/mpeg' });
    var name = stamp('.mp3');
    playAndDownload(blob, name);
    setStatus('MP3 tersimpan: ' + name + ' (' + Math.round(blob.size / 1024) + ' KB).');
  } catch (err) {
    setStatus('Gagal MP3. Cek internet. ' + (err && err.message ? err.message : ''));
  } finally { mp3Btn.disabled = false; }
});
function stylePrompt(text) {
  var langName = 'Indonesian';
  var lv = langEl.value || 'id-ID';
  if (lv.indexOf('en-GB') === 0) langName = 'British English';
  else if (lv.indexOf('en') === 0) langName = 'American English';
  else if (lv.indexOf('ms') === 0) langName = 'Malay';
  else if (lv.indexOf('jv') === 0) langName = 'Javanese';
  var styles = {
    natural: 'Speak naturally, like a warm human narrator. Use realistic intonation, gentle pauses, and conversational rhythm. Do not sound robotic.',
    cheerful: 'Speak cheerfully and brightly, with a friendly smile in the voice.',
    calm: 'Speak calmly, slowly, and softly, like a relaxing storyteller.',
    formal: 'Speak formally and clearly, like a professional news presenter.',
    warm: 'Speak warmly and kindly, as if talking to a close friend.',
    whisper: 'Speak in a soft intimate whisper, still clear enough to understand.'
  };
  var style = styles[aiStyleEl.value] || styles.natural;
  return 'TTS the transcript only. Do not add extra words or announce the instructions.\nLanguage: ' + langName + '.\nDirection: ' + style + '\n\nTranscript:\n' + text;
}
function b64ToBytes(b64) {
  var bin = atob(b64);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pcmToWav(pcm, sampleRate) {
  var numChannels = 1, bits = 16;
  var blockAlign = numChannels * (bits / 8);
  var byteRate = sampleRate * blockAlign;
  var dataSize = pcm.byteLength;
  var buf = new ArrayBuffer(44 + dataSize);
  var view = new DataView(buf);
  function str(offset, s) { for (var i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); }
  str(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, bits, true);
  str(36, 'data'); view.setUint32(40, dataSize, true);
  new Uint8Array(buf, 44).set(new Uint8Array(pcm));
  return buf;
}
function parseSampleRate(mime) {
  if (!mime) return 24000;
  var m = String(mime).match(/rate=(\d+)/i);
  return m ? Number(m[1]) : 24000;
}
async function geminiSpeak(model, key, prompt, voiceName) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
  var body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
    }
  };
  var res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  var json = await res.json();
  if (!res.ok) throw new Error((json.error && json.error.message) ? json.error.message : ('HTTP ' + res.status));
  var part = json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0];
  if (!part || !part.inlineData || !part.inlineData.data) throw new Error('API tidak mengembalikan audio. Coba model lain atau teks lebih pendek.');
  return { bytes: b64ToBytes(part.inlineData.data), mime: part.inlineData.mimeType || 'audio/pcm' };
}
aiBtn.addEventListener('click', async function () {
  var text = textEl.value.trim();
  var key = apiKeyEl.value.trim();
  if (!text) { setStatus('Masukkan teks dulu.'); return; }
  if (!key) { aiToggle.checked = true; aiBox.classList.add('on'); setStatus('Isi Gemini API key dulu, lalu Generate AI lagi.'); apiKeyEl.focus(); return; }
  localStorage.setItem(LS_KEY, key);
  aiBtn.disabled = true; mp3Btn.disabled = true;
  var models = [aiModelEl.value];
  if (models[0] !== 'gemini-2.5-flash-preview-tts') models.push('gemini-2.5-flash-preview-tts');
  try {
    var chunks = splitChunks(text, 2200);
    var wavParts = [];
    var rate = 24000, lastErr;
    for (var c = 0; c < chunks.length; c++) {
      setStatus('Gemini AI bagian ' + (c + 1) + ' / ' + chunks.length + '...');
      var prompt = stylePrompt(chunks[c]);
      var ok = false;
      for (var m = 0; m < models.length; m++) {
        try {
          var audio = await geminiSpeak(models[m], key, prompt, aiVoiceEl.value);
          rate = parseSampleRate(audio.mime);
          wavParts.push(audio.bytes);
          ok = true; break;
        } catch (e) { lastErr = e; }
      }
      if (!ok) throw lastErr || new Error('Semua model gagal.');
    }
    var pcm = concatBytes(wavParts);
    var wav = pcmToWav(pcm, rate);
    var blob = new Blob([wav], { type: 'audio/wav' });
    var name = stamp('.wav');
    playAndDownload(blob, name);
    setStatus('AI selesai. File: ' + name + ' (' + Math.round(blob.size / 1024) + ' KB).');
  } catch (err) {
    setStatus('Gagal Gemini AI: ' + (err && err.message ? err.message : 'unknown'));
  } finally { aiBtn.disabled = false; mp3Btn.disabled = false; }
});
