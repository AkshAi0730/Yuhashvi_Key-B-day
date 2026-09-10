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
    this.cursorPrompt = document.getElementById('pinata-cursor-prompt');
    this.cursorPromptText = this.cursorPrompt ? this.cursorPrompt.querySelector('.prompt-text') : null;

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
    this.attemptTimer = null;
    this.mouseX = undefined;
    this.mouseY = undefined;

    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundSceneClick = this.onSceneClick.bind(this);
    this.boundWindowMouseLeave = this.onWindowMouseLeave.bind(this);

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

    if (cfg && cfg.tapPrompt && this.cursorPromptText) {
      this.cursorPromptText.textContent = cfg.tapPrompt;
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

    if (this.el) {
      this.el.addEventListener('click', this.boundSceneClick);
    }
  }

  enter() {
    this.resetScene();
    this.sceneActive = true;
    this.startStorySequence();
  }

  leave() {
    this.sceneActive = false;
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('touchmove', this.boundTouchMove);
    window.removeEventListener('mouseleave', this.boundWindowMouseLeave);
    if (this.physicsRaf) {
      cancelAnimationFrame(this.physicsRaf);
      this.physicsRaf = null;
    }
    if (this.attemptTimer) {
      clearTimeout(this.attemptTimer);
      this.attemptTimer = null;
    }
    this.isInteractive = false;
    this.isHitting = false;
    this.updateCursorPromptVisibility();

    // Immediately stop & reset character states
    if (this.girl) this.girl.reset();
    if (this.boy) this.boy.reset();
    if (this.doraemon) this.doraemon.reset();
  }

  resetScene() {
    this.leave();
    this.hitCount = 0;
    this.isHitting = false;
    this.isBroken = false;
    this.isReachable = false;
    this.pinataTargetY = 45;
    this.pinataCurrentY = 45;
    this.mouseX = undefined;
    this.mouseY = undefined;

    if (this.cursorPrompt) this.cursorPrompt.classList.remove('visible');

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
    if (!this.sceneActive) return;
    // 1. Girl enters walking from RIGHT to LEFT, stopping directly at her hitting stance beside piñata
    const isMobile = window.innerWidth <= 900;
    const hitX = Math.round(window.innerWidth / 2 - (isMobile ? 150 : 210));

    setTimeout(() => {
      if (!this.sceneActive) return;
      this.girl.walkTo(hitX, 4000, () => {
        if (!this.sceneActive) return;
        // 2. Girl stops directly at her hitting position beside piñata and looks up
        setTimeout(() => {
          if (!this.sceneActive) return;
          this.girl.lookUp(() => {
            if (!this.sceneActive) return;
            // 3. Boy peeks from left, reacts, and throws baseball bat safely to the RIGHT side of the girl on the grass
            setTimeout(() => {
              if (!this.sceneActive) return;
              const safeLandingX = Math.round(hitX + (isMobile ? 120 : 155)); // Right side of the girl!
              this.boy.performThrowSequence(safeLandingX, () => {
                if (!this.sceneActive) return;
                // Comic BAM! sound & visual effect on girl's right
                this.app.audio.playBam();
                if (this.bamEffect) {
                  this.bamEffect.textContent = 'BAM!';
                  this.bamEffect.style.left = `${safeLandingX - 10}px`;
                  this.bamEffect.style.bottom = '110px';
                  this.bamEffect.classList.add('pop');
                  setTimeout(() => {
                    if (this.bamEffect) this.bamEffect.classList.remove('pop');
                  }, 700);
                }
              }, () => {
                if (!this.sceneActive) return;
                // 4. Girl notices bat on her right, bends down, picks it up, stands up in stance
                setTimeout(() => {
                  if (!this.sceneActive) return;
                  this.girl.pickUpBat(() => {
                    if (!this.sceneActive) return;
                    // 5. Girl tries 3 jumping swings that miss (relaxed pacing)
                    setTimeout(() => {
                      if (!this.sceneActive) return;
                      this.executeMissJumps();
                    }, 700);
                  });
                }, 450);
              });
            }, 700);
          });
        }, 500);
      });
    }, 400);
  }

  // 3 Jumping Misses with crouching, jumping, swinging, and confusion
  executeMissJumps() {
    if (!this.sceneActive) return;
    // Miss 1
    this.app.audio.playWhoosh();
    this.girl.jumpAndSwing(70, false, null, () => {
      if (!this.sceneActive) return;
      this.girl.showConfusion(() => {
        if (!this.sceneActive) return;
        // Miss 2
        setTimeout(() => {
          if (!this.sceneActive) return;
          this.app.audio.playWhoosh();
          this.girl.jumpAndSwing(85, false, null, () => {
            if (!this.sceneActive) return;
            this.girl.showConfusion(() => {
              if (!this.sceneActive) return;
              // Miss 3 (still too high!)
              setTimeout(() => {
                if (!this.sceneActive) return;
                this.app.audio.playWhoosh();
                this.girl.jumpAndSwing(95, false, null, () => {
                  if (!this.sceneActive) return;
                  // Speech bubble: "Help me! 🥺"
                  if (this.speechBubble) {
                    this.speechBubble.textContent = "Help me! 🥺";
                    this.speechBubble.classList.add('active');
                  }

                  // Shooting star arrives to unlock interactive control
                  setTimeout(() => {
                    if (!this.sceneActive) return;
                    this.triggerHelpArrival();
                  }, 1200);
                });
              }, 600);
            });
          });
        }, 600);
      });
    });
  }

  triggerHelpArrival() {
    this.app.audio.playShootingStar();
    if (window.birthdayParticles) {
      window.birthdayParticles.triggerShootingStar(() => {
        if (this.speechBubble) this.speechBubble.classList.remove('active');

        // Cascade magical starlight particles down the rope
        const ropeRect = this.pinataRope ? this.pinataRope.getBoundingClientRect() : null;
        const ropeX = ropeRect ? (ropeRect.left + ropeRect.width / 2) : (window.innerWidth / 2);
        const startY = 0;
        const endY = this.pinataCurrentY + 70;

        window.birthdayParticles.triggerRopeStarlight(ropeX, startY, endY, () => {
          if (this.pinataRope) {
            this.pinataRope.classList.add('starlight-infused');
          }
          if (this.ropeIndicator) {
            const txt = this.ropeIndicator.querySelector('.rope-indicator-text');
            if (txt) txt.textContent = "Pull rope with mouse to move piñata! ✨";
            this.ropeIndicator.classList.add('visible');
          }
          this.enableInteractivePinata();
        });
      });
    } else {
      this.enableInteractivePinata();
    }
  }

  // Core Mechanic: Mouse / Touch Vertical Control (TOP moves pinata DOWN, BOTTOM moves pinata UP)
  enableInteractivePinata() {
    this.isInteractive = true;
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    window.addEventListener('mouseleave', this.boundWindowMouseLeave);

    this.updatePhysics();
    this.startContinuousGirlJumping();
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this.isInteractive || this.isBroken) {
      this.updateCursorPromptVisibility();
      return;
    }
    const windowH = window.innerHeight;
    // Inverted vertical control: Mouse near TOP -> pinata moves DOWN; near BOTTOM -> UP
    const invertedRatio = 1 - Math.min(Math.max(e.clientY / windowH, 0), 1);
    this.pinataTargetY = this.minY + invertedRatio * (this.maxY - this.minY);

    this.positionCursorPrompt(e.clientX, e.clientY);
    this.updateCursorPromptVisibility();
  }

  onTouchMove(e) {
    if (!this.isInteractive || this.isBroken) return;
    if (e.touches && e.touches.length > 0) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      this.mouseX = touchX;
      this.mouseY = touchY;

      const windowH = window.innerHeight;
      const invertedRatio = 1 - Math.min(Math.max(touchY / windowH, 0), 1);
      this.pinataTargetY = this.minY + invertedRatio * (this.maxY - this.minY);

      this.positionCursorPrompt(touchX, touchY);
      this.updateCursorPromptVisibility();
    }
  }

  onWindowMouseLeave() {
    if (this.cursorPrompt) {
      this.cursorPrompt.classList.remove('visible');
    }
  }

  positionCursorPrompt(x, y) {
    if (!this.cursorPrompt) return;
    const promptW = 185;
    const promptH = 38;

    let targetX = x + 16;
    let targetY = y + 16;

    // Flip to left of cursor if near right edge
    if (targetX + promptW > window.innerWidth - 12) {
      targetX = x - promptW - 12;
    }
    // Flip above cursor if near bottom edge
    if (targetY + promptH > window.innerHeight - 12) {
      targetY = y - promptH - 12;
    }

    targetX = Math.max(8, targetX);
    targetY = Math.max(8, targetY);

    this.cursorPrompt.style.left = `${targetX}px`;
    this.cursorPrompt.style.top = `${targetY}px`;
  }

  updateCursorPromptVisibility() {
    if (!this.cursorPrompt) return;
    const canReachAndHit = this.sceneActive &&
                           this.isInteractive &&
                           this.isReachable &&
                           !this.isHitting &&
                           !this.isBroken;

    if (canReachAndHit) {
      if (this.mouseX !== undefined && this.mouseY !== undefined) {
        this.positionCursorPrompt(this.mouseX, this.mouseY);
      }
      this.cursorPrompt.classList.add('visible');
    } else {
      this.cursorPrompt.classList.remove('visible');
    }
  }

  onSceneClick(e) {
    if (!this.isInteractive || this.isBroken || this.isHitting) return;
    if (e.target && e.target.closest('#btn-continue-page2')) return;
    if (this.isReachable) {
      this.executeHitSequence();
    }
  }

  updatePhysics() {
    if (!this.isInteractive && !this.isBroken) return;

    // Smooth relaxed elastic spring delay (0.08 for natural floating inertia)
    this.pinataCurrentY += (this.pinataTargetY - this.pinataCurrentY) * 0.08;

    // Continuous ceiling-anchored rope extension & subtraction
    if (this.pinataRope) {
      this.pinataRope.style.height = `${this.pinataCurrentY + 70}px`;
    }

    // Reachable strike threshold >= 190
    if (this.pinataCurrentY >= 190) {
      if (!this.isReachable) {
        this.isReachable = true;
        if (this.mobileTapBtn) this.mobileTapBtn.classList.add('visible');
        if (this.speechBubble) this.speechBubble.classList.remove('active');
        this.updateCursorPromptVisibility();
      }
    } else {
      if (this.isReachable) {
        this.isReachable = false;
        if (this.mobileTapBtn) this.mobileTapBtn.classList.remove('visible');
        this.updateCursorPromptVisibility();
      }
    }

    if (!this.isBroken) {
      this.physicsRaf = requestAnimationFrame(() => this.updatePhysics());
    }
  }

  startContinuousGirlJumping() {
    if (this.isBroken) return;
    this.attemptCycle();
  }

  attemptCycle() {
    if (this.isBroken || !this.isInteractive || this.isHitting) {
      if (!this.isBroken && this.isInteractive) {
        this.scheduleAttemptCycle(600);
      }
      return;
    }

    if (this.isReachable) {
      this.performHit();
    } else {
      this.performMiss();
    }
  }

  scheduleAttemptCycle(delay) {
    if (this.attemptTimer) {
      clearTimeout(this.attemptTimer);
      this.attemptTimer = null;
    }
    if (!this.isBroken && this.isInteractive) {
      this.attemptTimer = setTimeout(() => this.attemptCycle(), delay);
    }
  }

  performHit() {
    if (this.isBroken || !this.isInteractive || this.isHitting || !this.isReachable) return;

    if (this.attemptTimer) {
      clearTimeout(this.attemptTimer);
      this.attemptTimer = null;
    }

    const hitsData = [
      { text: (window.BIRTHDAY_CONFIG?.pinataScene?.hit1Text) || "THUMP!", soundIdx: 1, shake: 16 },
      { text: (window.BIRTHDAY_CONFIG?.pinataScene?.hit2Text) || "BAM!", soundIdx: 2, shake: 22 },
      { text: (window.BIRTHDAY_CONFIG?.pinataScene?.hit3Text) || "WHACK!", soundIdx: 3, shake: 28 },
      { text: (window.BIRTHDAY_CONFIG?.pinataScene?.hit4Text) || "CRACK!", soundIdx: 4, shake: 36 }
    ];

    this.isHitting = true;
    this.updateCursorPromptVisibility();
    if (this.speechBubble) this.speechBubble.classList.remove('active');

    this.girl.jumpAndSwing(105, true, () => {
      // Apex of swing: Bat contacts piñata!
      if (this.girl.swingBat) this.girl.swingBat();

      this.hitCount++;
      const currentHitIdx = Math.min(this.hitCount - 1, hitsData.length - 1);
      const hitInfo = hitsData[currentHitIdx];

      this.app.audio.playHit(hitInfo.soundIdx);

      // On Hit 3: split open cracked piñata
      if (this.hitCount === 3) {
        if (this.pinataIntactImg) this.pinataIntactImg.style.display = 'none';
        if (this.pinataCrackedImg) {
          this.pinataCrackedImg.style.display = 'block';
          this.pinataCrackedImg.style.opacity = '1';
        }
      }

      // Physical pendulum swing: Entire rig attached to ceiling rope swings in harmonic motion
      if (this.pinataRig) {
        this.pinataRig.classList.remove('pendulum-swing');
        void this.pinataRig.offsetWidth; // Reflow to restart animation on successive hits
        this.pinataRig.classList.add('pendulum-swing');
      }

      // Dynamic scale pulse on pinata body upon bat impact
      if (this.pinataBody) {
        this.pinataBody.style.transform = `scale(${1 + this.hitCount * 0.05})`;
        setTimeout(() => {
          if (this.pinataBody) this.pinataBody.style.transform = 'scale(1)';
        }, 240);
      }

      // Comic hit text pop
      if (this.bamEffect) {
        this.bamEffect.textContent = hitInfo.text;
        this.bamEffect.style.left = '50%';
        this.bamEffect.style.bottom = `${360 - this.pinataCurrentY}px`;
        this.bamEffect.classList.add('pop');
        setTimeout(() => this.bamEffect.classList.remove('pop'), 600);
      }
    }, () => {
      // Jump completed & girl lands back on ground
      this.isHitting = false;

      if (this.hitCount >= 4) {
        this.breakPinata();
      } else {
        this.updateCursorPromptVisibility();
        // Player keeps controlling! Relaxed interval before next swing attempt
        this.scheduleAttemptCycle(1200);
      }
    });
  }

  performMiss() {
    if (this.isBroken || !this.isInteractive || this.isHitting || this.isReachable) return;

    if (this.attemptTimer) {
      clearTimeout(this.attemptTimer);
      this.attemptTimer = null;
    }

    this.isHitting = true;
    this.updateCursorPromptVisibility();

    this.girl.jumpAndSwing(75, false, () => {
      this.app.audio.playWhoosh();
    }, () => {
      this.isHitting = false;
      this.updateCursorPromptVisibility();

      // If after 1 or 2 hits (or anytime it cannot reach), girl tells player:
      if (this.speechBubble && !this.isReachable && !this.isBroken) {
        this.speechBubble.textContent = "Let me break it! I need to see what's inside! 🥺💖";
        this.speechBubble.classList.add('active');
      }

      this.scheduleAttemptCycle(1400);
    });
  }

  // Fallback / direct trigger for click on pinata, scene, or mobile tap button
  executeHitSequence() {
    if (this.isBroken || this.isHitting || !this.isReachable) return;
    this.performHit();
  }

  // Pinata Shatter & 111 Doraemon Shower Pile Burial (Rule #15 - #19)
  breakPinata() {
    this.isBroken = true;
    if (this.attemptTimer) {
      clearTimeout(this.attemptTimer);
      this.attemptTimer = null;
    }
    if (this.cursorPrompt) this.cursorPrompt.classList.remove('visible');
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
