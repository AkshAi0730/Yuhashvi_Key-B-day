/**
 * ============================================================================
 * PHOTO SECTION & SECRET DORAEMON SURPRISE (Specs 19 - 20)
 * - Tasteful polaroid scrapbook gallery with subtle angles & hover straighten
 * - Centralized placeholders in config.js
 * - Hidden Doraemon easter egg discovery with interactive gift box
 * - Confetti celebration burst & seamless progression to final screen
 * ============================================================================
 */

class PhotoGalleryScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-gallery');
    this.headingEl = document.getElementById('gallery-heading');
    this.gridEl = document.getElementById('polaroid-grid');
    this.btnOneMoreSurprise = document.getElementById('btn-one-more-surprise');
    this.secretTrigger = document.getElementById('secret-doraemon-trigger');
    this.secretModal = document.getElementById('secret-popup-modal');
    this.secretCard = document.getElementById('secret-popup-card');
    this.secretHintText = document.getElementById('secret-hint-text');
    this.giftBoxImg = document.getElementById('secret-gift-box-img');
    this.btnOpenGift = document.getElementById('btn-open-gift');
    this.btnContinueFinal = document.getElementById('btn-continue-final');

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.photoGallery : null;
    if (cfg && this.headingEl) {
      this.headingEl.textContent = cfg.heading;
    }
    if (cfg && this.btnOneMoreSurprise) {
      this.btnOneMoreSurprise.innerHTML = `<span>✨</span> ${cfg.btnOneMoreSurprise}`;
      this.btnOneMoreSurprise.addEventListener('click', () => {
        this.openSecretModal();
      });
    }

    // Render polaroids
    this.renderPolaroids();

    // Secret Doraemon Trigger (Spec 20)
    if (this.secretTrigger) {
      this.secretTrigger.addEventListener('click', () => {
        this.openSecretModal();
      });
    }

    // Gift box & open button
    if (this.btnOpenGift) {
      this.btnOpenGift.addEventListener('click', () => this.openGift());
    }
    if (this.giftBoxImg) {
      this.giftBoxImg.addEventListener('click', () => this.openGift());
    }

    // Continue to Final Scene
    if (this.btnContinueFinal) {
      this.btnContinueFinal.addEventListener('click', () => {
        if (this.secretModal) this.secretModal.classList.remove('active');
        this.app.audio.playMood('final');
        this.app.goToScene('final');
      });
    }
  }

  renderPolaroids() {
    if (!this.gridEl) return;
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.photoGallery : null;
    if (!cfg || !cfg.photos) return;

    this.gridEl.innerHTML = '';
    cfg.photos.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.style.transform = `rotate(${p.rotation || 0}deg)`;

      card.innerHTML = `
        <div class="polaroid-img-frame">
          <img src="${p.src}" alt="${p.caption}" class="polaroid-img" loading="lazy" />
        </div>
        <div class="polaroid-caption">${p.caption}</div>
      `;

      // Attach hidden Doraemon to the 3rd card
      if (idx === 2) {
        const trigger = document.createElement('div');
        trigger.className = 'secret-doraemon-trigger';
        trigger.title = 'Psst...';
        trigger.innerHTML = `<img src="assets/images/doraemon_mini.jpg" class="secret-doraemon-icon" alt="secret" />`;
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openSecretModal();
        });
        card.appendChild(trigger);
      }

      this.gridEl.appendChild(card);
    });
  }

  enter() {
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
    if (this.secretModal) this.secretModal.classList.remove('active');
  }

  leave() {
    if (this.secretModal) this.secretModal.classList.remove('active');
  }

  openSecretModal() {
    const secCfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.secretSurprise : null;
    if (!this.secretModal) return;

    this.secretHintText.textContent = secCfg ? secCfg.doraemonHint : "Psst... I have one more thing for you! 👀";
    if (this.btnOpenGift) {
      this.btnOpenGift.style.display = 'inline-flex';
      this.btnOpenGift.innerHTML = `<span>🎁</span> ${secCfg ? secCfg.btnOpenGift : "Open"}`;
    }
    if (this.btnContinueFinal) {
      this.btnContinueFinal.style.display = 'none';
    }

    this.secretModal.classList.add('active');
    this.app.audio.playShootingStar();
  }

  openGift() {
    const secCfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.secretSurprise : null;

    // Confetti burst & sound (Spec 20)
    this.app.audio.playConfettiPop();
    if (window.birthdayParticles) {
      const rect = this.giftBoxImg ? this.giftBoxImg.getBoundingClientRect() : null;
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      window.birthdayParticles.triggerConfetti(x, y);
    }

    // Display: "You found the secret! ♡", then "But there's one last thing..."
    if (this.secretHintText) {
      this.secretHintText.textContent = secCfg ? secCfg.foundSecretText : "You found the secret! ♡";
    }

    if (this.btnOpenGift) this.btnOpenGift.style.display = 'none';

    setTimeout(() => {
      if (this.secretHintText) {
        this.secretHintText.textContent = secCfg ? secCfg.oneLastThingPrompt : "But there's one last thing...";
      }
      if (this.btnContinueFinal) {
        this.btnContinueFinal.style.display = 'inline-flex';
        this.btnContinueFinal.innerHTML = `<span>🌟</span> ${secCfg ? secCfg.btnContinueToFinal : "Continue"}`;
      }
    }, 1500);
  }
}

window.PhotoGalleryScene = PhotoGalleryScene;
