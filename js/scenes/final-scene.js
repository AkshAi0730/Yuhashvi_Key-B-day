/**
 * ============================================================================
 * FINAL BIRTHDAY SCENE ENGINE (js/scenes/final-scene.js)
 * Master Photographic Crossfade & Realistic Candle Extinguish
 * - Layer 1: final_night_lit.jpg (Lit candles, night garden, table, cake, girl)
 * - Layer 2: final_night_stars.jpg (Extinguished, shooting stars, midnight)
 * - Breath stream -> Flame extinguishes -> Smoke wisp -> Smooth photo crossfade
 * - Final message card with [ADD FINAL MESSAGE] and "Keep smiling. ♡"
 * - "↻ Experience Again" resets all state cleanly back to Page 1
 * ============================================================================
 */

class FinalScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-final');
    this.litLayer = document.getElementById('final-photo-layer-lit');
    this.starsLayer = document.getElementById('final-photo-layer-stars');
    this.candleFlame1 = document.getElementById('candle-flame-left');
    this.candleFlame2 = document.getElementById('candle-flame-right');
    this.smokeWisps = document.getElementById('candle-smoke-wisps');
    this.btnBlow = document.getElementById('btn-one-last-thing');
    this.messageCard = document.getElementById('final-message-card');
    this.breathStream = document.getElementById('final-breath-stream');
    this.title1El = document.getElementById('final-title-1');
    this.title2El = document.getElementById('final-title-2');
    this.messageEl = document.getElementById('final-message');
    this.smilingTextEl = document.getElementById('final-smiling-text');
    this.btnExperienceAgain = document.getElementById('btn-experience-again');
    this.sceneJumpSelect = document.getElementById('scene-jump-select');

    this.isBlown = false;

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.finalScreen : null;
    if (cfg) {
      if (this.title1El) this.title1El.textContent = cfg.titleLine1;
      if (this.title2El) this.title2El.textContent = cfg.titleLine2;
      if (this.messageEl) this.messageEl.textContent = cfg.finalMessage;
      if (this.btnBlow) {
        this.btnBlow.innerHTML = `<span>✨</span> ${cfg.btnOneLastThing || 'Blow the Candles & Make a Wish'}`;
        this.btnBlow.addEventListener('click', () => this.executeCandleBlow());
      }
      if (this.smilingTextEl) {
        this.smilingTextEl.textContent = cfg.keepSmilingText || 'Keep smiling. ♡';
      }
      if (this.btnExperienceAgain) {
        const replayText = (cfg.btnExperienceAgain || 'Experience Again').replace(/^[↻\s]+/, '');
        this.btnExperienceAgain.innerHTML = `<span>↻</span> ${replayText}`;
        this.btnExperienceAgain.addEventListener('click', () => {
          this.app.resetAllAndGoToOpening();
        });
      }
    }

    // Scene Jump Dropdown
    if (this.sceneJumpSelect) {
      this.sceneJumpSelect.addEventListener('change', (e) => {
        const targetScene = e.target.value;
        if (targetScene) {
          this.app.jumpToSceneFromFinal(targetScene);
          this.sceneJumpSelect.selectedIndex = 0;
        }
      });
    }
  }

  restoreFinalState() {
    this.isBlown = true;
    if (this.btnBlow) this.btnBlow.style.display = 'none';
    if (this.candleFlame1) this.candleFlame1.classList.add('extinguished');
    if (this.candleFlame2) this.candleFlame2.classList.add('extinguished');
    if (this.smokeWisps) this.smokeWisps.classList.remove('active');
    if (this.starsLayer) this.starsLayer.style.opacity = '1';
    if (this.messageCard) {
      this.messageCard.style.display = 'block';
      this.messageCard.style.opacity = '1';
      this.messageCard.style.transition = 'none';
    }
  }

  enter() {
    this.resetScene();
    this.sceneActive = true;
    if (this.app && this.app.audio) {
      this.app.audio.playMood('final');
    }
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
  }

  leave() {
    this.sceneActive = false;
  }

  resetScene() {
    this.isBlown = false;
    if (this.breathStream) {
      this.breathStream.classList.remove('active');
    }
    if (this.starsLayer) {
      this.starsLayer.style.opacity = '0';
    }
    if (this.candleFlame1) {
      this.candleFlame1.classList.remove('extinguished');
    }
    if (this.candleFlame2) {
      this.candleFlame2.classList.remove('extinguished');
    }
    if (this.smokeWisps) {
      this.smokeWisps.classList.remove('active');
    }
    if (this.btnBlow) {
      this.btnBlow.style.display = 'inline-flex';
      this.btnBlow.style.opacity = '1';
    }
    if (this.messageCard) {
      this.messageCard.style.display = 'none';
      this.messageCard.style.opacity = '0';
    }
  }

  executeCandleBlow() {
    if (this.isBlown) return;
    this.isBlown = true;

    // 1. Fade out prompt button
    if (this.btnBlow) {
      this.btnBlow.style.transition = 'opacity 0.4s ease';
      this.btnBlow.style.opacity = '0';
      setTimeout(() => {
        if (!this.sceneActive) return;
        this.btnBlow.style.display = 'none';
      }, 400);
    }

    // 2. Play gentle breath / blow sound & emit breath stream
    this.app.audio.playCandleBlow();
    if (this.breathStream) {
      this.breathStream.classList.add('active');
      setTimeout(() => {
        if (!this.sceneActive) return;
        if (this.breathStream) this.breathStream.classList.remove('active');
      }, 800);
    }

    // 3. Extinguish candle flames & rise smoke curls
    setTimeout(() => {
      if (!this.sceneActive) return;
      if (this.candleFlame1) this.candleFlame1.classList.add('extinguished');
      if (this.candleFlame2) this.candleFlame2.classList.add('extinguished');
      if (this.smokeWisps) this.smokeWisps.classList.add('active');

      // 4. Smoothly crossfade from lit night scene to starry celestial midnight sky
      setTimeout(() => {
        if (!this.sceneActive) return;
        if (this.starsLayer) {
          this.starsLayer.style.opacity = '1';
        }

        // 5. Reveal celebratory message card with [ADD FINAL MESSAGE], "Keep smiling. ♡", and replay button
        setTimeout(() => {
          if (!this.sceneActive) return;
          if (this.messageCard) {
            this.messageCard.style.display = 'block';
            this.messageCard.style.opacity = '0';
            void this.messageCard.offsetWidth;
            this.messageCard.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
            this.messageCard.style.opacity = '1';
          }
        }, 1400);
      }, 350);
    }, 450);
  }
}

window.FinalScene = FinalScene;
