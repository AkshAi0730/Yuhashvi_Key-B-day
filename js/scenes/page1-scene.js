/**
 * ============================================================================
 * PAGE 1: OPENING SCENE
 * - Composition preserves bear vinyl figure & miniature beach deck chairs
 * - Clean left area with main question & buttons
 * - Blackadder ITC font for question, Times New Roman for buttons
 * ============================================================================
 */

class Page1Scene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-page1');
    this.questionEl = document.getElementById('page1-question');
    this.btnWish = document.getElementById('btn-wish-accepted');
    this.btnExit = document.getElementById('btn-exit');

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.page1 : null;
    if (cfg && this.questionEl) {
      this.questionEl.textContent = cfg.question;
    }
    if (cfg && this.btnWish) {
      this.btnWish.innerHTML = `<span>💖</span> ${cfg.btnWishAccepted}`;
    }
    if (cfg && this.btnExit) {
      this.btnExit.innerHTML = `<span>🚪</span> ${cfg.btnExit}`;
    }

    // Button event listeners
    if (this.btnWish) {
      this.btnWish.addEventListener('click', () => {
        this.app.audio.playMood('pinata');
        this.app.goToScene('pinata');
      });
    }

    if (this.btnExit) {
      this.btnExit.addEventListener('click', () => {
        this.app.audio.playMood('exit');
        this.app.goToScene('exit');
      });
    }
  }

  enter() {
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
    if (this.app && this.app.audio) {
      this.app.audio.playMood('page1');
    }
  }

  leave() {}
}

window.Page1Scene = Page1Scene;
