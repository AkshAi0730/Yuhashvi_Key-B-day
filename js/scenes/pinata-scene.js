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
    this.pinataBody = document.getElementById('pinata-body');
    this.pinataIntactImg = document.getElementById('pinata-img-intact');
    this.pinataCrackedImg = document.getElementById('pinata-img-cracked');
    this.moundWrap = document.getElementById('mound-overlay-wrap');
    this.moundFullImg = document.getElementById('mound-img-full');
    this.girlPeekImg = document.getElementById('girl-img-peek');
    this.girlRevealImg = document.getElementById('girl-img-reveal');
    this.ropeIndicator = document.getElementById('rope-indicator');
    this.mobileTapBtn = document.getElementById('btn-mobile-tap');
    this.bamEffect = document.getElementById('bam-effect');
    this.speechBubble = document.getElementById('speech-bubble');
    this.birthdayRevealWrap = document.getElementById('birthday-reveal-wrap');
    this.btnContinuePage2 = document.getElementById('btn-continue-page2');

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

    if (this.pinataIntactImg) {
      this.pinataIntactImg.style.display = 'block';
      this.pinataIntactImg.style.opacity = '1';
    }
    if (this.pinataCrackedImg) {
      this.pinataCrackedImg.style.display = 'none';
      this.pinataCrackedImg.style.opacity = '0';
    }
    if (this.moundWrap) this.moundWrap.classList.remove('active');
    if (this.moundFullImg) this.moundFullImg.style.opacity = '0';
    if (this.girlPeekImg) this.girlPeekImg.style.opacity = '0';
    if (this.girlRevealImg) this.girlRevealImg.style.opacity = '0';

    if (this.pinataRig) {
      this.pinataRig.style.transform = `translateX(-50%) translateY(${this.pinataCurrentY}px)`;
      this.pinataRig.style.display = 'flex';
      this.pinataRig.style.opacity = '1';
    }
  }

  // Sequenced Story Arc (Specs 19 - 41)
  startStorySequence() {
    // 1. Girl enters walking from left with authentic gait and hair inertia
    const targetCenterX = window.innerWidth / 2 - 90;
    setTimeout(() => {
      this.girl.walkTo(targetCenterX, 3200, () => {
        // 2. Girl stops in center and looks up at the pinata
        setTimeout(() => {
          this.girl.lookUp(() => {
            // 3. Boy peeks from left, reacts, and throws baseball bat
            setTimeout(() => {
              this.boy.performThrowSequence(targetCenterX + 60, () => {
                // Comic BAM! sound & visual effect
                this.app.audio.playBam();
                if (this.bamEffect) {
                  this.bamEffect.style.left = `${targetCenterX + 40}px`;
                  this.bamEffect.style.bottom = '110px';
                  this.bamEffect.classList.add('pop');
                  setTimeout(() => this.bamEffect.classList.remove('pop'), 700);
                }
              }, () => {
                // 4. Girl notices bat, bends down, picks it up, stands up
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

    if (this.pinataRig) {
      this.pinataRig.style.transform = `translateX(-50%) translateY(${this.pinataCurrentY}px)`;
    }

    // Reachable threshold
    if (this.pinataCurrentY >= 195) {
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

      // Girl swinging bat
      this.girl.jumpAndSwing(105, true, null, () => {
        setTimeout(runHitStep, 500);
      });
    };

    runHitStep();
  }

  // Pinata Shatter & 100 Doraemon Shower Pile Burial
  breakPinata() {
    this.isBroken = true;
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

    // Erupt 100 transparent Doraemon dolls in waves, burying the girl in a 3D mound
    this.doraemon.startShower(pinataX, pinataY, girlCenterX, girlGroundY, () => {
      // Short comedic pause while she is buried (Spec 27)
      setTimeout(() => {
        // Girl emerges smiling from the Doraemon doll pile! (Spec 28)
        if (this.girlPeekImg) {
          this.girlPeekImg.style.opacity = '1';
        }
        if (this.moundFullImg) {
          this.moundFullImg.style.opacity = '0';
        }

        // Birthday Reveal Arch: "HAPPY BIRTHDAY YUHASVI" (Spec 29)
        setTimeout(() => {
          this.app.audio.playMood('reveal');
          if (window.birthdayParticles) {
            window.birthdayParticles.triggerStarlightBurst();
          }
          if (this.girlRevealImg) {
            this.girlRevealImg.style.opacity = '1';
          }
          if (this.girlPeekImg) {
            this.girlPeekImg.style.opacity = '0';
          }
          if (this.birthdayRevealWrap) {
            this.birthdayRevealWrap.classList.add('visible');
          }
        }, 1200);
      }, 1200);
    });

    // Fade in 3D Doraemon Mound as dolls cascade down
    setTimeout(() => {
      if (this.moundWrap) this.moundWrap.classList.add('active');
      if (this.moundFullImg) this.moundFullImg.style.opacity = '1';
      if (this.girl) this.girl.showPose('none');
    }, 1600);
  }
}

window.PinataScene = PinataScene;
