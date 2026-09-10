/**
 * ============================================================================
 * PHOTO GALLERY (Appears AFTER the Baroque Gate opens!)
 * - 4 Polaroid cards of Yuhashvi with romantic captions
 * - Gentle tilts, hover straightens, soft golden glows, and smooth zoom
 * - Button [ Continue to the Birthday Cake ] advances to the Final Night Scene
 * - Shares the same continuous soundtrack (Portion 4: final.mp3)
 * ============================================================================
 */

class PhotoGalleryScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-gallery');
    this.headingEl = document.getElementById('gallery-heading');
    this.gridEl = document.getElementById('polaroid-grid');
    this.btnProceedFinal = document.getElementById('btn-proceed-final');

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.photoGallery : null;
    if (cfg && this.headingEl) {
      this.headingEl.textContent = cfg.heading;
    }

    this.renderPolaroids();

    if (this.btnProceedFinal) {
      this.btnProceedFinal.addEventListener('click', () => {
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
    if (this.app && this.app.audio) {
      this.app.audio.playMood('gallery');
    }
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }
  }

  leave() {}

  resetScene() {
    this.renderPolaroids();
  }
}

window.PhotoGalleryScene = PhotoGalleryScene;
