/**
 * ============================================================================
 * PHOTO GALLERY & NOBITA CHASE (Master Specification Rules #22 - #25)
 * - 4 Polaroid cards of Yuhashvi with captions [ADD PHOTO CAPTION 01..04]
 * - Nobita running along lower safe lane with "Catch me" speech bubble
 * - Generous click/tap hitbox (expanded touch area)
 * - On catch: Nobita stops, reacts, reveals and physically extends the
 *   Golden Heart Key with magical sparkles
 * - Button [ Approach the Golden Gate ] advances to the Baroque Gate Scene
 * ============================================================================
 */

class PhotoGalleryScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-gallery');
    this.headingEl = document.getElementById('gallery-heading');
    this.gridEl = document.getElementById('polaroid-grid');

    // Nobita Chase Subsystem
    this.chaseContainer = document.getElementById('nobita-chase-container');
    this.nobitaHitbox = document.getElementById('nobita-hitbox');
    this.nobitaImg = document.getElementById('nobita-runner-img');
    this.nobitaKey = document.getElementById('nobita-golden-key');
    this.nobitaBubble = document.getElementById('nobita-speech-bubble');
    this.btnProceedGate = document.getElementById('btn-proceed-gate');
    this.keyModal = document.getElementById('gallery-key-modal');
    this.btnGateImmediate = document.getElementById('btn-gate-immediate');
    this.btnStayGallery = document.getElementById('btn-stay-gallery');

    this.isRunning = false;
    this.isCaught = false;
    this.nobitaX = -150;
    this.nobitaSpeed = 4.6; // Faster, active, playful run reaching across the entire screen
    this.animId = null;
    this.step = 0;

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.photoGallery : null;
    if (cfg && this.headingEl) {
      this.headingEl.textContent = cfg.heading;
    }

    this.renderPolaroids();

    // Setup Nobita Tap & Click Detection (Generous Hitbox)
    if (this.nobitaHitbox) {
      this.nobitaHitbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.catchNobita();
      });
      this.nobitaHitbox.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.catchNobita();
      }, { passive: true });
    }

    if (this.btnProceedGate) {
      this.btnProceedGate.addEventListener('click', () => {
        this.app.audio.playMood('gate');
        this.app.goToScene('gate');
      });
    }

    if (this.btnGateImmediate) {
      this.btnGateImmediate.addEventListener('click', () => {
        this.app.audio.playMood('gate');
        this.hideNobitaFigure();
        this.app.goToScene('gate');
      });
    }

    if (this.btnStayGallery) {
      this.btnStayGallery.addEventListener('click', () => {
        if (this.keyModal) {
          this.keyModal.classList.remove('visible');
        }
        // Remove the Nobita figure completely after pop up goes
        this.hideNobitaFigure();
        if (this.btnProceedGate) {
          this.btnProceedGate.style.display = 'inline-flex';
        }
      });
    }

    // Dismiss modal on backdrop tap & remove Nobita figure
    if (this.keyModal) {
      this.keyModal.addEventListener('click', (e) => {
        if (e.target === this.keyModal) {
          this.keyModal.classList.remove('visible');
          this.hideNobitaFigure();
          if (this.btnProceedGate) {
            this.btnProceedGate.style.display = 'inline-flex';
          }
        }
      });
    }
  }

  hideNobitaFigure() {
    this.stopNobitaRun();
    this.isCaught = true;
    if (this.chaseContainer) {
      this.chaseContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      this.chaseContainer.style.opacity = '0';
      this.chaseContainer.style.transform = `translateX(${this.nobitaX}px) scale(0.6)`;
      this.chaseContainer.style.pointerEvents = 'none';
      setTimeout(() => {
        if (this.chaseContainer) {
          this.chaseContainer.style.display = 'none';
        }
      }, 400);
    }
  }

  renderPolaroids() {
    if (!this.gridEl) return;
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.photoGallery : null;
    if (!cfg || !cfg.photos) return;

    this.gridEl.innerHTML = '';
    cfg.photos.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.style.transform = `rotate(${p.rotation || 0}deg)`;

      card.innerHTML = `
        <div class="polaroid-img-frame">
          <img src="${p.src}" alt="${p.caption}" class="polaroid-img" loading="lazy" />
        </div>
        <div class="polaroid-caption">${p.caption}</div>
      `;

      this.gridEl.appendChild(card);
    });
  }

  enter() {
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
    this.resetChase();
    this.startNobitaRun();
  }

  leave() {
    this.stopNobitaRun();
  }

  resetScene() {
    this.resetChase();
  }

  resetChase() {
    this.stopNobitaRun();
    this.isCaught = false;
    this.nobitaX = -140;
    this.step = 0;

    if (this.chaseContainer) {
      this.chaseContainer.style.transition = 'none';
      this.chaseContainer.style.opacity = '1';
      this.chaseContainer.style.transform = `translateX(${this.nobitaX}px)`;
      this.chaseContainer.style.display = 'block';
    }
    if (this.nobitaBubble) {
      this.nobitaBubble.textContent = 'Catch me! 🏃‍♂️';
      this.nobitaBubble.style.opacity = '1';
      this.nobitaBubble.style.transform = 'none';
    }
    if (this.nobitaKey) {
      this.nobitaKey.classList.remove('floating');
      this.nobitaKey.style.opacity = '0';
    }
    if (this.keyModal) {
      this.keyModal.classList.remove('visible');
    }
    if (this.btnProceedGate) {
      this.btnProceedGate.style.display = 'none';
    }
  }

  startNobitaRun() {
    if (this.isCaught) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning || this.isCaught) return;

      this.step += 0.22;
      this.nobitaX += this.nobitaSpeed;

      // Wrap around safe lane: reach other end before looping
      const screenW = window.innerWidth;
      if (this.nobitaX > screenW + 160) {
        this.nobitaX = -180;
      }

      // Natural running stride & vertical footfall bobbing
      const bobY = Math.abs(Math.sin(this.step)) * 13;
      const tilt = Math.sin(this.step) * 6;

      if (this.chaseContainer) {
        this.chaseContainer.style.transform = `translateX(${this.nobitaX}px) translateY(${-bobY}px) rotate(${tilt}deg)`;
      }

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  stopNobitaRun() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  // Catch Interaction (Rules #23 & #25)
  catchNobita() {
    if (this.isCaught) return;
    this.isCaught = true;
    this.stopNobitaRun();

    // Ensure Nobita is comfortably on screen so bubble & key aren't clipped
    const minSafeX = 140;
    const maxSafeX = Math.max(minSafeX, (window.innerWidth || 1000) - 220);
    this.nobitaX = Math.max(minSafeX, Math.min(maxSafeX, this.nobitaX));

    // 1. Nobita stops running and turns with a cheerful reaction
    this.app.audio.playConfettiPop();
    if (this.chaseContainer) {
      this.chaseContainer.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1)';
      this.chaseContainer.style.transform = `translateX(${this.nobitaX}px) translateY(0) scale(1.15)`;
    }

    if (this.nobitaBubble) {
      this.nobitaBubble.textContent = 'You caught me! Here is something special for you 💖';
      this.nobitaBubble.style.transition = 'transform 0.3s ease';
      this.nobitaBubble.style.transform = 'scale(1.1)';
    }

    // 2. Reveal Golden Heart Key in hand & physically extend toward visitor
    setTimeout(() => {
      this.app.audio.playShootingStar();
      if (window.birthdayParticles) {
        const rect = this.nobitaHitbox.getBoundingClientRect();
        window.birthdayParticles.triggerConfetti(rect.left + rect.width / 2, rect.top);
      }

      if (this.nobitaKey) {
        this.nobitaKey.style.opacity = '1';
        this.nobitaKey.classList.add('floating');
      }

      // 3. Float Key to Center and Reveal the Choice Pop-up Modal
      setTimeout(() => {
        if (this.keyModal) {
          this.keyModal.classList.add('visible');
          if (window.birthdayParticles) {
            window.birthdayParticles.triggerStarlightBurst();
          }
        }
      }, 700);
    }, 450);
  }
}

window.PhotoGalleryScene = PhotoGalleryScene;
