/**
 * ============================================================================
 * PIÑATA SCENE ENGINE (js/scenes/pinata-scene.js)
 * Coordinates:
 * - Articulated GirlCharacter (walking, looking up, picking bat, jump swing, peek)
 * - Articulated BoyCharacter (peeking, throwing bat, comic BAM!)
 * - DoraemonPhysicsEngine (100 transparent dolls, 3D burial mound)
 * - Inverted Spring Mouse/Touch Height Control
 * - 4 Hits (Thump, Bam, Whack, Crack) & Break Explosion
 * - Birthday Reveal & Sequential Progression
 * ============================================================================
 */

class PinataScene {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('scene-pinata');
    this.pinataRig = document.getElementById('pinata-rig');
    this.pinataRope = document.getElementById('pinata-rope') || (this.pinataRig && this.pinataRig.querySelector('.pinata-rope'));
    this.pinataBody = document.getElementById('pinata-body');
    this.pinataIntactImg = document.getElementById('pinata-img-intact');
    this.pinataCrackedImg = document.getElementById('pinata-img-cracked');
    this.goldenArchImg = document.getElementById('golden-birthday-arch');
    this.birthdayWishBanner = document.getElementById('birthday-wish-banner');
    this.ropeIndicator = document.getElementById('rope-indicator');
    this.mobileTapBtn = document.getElementById('btn-mobile-tap');
    this.bamEffect = document.getElementById('bam-effect');
    this.speechBubble = document.getElementById('speech-bubble');
    this.birthdayRevealWrap = document.getElementById('birthday-reveal-wrap');
    this.btnContinuePage2 = document.getElementById('btn-continue-page2');
    this.cameraFrame = document.getElementById('pinata-camera-frame');

    // Articulated Character & Physics Subsystems
    this.girl = new window.GirlCharacter('girl-wrap');
    this.boy = new window.BoyCharacter('boy-wrap', 'bat-prop');
    this.doraemon = new window.DoraemonPhysicsEngine('doraemon-bg-canvas', 'doraemon-fg-canvas');

    // Inverted spring vertical physics
    this.pinataTargetY = 45;
    this.pinataCurrentY = 45;
    this.minY = 30;
    this.maxY = 265; // Reachable strike threshold >= 195
    this.isReachable = false;
    this.isInteractive = false;
    this.hitCount = 0;
    this.isHitting = false;
    this.isBroken = false;
    this.physicsRaf = null;

    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);

    this.init();
  }

  init() {
    const cfg = window.BIRTHDAY_CONFIG ? window.BIRTHDAY_CONFIG.pinataScene : null;
    if (cfg && this.btnContinuePage2) {
      this.btnContinuePage2.innerHTML = `<span>💌</span> ${cfg.btnContinueToPage2}`;
      this.btnContinuePage2.addEventListener('click', () => {
        this.app.audio.playMood('envelope');
        this.app.goToScene('page2');
      });
    }

    if (this.mobileTapBtn) {
      this.mobileTapBtn.addEventListener('click', () => {
        if (this.isReachable && !this.isHitting && !this.isBroken) {
          this.executeHitSequence();
        }
      });
    }

    if (this.pinataBody) {
      this.pinataBody.addEventListener('click', () => {
        if (this.isReachable && !this.isHitting && !this.isBroken) {
          this.executeHitSequence();
        }
      });
    }
  }

  enter() {
    this.resetScene();
    this.startStorySequence();
  }

  leave() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('touchmove', this.boundTouchMove);
    if (this.physicsRaf) cancelAnimationFrame(this.physicsRaf);
    this.isInteractive = false;
  }

  resetScene() {
    this.leave();
    this.hitCount = 0;
    this.isHitting = false;
    this.isBroken = false;
    this.isReachable = false;
    this.pinataTargetY = 45;
    this.pinataCurrentY = 45;

    if (this.girl) this.girl.reset();
    if (this.boy) this.boy.reset();
    if (this.doraemon) this.doraemon.reset();

    if (this.bamEffect) this.bamEffect.classList.remove('pop');
    if (this.speechBubble) this.speechBubble.classList.remove('active');
    if (this.ropeIndicator) this.ropeIndicator.classList.remove('visible');
    if (this.mobileTapBtn) this.mobileTapBtn.classList.remove('visible');
    if (this.birthdayRevealWrap) this.birthdayRevealWrap.classList.remove('visible');
    if (this.goldenArchImg) this.goldenArchImg.style.opacity = '0';
    if (this.birthdayWishBanner) this.birthdayWishBanner.style.opacity = '0';
    if (this.cameraFrame) this.cameraFrame.classList.remove('zoom-near');
    if (this.girl && this.girl.el) this.girl.el.style.opacity = '1';

    if (this.pinataIntactImg) {
      this.pinataIntactImg.style.display = 'block';
      this.pinataIntactImg.style.opacity = '1';
    }
    if (this.pinataCrackedImg) {
      this.pinataCrackedImg.style.display = 'none';
      this.pinataCrackedImg.style.opacity = '0';
    }

    if (this.pinataRope) {
      this.pinataRope.style.height = `${this.pinataCurrentY + 70}px`;
    }
    if (this.pinataRig) {
      this.pinataRig.style.transform = 'translateX(-50%)';
      this.pinataRig.style.display = 'flex';
      this.pinataRig.style.opacity = '1';
    }
  }

  // Sequenced Story Arc (Specs 19 - 41)
  startStorySequence() {
    // 1. Girl enters walking from RIGHT to LEFT, stopping directly at her hitting stance beside piñata
    const isMobile = window.innerWidth <= 900;
    const hitX = Math.round(window.innerWidth / 2 - (isMobile ? 150 : 210));

    setTimeout(() => {
      this.girl.walkTo(hitX, 3400, () => {
        // 2. Girl stops directly at her hitting position beside piñata and looks up
        setTimeout(() => {
          this.girl.lookUp(() => {
            // 3. Boy peeks from left, reacts, and throws baseball bat safely beside girl on the grass
            setTimeout(() => {
              const safeLandingX = Math.max(hitX - 75, 80); // Safe separation on her left, NEVER lands on or overlaps girl
              this.boy.performThrowSequence(safeLandingX, () => {
                // Comic BAM! sound & visual effect
                this.app.audio.playBam();
                if (this.bamEffect) {
                  this.bamEffect.style.left = `${safeLandingX - 10}px`;
                  this.bamEffect.style.bottom = '110px';
                  this.bamEffect.classList.add('pop');
                  setTimeout(() => this.bamEffect.classList.remove('pop'), 700);
                }
              }, () => {
                // 4. Girl notices bat safely beside her, bends down, picks it up, stands up in stance
                setTimeout(() => {
                  this.girl.pickUpBat(() => {
                    // 5. Girl tries 3 jumping swings that miss
                    setTimeout(() => {
                      this.executeMissJumps();
                    }, 600);
                  });
                }, 400);
              });
            }, 600);
          });
        }, 400);
      });
    }, 400);
  }

  // 3 Jumping Misses with crouching, jumping, swinging, and confusion
  executeMissJumps() {
    // Miss 1
    this.app.audio.playWhoosh();
    this.girl.jumpAndSwing(70, false, null, () => {
      this.girl.showConfusion(() => {
        // Miss 2
        setTimeout(() => {
          this.app.audio.playWhoosh();
          this.girl.jumpAndSwing(85, false, null, () => {
            this.girl.showConfusion(() => {
              // Miss 3 (still too high!)
              setTimeout(() => {
                this.app.audio.playWhoosh();
                this.girl.jumpAndSwing(95, false, null, () => {
                  // Speech bubble: "Help me! 🥺"
                  if (this.speechBubble) this.speechBubble.classList.add('active');

                  // Shooting star arrives to unlock interactive control
                  setTimeout(() => {
                    this.triggerHelpArrival();
                  }, 1600);
                });
              }, 500);
            });
          });
        }, 500);
      });
    });
  }

  triggerHelpArrival() {
    this.app.audio.playShootingStar();
    if (window.birthdayParticles) {
      window.birthdayParticles.triggerShootingStar(() => {
        if (this.speechBubble) this.speechBubble.classList.remove('active');
        if (this.ropeIndicator) this.ropeIndicator.classList.add('visible');
        this.enableInteractivePinata();
      });
    }
  }

  // Core Mechanic: Mouse / Touch Vertical Control (TOP moves pinata DOWN, BOTTOM moves pinata UP)
  enableInteractivePinata() {
    this.isInteractive = true;
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('touchmove', this.boundTouchMove, { passive: false });

    this.updatePhysics();
    this.startContinuousGirlJumping();
  }

  onMouseMove(e) {
    if (!this.isInteractive || this.isBroken) return;
    const windowH = window.innerHeight;
    // EXACT RULE: Mouse near TOP (e.clientY near 0) -> pinata moves DOWN
    // Mouse near BOTTOM (e.clientY near windowH) -> pinata moves UP
    const invertedRatio = 1 - Math.min(Math.max(e.clientY / windowH, 0), 1);
    this.pinataTargetY = this.minY + invertedRatio * (this.maxY - this.minY);
  }

  onTouchMove(e) {
    if (!this.isInteractive || this.isBroken) return;
    if (e.touches.length > 0) {
      const touchY = e.touches[0].clientY;
      const windowH = window.innerHeight;
      const invertedRatio = 1 - Math.min(Math.max(touchY / windowH, 0), 1);
      this.pinataTargetY = this.minY + invertedRatio * (this.maxY - this.minY);
    }
  }

  updatePhysics() {
    if (!this.isInteractive) return;

    // Smooth elastic spring delay
    this.pinataCurrentY += (this.pinataTargetY - this.pinataCurrentY) * 0.12;

    // Continuous ceiling-anchored rope extension & subtraction
    if (this.pinataRope) {
      this.pinataRope.style.height = `${this.pinataCurrentY + 70}px`;
    }

    // Reachable threshold: when pinata lowers to hitting height
    if (this.pinataCurrentY >= 190) {
      if (!this.isReachable) {
        this.isReachable = true;
        if (this.mobileTapBtn) this.mobileTapBtn.classList.add('visible');
      }
    } else {
      if (this.isReachable) {
        this.isReachable = false;
        if (this.mobileTapBtn) this.mobileTapBtn.classList.remove('visible');
      }
    }

    this.physicsRaf = requestAnimationFrame(() => this.updatePhysics());
  }

  startContinuousGirlJumping() {
    if (this.isBroken || this.isHitting) return;

    const attemptJump = () => {
      if (this.isBroken || this.isHitting || !this.isInteractive) return;

      const jumpH = this.isReachable ? 105 : 75;
      this.girl.jumpAndSwing(jumpH, this.isReachable, () => {
        if (this.isReachable && this.girl.swingBat) {
          this.girl.swingBat();
        }
        // Apex swing check
        if (this.isReachable && !this.isHitting && !this.isBroken) {
          this.executeHitSequence();
        }
      }, () => {
        if (!this.isBroken && !this.isHitting && this.isInteractive) {
          setTimeout(attemptJump, 900);
        }
      });
    };

    attemptJump();
  }

  // Hit Sequence 1 to 4: Thump -> Bam -> Whack -> Crack
  executeHitSequence() {
    this.isHitting = true;
    this.isInteractive = false;
    if (this.ropeIndicator) this.ropeIndicator.classList.remove('visible');
    if (this.mobileTapBtn) this.mobileTapBtn.classList.remove('visible');

    const hits = [
      { text: "THUMP!", soundIdx: 1, shake: 14 },
      { text: "BAM!", soundIdx: 2, shake: 20 },
      { text: "WHACK!", soundIdx: 3, shake: 26 },
      { text: "CRACK!", soundIdx: 4, shake: 34 }
    ];

    let currentHit = 0;

    const runHitStep = () => {
      if (currentHit >= hits.length) {
        this.breakPinata();
        return;
      }

      const hitData = hits[currentHit];
      currentHit++;
      this.app.audio.playHit(hitData.soundIdx);

      // On Hit 3, split open 3D cracked piñata
      if (currentHit === 3) {
        if (this.pinataIntactImg) this.pinataIntactImg.style.display = 'none';
        if (this.pinataCrackedImg) {
          this.pinataCrackedImg.style.display = 'block';
          this.pinataCrackedImg.style.opacity = '1';
        }
      }

      // Shaking pinata body
      if (this.pinataBody) {
        this.pinataBody.style.transform = `scale(${1 + currentHit * 0.06}) rotate(${currentHit % 2 === 0 ? 16 : -16}deg)`;
        setTimeout(() => {
          this.pinataBody.style.transform = 'scale(1) rotate(0deg)';
        }, 220);
      }

      // Comic hit text
      if (this.bamEffect) {
        this.bamEffect.textContent = hitData.text;
        this.bamEffect.style.left = '50%';
        this.bamEffect.style.bottom = `${360 - this.pinataCurrentY}px`;
        this.bamEffect.classList.add('pop');
        setTimeout(() => this.bamEffect.classList.remove('pop'), 500);
      }

      // Girl swinging bat with realistic follow-through motion
      this.girl.jumpAndSwing(105, true, () => {
        if (this.girl.swingBat) this.girl.swingBat();
      }, () => {
        setTimeout(runHitStep, 500);
      });
    };

    runHitStep();
  }

  // Pinata Shatter & 111 Doraemon Shower Pile Burial (Rule #15 - #19)
  breakPinata() {
    this.isBroken = true;
    if (this.boy) this.boy.reset();
    if (this.speechBubble) this.speechBubble.classList.remove('active');
    if (this.ropeIndicator) this.ropeIndicator.classList.remove('visible');
    if (this.mobileTapBtn) this.mobileTapBtn.classList.remove('visible');

    if (this.pinataRig) {
      this.pinataRig.style.opacity = '0';
      setTimeout(() => {
        this.pinataRig.style.display = 'none';
      }, 300);
    }

    const pinataX = window.innerWidth / 2;
    const pinataY = this.pinataCurrentY + 80;
    const girlCenterX = window.innerWidth / 2;
    const girlGroundY = window.innerHeight - 35;

    // Center the girl and switch to figure without the bat in hand
    if (this.girl && this.girl.container) {
      this.girl.showPose('stand');
      this.girl.hasBat = false;
      if (this.girl.batHand) {
        this.girl.batHand.style.opacity = '0';
        this.girl.batHand.style.display = 'none';
      }
      this.girl.container.style.transition = 'left 0.35s ease';
      this.girl.container.style.left = `${girlCenterX - 90}px`;
    }

    // Erupt exactly 111 3D vinyl Doraemon dolls in waves, accumulating into a dense triangular mound
    this.doraemon.startShower(pinataX, pinataY, girlCenterX, girlGroundY, () => {
      // 1. All figures have landed into the full mound covering the girl completely.
      // Move camera near before the girl pops out ("page moves near before the girls pops out")
      if (this.cameraFrame) {
        this.cameraFrame.classList.add('zoom-near');
      }

      // 2. Pause while zoomed in close to build anticipation
      setTimeout(() => {
        // 3. When girl pops out, a few figures from top roll to either side
        if (this.doraemon) {
          this.doraemon.rollTopDolls(girlCenterX, girlGroundY);
        }
        if (this.girl) {
          this.girl.peekOutFromPile();
        }

        // 4. Transparent Golden Birthday Arch pop-up with confetti celebration!
        setTimeout(() => {
          this.app.audio.playMood('reveal');
          if (window.birthdayParticles) {
            window.birthdayParticles.triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.32);
            window.birthdayParticles.triggerStarlightBurst();
          }
          if (this.goldenArchImg) {
            this.goldenArchImg.style.opacity = '1';
          }
          if (this.birthdayWishBanner) {
            this.birthdayWishBanner.style.opacity = '1';
          }
          if (this.birthdayRevealWrap) {
            this.birthdayRevealWrap.classList.add('visible');
          }
        }, 850);
      }, 1050);
    });
  }
}

window.PinataScene = PinataScene;
