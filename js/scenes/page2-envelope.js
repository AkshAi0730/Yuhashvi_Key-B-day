/**
 * ============================================================================
 * PAGE 2: A LITTLE SOMETHING FOR YOU & INTERACTIVE ENVELOPE (Specs 17 - 18)
 * - Calmer soft pastel atmosphere with floating hearts
 * - Glassmorphism card with customizable introductory message
 * - Interactive envelope labeled "For Yuhashvi ♡"
 * - Shaking, floating heart particles, flap opening, letter paper rising out,
 *   and gradual text typewriter reveal
 * - Button: [ Continue ] to photo section
 * ============================================================================
 */

class Page2EnvelopeScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-page2');
    this.introTitleEl = document.getElementById('page2-intro-title');
    this.introDescEl = document.getElementById('page2-intro-desc');
    this.envelopeWrap = document.getElementById('envelope-wrap');
    this.envelopeFlap = document.getElementById('envelope-flap');
    this.letterPaper = document.getElementById('letter-paper');
    this.letterTextEl = document.getElementById('letter-text-content');
    this.btnOpenEnvelope = document.getElementById('btn-open-envelope');
    this.btnContinuePhotos = document.getElementById('btn-continue-photos');
    this.sealTouch = document.getElementById('envelope-seal-touch');
    this.isOpen = false;

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.page2 : null;
    if (cfg) {
      if (this.introTitleEl) this.introTitleEl.textContent = cfg.introHeader;
      if (this.introDescEl) this.introDescEl.textContent = cfg.littleSomethingMessage;
      if (this.btnOpenEnvelope) {
        this.btnOpenEnvelope.innerHTML = `<span>💌</span> ${cfg.btnOpenEnvelope}`;
      }
      if (this.btnContinuePhotos) {
        this.btnContinuePhotos.innerHTML = `<span>🌸</span> ${cfg.btnContinueToPhotos}`;
        this.btnContinuePhotos.addEventListener('click', () => {
          this.app.goToScene('gallery');
        });
      }
    }

    if (this.btnOpenEnvelope) {
      this.btnOpenEnvelope.addEventListener('click', () => this.openEnvelope());
    }
    if (this.envelopeWrap) {
      this.envelopeWrap.addEventListener('click', () => this.openEnvelope());
    }
    if (this.sealTouch) {
      this.sealTouch.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEnvelope();
      });
    }
  }

  enter() {
    this.isOpen = false;
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('hearts');
    }
    if (this.envelopeWrap) {
      this.envelopeWrap.classList.remove('shaking');
      this.envelopeWrap.classList.remove('opened');
    }
    if (this.letterPaper) this.letterPaper.classList.remove('risen');
    if (this.letterTextEl) this.letterTextEl.textContent = '';
    if (this.btnContinuePhotos) this.btnContinuePhotos.style.display = 'none';
    if (this.btnOpenEnvelope) this.btnOpenEnvelope.style.display = 'inline-flex';
  }

  leave() {}

  resetScene() {
    this.enter();
  }

  openEnvelope() {
    if (this.isOpen) return;
    this.isOpen = true;

    // 1. Envelope gently shakes
    if (this.envelopeWrap) {
      this.envelopeWrap.classList.add('shaking');
    }

    // 2. Small heart particles appear & softer music
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('hearts');
    }

    setTimeout(() => {
      if (this.envelopeWrap) {
        this.envelopeWrap.classList.remove('shaking');
        this.envelopeWrap.classList.add('opened');
      }

      // 3. Envelope flap opens
      if (this.envelopeFlap) {
        this.envelopeFlap.classList.add('open');
      }

      // 4. Letter rises out
      setTimeout(() => {
        if (this.letterPaper) {
          this.letterPaper.classList.add('risen');
        }
        if (this.btnOpenEnvelope) {
          this.btnOpenEnvelope.style.display = 'none';
        }

        // 5 & 6. Text appears gradually with typewriter effect
        setTimeout(() => {
          this.typewriterLetterText();
        }, 800);
      }, 500);
    }, 450);
  }

  typewriterLetterText() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.page2 : null;
    const fullText = cfg ? cfg.envelopeText : "Wishing you a wonderful 21st birthday!";
    let index = 0;

    if (this.letterTextEl) {
      this.letterTextEl.textContent = '';
      const timer = setInterval(() => {
        if (index < fullText.length) {
          this.letterTextEl.textContent += fullText.charAt(index);
          index++;
        } else {
          clearInterval(timer);
          // Reveal [ Continue ] button after message is read
          setTimeout(() => {
            if (this.btnContinuePhotos) {
              this.btnContinuePhotos.style.display = 'inline-flex';
              this.btnContinuePhotos.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 600);
        }
      }, 22);
    }
  }
}

window.Page2EnvelopeScene = Page2EnvelopeScene;
