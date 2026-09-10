/**
 * ============================================================================
 * EXIT SCENE: DORAEMON & NOBITA
 * - Black/grey glassy background with floating space stars
 * - Doraemon & Nobita sitting side by side
 * - Proximity Interaction: as cursor moves closer to "Let's reconsider",
 *   their expressions smoothly transition from sad to happy with glowing smiles!
 * - Touch on mobile triggers happy reaction
 * - "Let's reconsider" returns smoothly to Page 1
 * ============================================================================
 */

class ExitScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-exit');
    this.questionEl = document.getElementById('exit-question');
    this.btnReconsider = document.getElementById('btn-reconsider');
    this.happyCharImg = document.getElementById('exit-char-happy');
    this.boundOnMouseMove = this.onMouseMove.bind(this);

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.exitScene : null;
    if (cfg && this.questionEl) {
      this.questionEl.textContent = cfg.title;
    }
    if (cfg && this.btnReconsider) {
      this.btnReconsider.innerHTML = `<span>🥺</span> ${cfg.btnReconsider}`;
    }

    if (this.btnReconsider) {
      this.btnReconsider.addEventListener('click', () => {
        // Smoothly return to Page 1
        this.app.audio.playMood('page1');
        this.app.goToScene('page1');
      });

      // Mobile touch trigger
      this.btnReconsider.addEventListener('touchstart', () => {
        this.setHappiness(1.0);
      }, { passive: true });
    }
  }

  enter() {
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('space');
    }
    this.setHappiness(0.0);
    window.addEventListener('mousemove', this.boundOnMouseMove);
  }

  leave() {
    window.removeEventListener('mousemove', this.boundOnMouseMove);
  }

  onMouseMove(e) {
    if (!this.btnReconsider || !this.happyCharImg) return;
    const rect = this.btnReconsider.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Distance threshold: within 380px, happiness ramps smoothly from 0 to 1
    const maxDist = 380;
    const minDist = 40;

    let happiness = 0;
    if (dist <= minDist) {
      happiness = 1.0;
    } else if (dist < maxDist) {
      happiness = (maxDist - dist) / (maxDist - minDist);
    } else {
      happiness = 0.0;
    }

    this.setHappiness(happiness);
  }

  setHappiness(val) {
    if (this.happyCharImg) {
      this.happyCharImg.style.opacity = val;
    }
  }
}

window.ExitScene = ExitScene;
