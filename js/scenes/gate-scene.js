/**
 * ============================================================================
 * BAROQUE GOLDEN GATE & HEART PADLOCK SCENE (Master Spec Rules #26 - #30)
 * - Opulent baroque golden gate with stone pillars & lanterns
 * - Centered ornate Heart Padlock with 'tap me to unlock' prompt
 * - Golden Heart Key aligns, inserts, and rotates 90 degrees
 * - Padlock releases and drops open with sparkle burst
 * - Both gate leaves physically swing open in 3D perspective (rotateY)
 * - Camera gently moves through the opening into the Final Night scene
 * ============================================================================
 */

class GateScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-gate');
    this.doorLeft = document.getElementById('gate-door-left-panel');
    this.doorRight = document.getElementById('gate-door-right-panel');
    this.padlockAssembly = document.getElementById('gate-padlock-assembly');
    this.padlockImg = document.getElementById('gate-padlock-img');
    this.keyProp = document.getElementById('gate-key-prop');
    this.unlockPrompt = document.getElementById('gate-unlock-prompt');
    this.isUnlocked = false;

    this.init();
  }

  init() {
    if (this.padlockAssembly) {
      this.padlockAssembly.addEventListener('click', () => this.executeUnlock());
      this.padlockAssembly.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.executeUnlock();
      });
    }
  }

  enter() {
    this.resetScene();
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
  }

  leave() {}

  resetScene() {
    this.isUnlocked = false;

    if (this.doorLeft) {
      this.doorLeft.style.transition = 'none';
      this.doorLeft.style.transform = 'perspective(1200px) rotateY(0deg)';
    }
    if (this.doorRight) {
      this.doorRight.style.transition = 'none';
      this.doorRight.style.transform = 'perspective(1200px) rotateY(0deg)';
    }
    if (this.padlockAssembly) {
      this.padlockAssembly.style.display = 'flex';
      this.padlockAssembly.style.opacity = '1';
      this.padlockAssembly.style.pointerEvents = 'auto';
    }
    if (this.padlockImg) {
      this.padlockImg.style.transition = 'none';
      this.padlockImg.style.transform = 'none';
      this.padlockImg.style.opacity = '1';
    }
    if (this.keyProp) {
      this.keyProp.style.transition = 'none';
      this.keyProp.style.opacity = '0';
      this.keyProp.style.transform = 'translate(-60px, -60px) rotate(-45deg)';
    }
    if (this.unlockPrompt) {
      this.unlockPrompt.style.display = 'block';
      this.unlockPrompt.style.opacity = '1';
    }
    if (this.el) {
      this.el.classList.remove('doors-open');
    }
  }

  executeUnlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.unlockPrompt) {
      this.unlockPrompt.style.opacity = '0';
      this.unlockPrompt.style.display = 'none';
    }
    if (this.padlockAssembly) this.padlockAssembly.style.pointerEvents = 'none';

    // 1. Golden Heart Key floats into position aligning with keyhole (Rule #29)
    if (this.keyProp) {
      this.keyProp.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.35s ease';
      this.keyProp.style.opacity = '1';
      this.keyProp.style.transform = 'translate(0px, 12px) rotate(0deg)';
    }

    // 2. Key inserts and rotates 90 degrees
    setTimeout(() => {
      if (this.keyProp) {
        this.keyProp.style.transition = 'transform 0.4s ease';
        this.keyProp.style.transform = 'translate(0px, 2px) rotate(90deg)';
      }
      this.app.audio.playHit(1); // Metallic key click

      // 3. Lock releases & drops open with sparkle burst
      setTimeout(() => {
        this.app.audio.playConfettiPop();
        if (window.birthdayParticles) {
          const rect = this.padlockAssembly ? this.padlockAssembly.getBoundingClientRect() : null;
          const px = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
          const py = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
          window.birthdayParticles.triggerConfetti(px, py);
          window.birthdayParticles.triggerStarlightBurst();
        }

        if (this.padlockImg) {
          this.padlockImg.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.8, 0.5), opacity 0.5s ease';
          this.padlockImg.style.transform = 'translateY(140px) rotate(22deg) scale(0.7)';
          this.padlockImg.style.opacity = '0';
        }
        if (this.keyProp) {
          this.keyProp.style.transition = 'opacity 0.4s ease';
          this.keyProp.style.opacity = '0';
        }
        setTimeout(() => {
          if (this.padlockAssembly) this.padlockAssembly.style.display = 'none';
        }, 550);

        // 4. Both gate panels physically swing open in 3D perspective (Rule #30)
        setTimeout(() => {
          if (this.doorLeft) {
            this.doorLeft.style.transition = 'transform 1.9s cubic-bezier(0.2, 0.8, 0.25, 1)';
            this.doorLeft.style.transform = 'perspective(1200px) rotateY(-82deg)';
          }
          if (this.doorRight) {
            this.doorRight.style.transition = 'transform 1.9s cubic-bezier(0.2, 0.8, 0.25, 1)';
            this.doorRight.style.transform = 'perspective(1200px) rotateY(82deg)';
          }
          if (this.el) {
            this.el.classList.add('doors-open');
          }

          // 5. Camera glides forward through the opening into Final Night Scene
          setTimeout(() => {
            this.app.audio.playMood('final');
            this.app.goToScene('final');
          }, 2400);
        }, 500);
      }, 550);
    }, 700);
  }
}

window.GateScene = GateScene;
