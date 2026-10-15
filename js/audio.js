// Authentic 8-bit Game Boy / Game Boy Color Chiptune Sound Synthesizer
// With master volume control, square waves, and LFSR noise buffer.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = localStorage.getItem('sokoban_muted') === 'true';
    const savedVol = localStorage.getItem('sokoban_volume');
    this.volume = savedVol !== null ? Math.max(0, Math.min(1, parseFloat(savedVol))) : 0.7;
    this.noiseBuffer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.createNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getAudioDestination() {
    this.init();
    return this.masterGain || this.ctx.destination;
  }

  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() > 0.4) {
        last = (Math.random() * 2 - 1);
      }
      data[i] = last * 0.35;
    }
    this.noiseBuffer = buffer;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('sokoban_volume', this.volume);
    if (this.ctx && this.masterGain) {
      const targetGain = this.muted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  changeVolume(delta) {
    let newVol = Math.round((this.volume + delta) * 10) / 10;
    newVol = Math.max(0, Math.min(1, newVol));
    this.setVolume(newVol);
    this.playBlip();
    return newVol;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sokoban_muted', this.muted);
    if (this.ctx && this.masterGain) {
      const targetGain = this.muted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Menu cursor blip
  playBlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.02);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 1. Move: 8-Bit Square wave blip (Game Boy step chirp)
  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(440, now + 0.02);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 2. Push: Crunchy 8-bit Noise + Low Pulse (Game Boy Boulder push sound)
  playPush() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(now);
    osc.stop(now + 0.1);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const nGain = this.ctx.createGain();
      noise.buffer = this.noiseBuffer;

      nGain.gain.setValueAtTime(0.14, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(nGain);
      nGain.connect(this.getAudioDestination());

      noise.start(now);
      noise.stop(now + 0.08);
    }
  }

  // 3. Target Hit: Bright GBC Item Get Chime (Staccato 8-bit arpeggio)
  playTarget() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [987.77, 1174.66, 1479.98, 1975.53];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + (idx * 0.045);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.getAudioDestination());

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // 4. Undo: 8-Bit descending pitch zap
  playUndo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 5. Jump Sound Effect for Ending Animation
  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 6. Level Victory: Classic GBC Victory Fanfare
  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 587.33, d: 0.10 }, // D5
      { f: 587.33, d: 0.10 }, // D5
      { f: 587.33, d: 0.10 }, // D5
      { f: 783.99, d: 0.30 }, // G5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 987.77, d: 0.45 }, // B5
    ];

    let t = now;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.getAudioDestination());

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.95;
    });
  }

  // 7. Grand Game Finale Fanfare (when beating the whole game)
  playGrandFinale() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.14 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.50, d: 0.28 }, // C6
      { f: 880.00, d: 0.14 }, // A5
      { f: 987.77, d: 0.14 }, // B5
      { f: 1046.50, d: 0.60 }  // C6 grand finish
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.getAudioDestination());

      osc.start(t);
      osc.stop(t + n.d);

      t += n.d * 0.92;
    });
  }

  // 8. System Reset: Quick dual-tone 8-bit reboot chirp
  playReset() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 659.25, d: 0.05 },
      { f: 440.00, d: 0.08 }
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
      osc.connect(gain);
      gain.connect(this.getAudioDestination());
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }
}

window.soundManager = new SoundManager();
