/**
 * ============================================================================
 * FINAL BIRTHDAY SCENE ENGINE (js/scenes/final-scene.js)
 * - Same reference GirlCharacter beside birthday cake
 * - Cake with "21" and naturally flickering animated candle flame
 * - Sequence: "Happy Birthday", "Yuhashvi ♡", [ADD FINAL MESSAGE]
 * - "One Last Thing":
 *   1. Girl animates gentle blowing motion with breath stream
 *   2. Candle flame reacts, shrinks, and extinguishes with rising smoke
 *   3. Scene darkens momentarily
 *   4. Hundreds of starlight sparkles ignite across the night sky
 *   5. "Keep smiling. ♡"
 *   6. "↻ Experience Again" resets all state and returns to Page 1
 * ============================================================================
 */

class FinalScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-final');
    this.title1El = document.getElementById('final-title-1');
    this.title2El = document.getElementById('final-title-2');
    this.messageEl = document.getElementById('final-message');
    this.btnOneLastThing = document.getElementById('btn-one-last-thing');
    this.smilingTextEl = document.getElementById('final-smiling-text');
    this.btnExperienceAgain = document.getElementById('btn-experience-again');
    this.candleFlame = document.getElementById('cake-candle-flame');
    this.smokeWisp = document.getElementById('cake-smoke-wisp');

    // Instance of the same GirlCharacter for character consistency
    this.girl = new window.GirlCharacter('final-girl-wrap');

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.finalScreen : null;
    if (cfg) {
      if (this.title1El) this.title1El.textContent = cfg.titleLine1;
      if (this.title2El) this.title2El.textContent = cfg.titleLine2;
      if (this.messageEl) this.messageEl.textContent = cfg.finalMessage;
      if (this.btnOneLastThing) {
        this.btnOneLastThing.innerHTML = `<span>✨</span> ${cfg.btnOneLastThing}`;
        this.btnOneLastThing.addEventListener('click', () => this.executeCandleBlow());
      }
      if (this.smilingTextEl) {
        this.smilingTextEl.textContent = cfg.keepSmilingText;
      }
      if (this.btnExperienceAgain) {
        this.btnExperienceAgain.innerHTML = `${cfg.btnExperienceAgain}`;
        this.btnExperienceAgain.addEventListener('click', () => {
          this.app.resetAllAndGoToOpening();
        });
      }
    }
  }

  enter() {
    if (this.el) this.el.classList.remove('blown-out');
    if (this.candleFlame) {
      this.candleFlame.style.display = 'block';
      this.candleFlame.style.opacity = '1';
      this.candleFlame.style.transform = 'scale(1)';
    }
    if (this.smokeWisp) {
      this.smokeWisp.style.opacity = '0';
    }
    if (this.btnOneLastThing) this.btnOneLastThing.style.display = 'inline-flex';
    if (this.smilingTextEl) this.smilingTextEl.style.display = 'none';
    if (this.btnExperienceAgain) this.btnExperienceAgain.style.display = 'none';

    if (this.girl) {
      this.girl.reset();
      this.girl.container.style.left = '40px'; // Standing beside cake
    }
  }

  leave() {
    if (this.el) this.el.classList.remove('blown-out');
  }

  executeCandleBlow() {
    if (this.btnOneLastThing) this.btnOneLastThing.style.display = 'none';

    // 1. Girl animates blowing toward the candle (Specs 42 & 54)
    this.app.audio.playCandleBlow();
    this.girl.blowCandle(() => {
      // 2. Flame reacts to breath stream: bends, flickers, shrinks
      if (this.candleFlame) {
        this.candleFlame.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        this.candleFlame.style.transform = 'rotate(-35deg) scale(0.4)';
        this.candleFlame.style.opacity = '0';
      }

      // 3. Smoke wisp curls upward
      if (this.smokeWisp) {
        this.smokeWisp.style.transition = 'opacity 0.5s ease, transform 1.2s ease-out';
        this.smokeWisp.style.opacity = '0.75';
        this.smokeWisp.style.transform = 'translateY(-30px) scale(1.3)';
      }

      // 4. Room darkens slightly
      setTimeout(() => {
        if (this.el) this.el.classList.add('blown-out');

        // 5. Hundreds of magical starlight sparkles ignite across the sky!
        if (window.birthdayParticles) {
          window.birthdayParticles.triggerStarlightBurst();
        }

        // 6. "Keep smiling. ♡" and "↻ Experience Again"
        setTimeout(() => {
          if (this.smilingTextEl) this.smilingTextEl.style.display = 'block';
          if (this.btnExperienceAgain) this.btnExperienceAgain.style.display = 'inline-flex';
        }, 1200);
      }, 400);
    });
  }
}

window.FinalScene = FinalScene;
