/**
 * ============================================================================
 * PAGE 2: A LITTLE SOMETHING FOR YOU & INTERACTIVE ENVELOPE (Specs 17 - 18)
 * - Calmer soft pastel atmosphere with floating hearts
 * - Glassmorphism card with introductory message
 * - Interactive envelope labeled "For Yuhashvi ♡"
 * - Shaking, flap opening, letter paper rising out, typewriter text reveal,
 *   and custom Word-document vertical scrollbar in Harlow Solid Italic
 * - Chibi Nobita running along bottom safe lane with Golden Heart Key
 * - Catching Nobita or completing letter offers path to the Baroque Gate!
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
    this.btnContinueGate = document.getElementById('btn-continue-gate');
    this.sealTouch = document.getElementById('envelope-seal-touch');

    // Chibi Nobita Key Runner Elements
    this.chaseContainer = document.getElementById('nobita-chase-container');
    this.nobitaBubble = document.getElementById('nobita-speech-bubble');
    this.nobitaHitbox = document.getElementById('nobita-hitbox');
    this.nobitaImg = document.getElementById('nobita-runner-img');
    this.nobitaKey = document.getElementById('nobita-golden-key');
    this.keyModal = document.getElementById('page2-key-modal');
    this.btnGateImmediate = document.getElementById('btn-gate-immediate');
    this.btnStayPage2 = document.getElementById('btn-stay-page2');

    this.isOpen = false;
    this.isCaught = false;
    this.isRunning = false;
    this.nobitaX = -140;
    this.nobitaSpeed = 3.6;
    this.step = 0;
    this.animId = null;
    this.typewriterTimer = null;

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
    if (this.letterPaper) {
      this.letterPaper.addEventListener('click', (e) => e.stopPropagation());
      this.letterPaper.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    }

    // Approach Baroque Gate Button
    if (this.btnContinueGate) {
      this.btnContinueGate.addEventListener('click', () => {
        this.app.audio.playMood('gate');
        this.app.goToScene('gate');
      });
    }

    // Nobita Catch Interactions
    if (this.nobitaHitbox) {
      const handleHitboxTap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.catchNobita();
      };
      this.nobitaHitbox.addEventListener('click', handleHitboxTap);
      this.nobitaHitbox.addEventListener('touchstart', handleHitboxTap, { passive: false });
    }

    if (this.btnGateImmediate) {
      this.btnGateImmediate.addEventListener('click', () => {
        if (this.keyModal) {
          this.keyModal.classList.remove('visible');
          this.keyModal.classList.remove('active');
        }
        this.hideNobitaFigure();
        this.app.audio.playMood('gate');
        this.app.goToScene('gate');
      });
    }

    if (this.btnStayPage2) {
      this.btnStayPage2.addEventListener('click', () => {
        if (this.keyModal) {
          this.keyModal.classList.remove('visible');
          this.keyModal.classList.remove('active');
        }
        this.hideNobitaFigure();
        if (this.btnContinueGate) {
          this.btnContinueGate.style.display = 'inline-flex';
        }
      });
    }

    // Backdrop tap dismiss
    if (this.keyModal) {
      this.keyModal.addEventListener('click', (e) => {
        if (e.target === this.keyModal) {
          this.keyModal.classList.remove('visible');
          this.keyModal.classList.remove('active');
          this.hideNobitaFigure();
          if (this.btnContinueGate) {
            this.btnContinueGate.style.display = 'inline-flex';
          }
        }
      });
    }
  }

  enter() {
    this.isOpen = false;
    if (this.app && this.app.audio) {
      this.app.audio.playMood('page2');
    }
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('hearts');
    }
    if (this.envelopeWrap) {
      this.envelopeWrap.classList.remove('shaking');
      this.envelopeWrap.classList.remove('opened');
    }
    if (this.letterPaper) {
      this.letterPaper.scrollTop = 0;
      this.letterPaper.classList.remove('risen');
    }
    if (this.letterTextEl) this.letterTextEl.textContent = '';
    if (this.btnContinueGate) this.btnContinueGate.style.display = 'none';
    if (this.btnOpenEnvelope) this.btnOpenEnvelope.style.display = 'inline-flex';

    // Reset Nobita state - stays hidden until all words are revealed!
    this.resetChase();
    this.sceneActive = true;
  }

  leave() {
    this.sceneActive = false;
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.stopNobitaRun();
  }

  resetScene() {
    this.enter();
  }

  // Nobita Chase Mechanics
  resetChase() {
    this.stopNobitaRun();
    this.isCaught = false;
    this.nobitaX = -140;
    this.step = 0;

    if (this.chaseContainer) {
      this.chaseContainer.style.transition = 'none';
      this.chaseContainer.style.opacity = '0';
      this.chaseContainer.style.display = 'none'; // Hidden until envelope unfolds!
      this.chaseContainer.style.transform = `translateX(${this.nobitaX}px)`;
      this.chaseContainer.style.pointerEvents = 'auto';
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
      this.keyModal.classList.remove('active');
    }
    if (this.btnContinueGate) {
      this.btnContinueGate.style.display = 'none';
    }
  }

  startNobitaRun() {
    if (this.isCaught) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning || this.isCaught) return;

      this.step += 0.22;
      this.nobitaX += this.nobitaSpeed;

      const screenW = window.innerWidth;
      if (this.nobitaX > screenW + 160) {
        this.nobitaX = -180;
      }

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

  catchNobita() {
    if (this.isCaught) return;
    this.isCaught = true;
    this.stopNobitaRun();

    const minSafeX = 140;
    const maxSafeX = Math.max(minSafeX, (window.innerWidth || 1000) - 220);
    this.nobitaX = Math.max(minSafeX, Math.min(maxSafeX, this.nobitaX));

    this.app.audio.playConfettiPop();
    if (this.chaseContainer) {
      this.chaseContainer.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      this.chaseContainer.style.transform = `translateX(${this.nobitaX}px) translateY(0) scale(1.08)`;
    }
    if (this.nobitaBubble) {
      this.nobitaBubble.textContent = "You caught me! Here's something special! ✨";
      this.nobitaBubble.classList.add('pop');
    }

    // Sparkle burst & modal reveal
    setTimeout(() => {
      if (window.birthdayParticles) {
        window.birthdayParticles.triggerConfetti(this.nobitaX + 50, window.innerHeight - 90);
      }
      if (this.nobitaKey) {
        this.nobitaKey.style.opacity = '1';
        this.nobitaKey.classList.add('floating');
      }

      // "Approach the Baroque Gate" button is now unlocked and made available
      if (this.btnContinueGate) {
        this.btnContinueGate.style.display = 'inline-flex';
      }

      setTimeout(() => {
        if (this.keyModal) {
          this.keyModal.classList.add('visible');
          this.keyModal.classList.add('active');
        }
      }, 700);
    }, 450);
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

  openEnvelope() {
    if (this.isOpen) return;
    this.isOpen = true;

    // 1. Envelope gently shakes
    if (this.envelopeWrap) {
      this.envelopeWrap.classList.add('shaking');
    }

    // 2. Small heart particles appear
    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('hearts');
    }

    setTimeout(() => {
      if (!this.sceneActive) return;
      if (this.envelopeWrap) {
        this.envelopeWrap.classList.remove('shaking');
        this.envelopeWrap.classList.add('opened');
      }

      // 3. Flap opens
      if (this.envelopeFlap) {
        this.envelopeFlap.classList.add('open');
      }

      // 4. Letter rises out
      setTimeout(() => {
        if (!this.sceneActive) return;
        if (this.letterPaper) {
          this.letterPaper.classList.add('risen');
        }
        if (this.btnOpenEnvelope) {
          this.btnOpenEnvelope.style.display = 'none';
        }

        // 5. Typewriter text begins revealing word by word
        setTimeout(() => {
          if (!this.sceneActive) return;
          this.typewriterLetterText();
        }, 500);
      }, 500);
    }, 450);
  }

  typewriterLetterText() {
    if (!this.sceneActive) return;
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.page2 : null;
    const fullText = cfg ? cfg.envelopeText : "Wishing you a wonderful 21st birthday!";
    let index = 0;

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    if (this.letterTextEl) {
      this.letterTextEl.textContent = '';
      if (this.letterPaper) this.letterPaper.scrollTop = 0;

      this.typewriterTimer = setInterval(() => {
        if (!this.sceneActive) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
          return;
        }

        if (index < fullText.length) {
          this.letterTextEl.textContent += fullText.charAt(index);
          index++;

          // Smooth auto-scroll downward
          if (this.letterPaper && index % 4 === 0) {
            this.letterPaper.scrollTop = this.letterPaper.scrollHeight;
          }
        } else {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;

          if (this.letterPaper) {
            this.letterPaper.scrollTop = this.letterPaper.scrollHeight;
          }

          // --- ALL WORDS REVEALED: NOW NOBITA RUNS ---
          // The letter opens -> text appears -> Nobita runs!
          // Note: "Approach the Baroque Gate" button stays HIDDEN until Nobita is caught!
          setTimeout(() => {
            if (!this.sceneActive) return;
            if (!this.isCaught && this.chaseContainer) {
              this.chaseContainer.style.display = 'block';
              this.chaseContainer.style.transition = 'opacity 0.6s ease';
              this.chaseContainer.style.opacity = '1';
              this.startNobitaRun();
            }
          }, 500);
        }
      }, 20);
    }
  }
}

window.Page2EnvelopeScene = Page2EnvelopeScene;
