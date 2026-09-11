/**
 * ============================================================================
 * AUDIO SYSTEM - MUSIC & SOUND EFFECTS
 * Dual Mode: Web Audio API Generative Synth + Custom MP3/WAV Support
 * Target volume: 15-25%, smooth crossfades, mute/unmute control
 * ============================================================================
 */

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.currentMood = null;
    this.synthLoopInterval = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.targetVolume = (window.BIRTHDAY_CONFIG && window.BIRTHDAY_CONFIG.audio && window.BIRTHDAY_CONFIG.audio.defaultVolume) || 0.39;
    this.currentAudioElement = null;
    this.currentAudioSrc = null;
    this.currentPortion = null;

    // Musical scale frequencies for generative synthesizer (Pentatonic Major / Lydian)
    this.chords = {
      waiting: [
        [261.63, 329.63, 392.00, 523.25], // C Major 7 (Dreamy music-box anticipation)
        [174.61, 220.00, 261.63, 349.23], // F Major 7 (Warm, sweet lullaby)
        [220.00, 261.63, 329.63, 440.00], // A Minor (Tender nostalgia)
        [196.00, 246.94, 293.66, 392.00]  // G Major (Sparkling birthday melody)
      ],
      page1: [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [220.00, 261.63, 329.63, 440.00], // A Minor
        [174.61, 220.00, 261.63, 349.23], // F Major
        [196.00, 246.94, 293.66, 392.00]  // G Major
      ],
      pinata: [
        [329.63, 392.00, 493.88, 659.25], // E Minor
        [293.66, 369.99, 440.00, 587.33], // D Major
        [261.63, 329.63, 392.00, 523.25], // C Major
        [392.00, 493.88, 587.33, 783.99]  // G Major
      ],
      reveal: [
        [523.25, 659.25, 783.99, 1046.50], // High C
        [587.33, 739.99, 880.00, 1174.66]  // High D
      ],
      envelope: [
        [220.00, 261.63, 329.63, 440.00], // A Minor
        [174.61, 220.00, 261.63, 349.23], // F Major
        [261.63, 329.63, 392.00, 523.25], // C Major
        [196.00, 246.94, 293.66, 392.00]  // G Major
      ],
      gate: [
        [392.00, 493.88, 587.33, 739.99], // G Maj 7 (Grand, celestial)
        [329.63, 415.30, 493.88, 659.25], // E Maj (Warm, wondrous)
        [349.23, 440.00, 523.25, 659.25]  // F Maj 7
      ],
      final: [
        [196.00, 246.94, 293.66, 392.00, 587.33], // G Major 9
        [164.81, 220.00, 261.63, 329.63, 493.88], // E Minor 9
        [174.61, 220.00, 261.63, 349.23, 523.25]  // F Maj 7
      ]
    };
  }

  // Initialize Web Audio Context upon first user interaction
  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.targetVolume = (window.BIRTHDAY_CONFIG && window.BIRTHDAY_CONFIG.audio && window.BIRTHDAY_CONFIG.audio.defaultVolume) || 0.39;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.targetVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Separate Music & SFX Gain Nodes
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.targetVolume;
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.muted = this.isMuted;
    }
    return this.isMuted;
  }

  // Map any scene mood to its corresponding 4-portion soundtrack category
  getMoodPortion(mood) {
    if (!mood) return 'opening';
    // 1. Opening music: lets begin through page1 & exit until pinata game appears
    if (mood === 'waiting' || mood === 'page1' || mood === 'exit' || mood === 'opening') {
      return 'opening';
    }
    // 2. Piñata game soundtrack: separate track throughout entire pinata scene
    if (mood === 'pinata' || mood === 'reveal') {
      return 'pinata';
    }
    // 3. The Letter soundtrack: page2 envelope & letter reading
    if (mood === 'page2' || mood === 'envelope' || mood === 'letter') {
      return 'letter';
    }
    // 4. Gate, Gallery & Cake scene: ALL THREE share the exact same sound track
    if (mood === 'gate' || mood === 'gallery' || mood === 'final') {
      return 'final';
    }
    return mood;
  }

  // Play waiting music on the first page / loading screen
  playWaitingMusic() {
    this.init();
    if (this.ctx && this.ctx.state === 'running') {
      this.playMood('waiting');
    } else {
      // Browser Autoplay Policy compliance: attempt play immediately and attach gentle gesture listener
      const resumeOnGesture = () => {
        this.init();
        this.resume();
        if (!this.currentMood || this.currentMood === 'waiting') {
          this.playMood('waiting');
        }
        window.removeEventListener('pointerdown', resumeOnGesture);
        window.removeEventListener('touchstart', resumeOnGesture);
        window.removeEventListener('keydown', resumeOnGesture);
        window.removeEventListener('mousemove', resumeOnGesture);
      };
      window.addEventListener('pointerdown', resumeOnGesture, { passive: true });
      window.addEventListener('touchstart', resumeOnGesture, { passive: true });
      window.addEventListener('keydown', resumeOnGesture, { passive: true });
      window.addEventListener('mousemove', resumeOnGesture, { passive: true });
      this.playMood('waiting');
    }
  }

  // Crossfade music to a new mood with strict portion continuity
  playMood(mood) {
    const portion = this.getMoodPortion(mood);

    // Continuity guard: if this exact portion is already actively playing, DO NOT restart or interrupt!
    if (this.currentPortion === portion && this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentMood = mood;
      return;
    }

    this.currentPortion = portion;
    this.currentMood = mood;

    // Retrieve portion track from configuration
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.audio : null;
    let externalSrc = null;
    if (cfg) {
      if (portion === 'opening') externalSrc = cfg.openingMusic;
      else if (portion === 'pinata') externalSrc = cfg.pinataMusic;
      else if (portion === 'letter') externalSrc = cfg.letterMusic || cfg.letterGalleryMusic;
      else if (portion === 'final') externalSrc = cfg.finalMusic;
    }

    if (externalSrc && externalSrc.trim() !== '') {
      this._playExternalAudio(externalSrc, portion, mood);
    } else {
      this._startProceduralMusic(mood);
    }
  }

  _playExternalAudio(src, portion, mood) {
    // If the exact same audio file is already active and playing, keep it playing
    if (this.currentAudioElement && this.currentAudioSrc === src && !this.currentAudioElement.paused) {
      return;
    }

    this._stopProceduralMusic();

    if (this.currentAudioElement) {
      // Fade out previous audio element smoothly
      const old = this.currentAudioElement;
      let vol = old.volume;
      const fadeInterval = setInterval(() => {
        vol -= 0.04;
        if (vol <= 0) {
          clearInterval(fadeInterval);
          old.pause();
        } else {
          old.volume = Math.max(0, vol);
        }
      }, 40);
    }

    // Reuse pre-buffered opening audio element from preloader if available
    let audio = null;
    if (portion === 'opening' && window.preloadedOpeningAudio) {
      audio = window.preloadedOpeningAudio;
    } else {
      audio = new Audio(src);
    }

    audio.loop = true;
    audio.volume = 0;
    audio.muted = this.isMuted;
    this.currentAudioSrc = src;
    this.currentAudioElement = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Fade in new audio up to target volume (0.39)
        let vol = 0;
        const target = this.targetVolume || 0.39;
        const fadeIn = setInterval(() => {
          vol += 0.02;
          if (vol >= target) {
            clearInterval(fadeIn);
            audio.volume = target;
          } else {
            audio.volume = vol;
          }
        }, 40);
      }).catch(e => {
        console.log("Audio play blocked or file not found, falling back to procedural synth", e);
        this._startProceduralMusic(mood || 'page1');
      });
    }

    // Resilience fallback if external file is missing
    audio.addEventListener('error', () => {
      console.log("External audio track not found at: " + src + ". Playing dreamy generative synth.");
      this._startProceduralMusic(mood || 'envelope');
    }, { once: true });
  }

  _stopProceduralMusic() {
    if (this.synthLoopInterval) {
      clearInterval(this.synthLoopInterval);
      this.synthLoopInterval = null;
    }
  }

  // Lush generative ambient kalimba & soft piano synthesis
  _startProceduralMusic(mood) {
    this._stopProceduralMusic();
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const chordProg = this.chords[mood] || this.chords.page1;
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.ctx) return;
      const chord = chordProg[chordIdx % chordProg.length];
      chordIdx++;

      if (mood === 'waiting') {
        // Ethereal music-box bell chime arpeggios while waiting on the loading screen
        chord.forEach((freq, i) => {
          this._playPluck(freq * 1.5, 0.05, 1.8 + i * 0.3, 'sine', 0.03 * i);
        });
        for (let j = 0; j < 4; j++) {
          setTimeout(() => {
            const note = chord[Math.floor(Math.random() * chord.length)] * 2;
            this._playPluck(note, 0.04, 1.3, 'sine', 0);
          }, 450 * (j + 1));
        }
      } else {
        // Play soft pad chord
        chord.forEach((freq, i) => {
          this._playPluck(freq, 0.08, 2.5 + i * 0.4, (i % 2 === 0 ? 'sine' : 'triangle'), 0.02 * i);
        });

        // Play gentle arpeggio notes
        for (let j = 0; j < 3; j++) {
          setTimeout(() => {
            const note = chord[Math.floor(Math.random() * chord.length)] * 2;
            this._playPluck(note, 0.06, 1.2, 'sine', 0);
          }, 600 * (j + 1));
        }
      }
    };

    playChordStep();
    const intervalMs = mood === 'waiting' ? 2800 : (mood === 'pinata' ? 2400 : 3600);
    this.synthLoopInterval = setInterval(playChordStep, intervalMs);
  }

  _playPluck(freq, gainVal, duration, type = 'sine', delay = 0) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration + 0.1);
    } catch (e) {}
  }

  // ==========================================
  // PLAYFUL SOUND EFFECTS (Spec 8, 12, 13, 20, 23)
  // ==========================================
  
  // Comic "BAM!"
  playBam() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch (e) {}
  }

  // Bat swing whoosh
  playWhoosh() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.31);
    } catch (e) {}
  }

  // Piñata Hits 1..4 (Thump, Bam, Whack, Crack)
  playHit(hitIndex) {
    if (!this.ctx || this.isMuted) return;
    try {
      const pitches = [120, 180, 240, 360];
      const pitch = pitches[Math.min(hitIndex - 1, pitches.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = hitIndex === 4 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);

      // Extra burst chimes on breaking hit
      if (hitIndex >= 4) {
        this.playConfettiPop();
      }
    } catch (e) {}
  }

  // Shooting star sparkle chime
  playShootingStar() {
    if (!this.ctx || this.isMuted) return;
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this._playPluck(freq, 0.1, 0.8, 'sine', 0);
      }, idx * 100);
    });
  }

  // Confetti pop & secret discovery
  playConfettiPop() {
    if (!this.ctx || this.isMuted) return;
    const chords = [523.25, 659.25, 783.99, 1046.50];
    chords.forEach((freq, i) => {
      setTimeout(() => {
        this._playPluck(freq, 0.12, 1.4, 'sine', 0);
      }, i * 60);
    });
  }

  // Candle blow gentle breath & starlight ignite
  playCandleBlow() {
    if (!this.ctx || this.isMuted) return;
    try {
      // Soft gentle breath (filtered noise/sine)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.52);

      // Followed by twinkling starlight chimes
      setTimeout(() => {
        const starNotes = [783.99, 987.77, 1174.66, 1567.98, 1975.53];
        starNotes.forEach((freq, i) => {
          setTimeout(() => {
            this._playPluck(freq, 0.08, 1.8, 'sine', 0);
          }, i * 120);
        });
      }, 500);
    } catch (e) {}
  }
}

window.birthdayAudio = new AudioSystem();
