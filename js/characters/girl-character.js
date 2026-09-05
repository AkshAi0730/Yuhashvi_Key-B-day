/**
 * ============================================================================
 * GIRL CHARACTER ENGINE (js/characters/girl-character.js)
 * Faithful to user-provided reference character:
 * - Voluminous dark curly/wavy hair cascading past shoulders
 * - Traditional royal purple kurti with golden embroidery & jewelry
 * - Bindi & cute anime chibi facial features
 * - 100% Transparent PNG asset (ZERO white boxes)
 * - Articulated animated states:
 *   IDLE, WALK, LOOK_UP, PICK_UP_BAT, JUMP_SWING, HIT_SWING, CONFUSED, BURIED, PEEK_OUT, SMILE, BLOW_CANDLE
 * ============================================================================
 */

class GirlCharacter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = 'IDLE';
    this.hasBat = false;
    this.idleAnimId = null;
    this.walkAnimId = null;

    this.defaultLeft = (this.container && this.container.style.left) || '-220px';
    this.initDOM();
    this.startIdle();
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="girl-puppet">
        <!-- Ground Contact Shadow -->
        <div class="girl-contact-shadow"></div>

        <!-- Main Body Wrapper (Transparent Reference Model) -->
        <div class="girl-torso-wrap">
          <img src="assets/characters/girl_standing.png" class="girl-char-img girl-img-stand" alt="Yuhashvi Standing" />
          <img src="assets/characters/girl_bat_stance.png" class="girl-char-img girl-img-bat" alt="Yuhashvi Bat Stance" style="display: none; opacity: 0;" />
          <img src="assets/characters/girl_swing_hit.png" class="girl-char-img girl-img-hit" alt="Yuhashvi Hit Swing" style="display: none; opacity: 0;" />
          
          <!-- Articulated Right Hand Bat Prop (fallback/prop) -->
          <div class="girl-bat-hand">
            <svg viewBox="0 0 60 120" width="48" height="96" class="bat-svg-prop">
              <defs>
                <linearGradient id="bat-wood" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#b8784a" />
                  <stop offset="50%" stop-color="#e3a778" />
                  <stop offset="100%" stop-color="#8c5127" />
                </linearGradient>
              </defs>
              <path d="M26,115 L26,95 C25,80 18,30 18,12 C18,4 32,4 32,12 C32,30 29,80 28,95 L28,115 Z" fill="url(#bat-wood)" stroke="#5e3415" stroke-width="1.5" />
              <rect x="24" y="96" width="6" height="18" rx="2" fill="#fff6ee" stroke="#d5beaf" stroke-width="0.8" />
            </svg>
          </div>

          <!-- Gentle Breath Particle Emitter for Candle Blow -->
          <div class="girl-breath-stream"></div>
        </div>
      </div>
    `;

    this.puppet = this.container.querySelector('.girl-puppet');
    this.torso = this.container.querySelector('.girl-torso-wrap');
    this.standImg = this.container.querySelector('.girl-img-stand');
    this.batImg = this.container.querySelector('.girl-img-bat');
    this.hitImg = this.container.querySelector('.girl-img-hit');
    this.batHand = this.container.querySelector('.girl-bat-hand');
    this.shadow = this.container.querySelector('.girl-contact-shadow');
    this.breathStream = this.container.querySelector('.girl-breath-stream');
  }

  showPose(pose) {
    if (!this.standImg || !this.batImg || !this.hitImg) return;
    this.standImg.style.display = (pose === 'stand') ? 'block' : 'none';
    this.standImg.style.opacity = (pose === 'stand') ? '1' : '0';

    this.batImg.style.display = (pose === 'bat') ? 'block' : 'none';
    this.batImg.style.opacity = (pose === 'bat') ? '1' : '0';

    this.hitImg.style.display = (pose === 'hit') ? 'block' : 'none';
    this.hitImg.style.opacity = (pose === 'hit') ? '1' : '0';
  }

  // Idle Animation: subtle natural breathing, gentle floating hair motion, weight shifting
  startIdle() {
    this.state = 'IDLE';
    let step = 0;

    const idleLoop = () => {
      if (this.state !== 'IDLE') return;
      step += 0.045;

      const breathY = Math.sin(step) * 2;
      const breathScaleY = 1 + Math.sin(step) * 0.012;
      const sway = Math.sin(step * 0.6) * 1.2;

      if (this.torso) {
        this.torso.style.transform = `translateY(${breathY}px) scaleY(${breathScaleY}) rotate(${sway}deg)`;
      }
      if (this.shadow) {
        const shadowScale = 1 - Math.sin(step) * 0.04;
        this.shadow.style.transform = `scale(${shadowScale})`;
      }

      this.idleAnimId = requestAnimationFrame(idleLoop);
    };

    idleLoop();
  }

  // Walking cycle: authentic leg/body bounce, tilt, stride steps, and hair inertia
  walkTo(targetX, durationMs, onComplete) {
    this.state = 'WALK';
    if (this.idleAnimId) cancelAnimationFrame(this.idleAnimId);

    const startX = parseFloat(this.container.style.left) || -220;
    const startTime = performance.now();

    const walkLoop = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Natural ease-out
      const easeProgress = progress * (2 - progress);

      const currentX = startX + (targetX - startX) * easeProgress;
      this.container.style.left = `${currentX}px`;

      // 2-Phase walking gait: body lifts and tilts side to side with footfalls
      const stepAngle = Math.sin(elapsed * 0.014) * 4;
      const stepBobY = Math.abs(Math.sin(elapsed * 0.014)) * 7;

      if (this.torso) {
        this.torso.style.transform = `translateY(${-stepBobY}px) rotate(${stepAngle}deg)`;
      }
      if (this.shadow) {
        this.shadow.style.transform = `scale(${1 - stepBobY * 0.03})`;
      }

      if (progress < 1) {
        this.walkAnimId = requestAnimationFrame(walkLoop);
      } else {
        if (this.torso) this.torso.style.transform = 'none';
        if (this.shadow) this.shadow.style.transform = 'none';
        this.startIdle();
        if (onComplete) onComplete();
      }
    };

    this.walkAnimId = requestAnimationFrame(walkLoop);
  }

  // Look upward toward hanging piñata
  lookUp(onComplete) {
    this.state = 'LOOK_UP';
    if (this.torso) {
      this.torso.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)';
      this.torso.style.transform = 'translateY(-6px) rotate(-5deg) scale(1.02)';
    }
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 700);
  }

  // Pick up baseball bat from ground: bend down, grab bat, stand up into batting stance
  pickUpBat(onComplete) {
    this.state = 'PICK_UP_BAT';
    if (this.idleAnimId) cancelAnimationFrame(this.idleAnimId);

    // 1. Bend / reach down toward bat
    if (this.torso) {
      this.torso.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      this.torso.style.transform = 'translateY(36px) rotate(14deg) scaleY(0.9)';
    }
    if (this.shadow) {
      this.shadow.style.transform = 'scale(1.15)';
    }

    // 2. Grip bat and stand up
    setTimeout(() => {
      this.hasBat = true;
      const batGroundProp = document.getElementById('bat-prop');
      if (batGroundProp) {
        batGroundProp.style.display = 'none';
        batGroundProp.style.opacity = '0';
      }

      this.showPose('bat');

      if (this.torso) {
        this.torso.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.3, 1)';
        this.torso.style.transform = 'translateY(0) rotate(0deg) scale(1)';
      }

      setTimeout(() => {
        this.startIdle();
        if (onComplete) onComplete();
      }, 550);
    }, 500);
  }

  // Genuine Jump Swing: Crouch -> Spring up -> Apex bat swing -> Land & recover
  jumpAndSwing(jumpHeightPx, isReachable, onApex, onComplete) {
    this.state = 'JUMP_SWING';
    if (this.idleAnimId) cancelAnimationFrame(this.idleAnimId);

    // 1. Crouch anticipation
    if (this.torso) {
      this.torso.style.transition = 'transform 0.22s ease-in';
      this.torso.style.transform = 'translateY(26px) scaleY(0.88)';
    }
    if (this.shadow) {
      this.shadow.style.transform = 'scale(1.25)';
    }

    setTimeout(() => {
      // 2. Spring up to apex
      if (this.torso) {
        this.torso.style.transition = `transform 0.38s cubic-bezier(0.2, 0.8, 0.3, 1)`;
        this.torso.style.transform = `translateY(-${jumpHeightPx}px) scaleY(1.08)`;
      }
      if (this.shadow) {
        this.shadow.style.transition = 'transform 0.38s ease-out, opacity 0.38s ease';
        this.shadow.style.transform = 'scale(0.55)';
        this.shadow.style.opacity = '0.35';
      }

      // 3. Apex swing & contact
      setTimeout(() => {
        if (isReachable) {
          this.showPose('hit');
        }
        if (onApex) onApex();

        // 4. Descend & Land with impact cushion
        setTimeout(() => {
          if (isReachable) {
            this.showPose('bat');
          }
          if (this.torso) {
            this.torso.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.8, 0.5)';
            this.torso.style.transform = 'translateY(14px) scaleY(0.92)';
          }
          if (this.shadow) {
            this.shadow.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease';
            this.shadow.style.transform = 'scale(1.15)';
            this.shadow.style.opacity = '0.8';
          }

          // 5. Recovery to stance
          setTimeout(() => {
            if (this.torso) {
              this.torso.style.transition = 'transform 0.22s ease-out';
              this.torso.style.transform = 'translateY(0) scaleY(1)';
            }
            if (this.shadow) {
              this.shadow.style.transform = 'scale(1)';
            }
            this.startIdle();
            if (onComplete) onComplete();
          }, 240);
        }, 300);
      }, 320);
    }, 240);
  }

  // Reaction after missing: cute frustrated head shake & pout
  showConfusion(onComplete) {
    this.state = 'CONFUSED';
    if (this.torso) {
      this.torso.style.transition = 'transform 0.35s ease';
      this.torso.style.transform = 'rotate(6deg) translateY(4px)';
    }
    setTimeout(() => {
      if (this.torso) this.torso.style.transform = 'rotate(-6deg) translateY(4px)';
      setTimeout(() => {
        if (this.torso) this.torso.style.transform = 'none';
        this.startIdle();
        if (onComplete) onComplete();
      }, 350);
    }, 350);
  }

  // Girl peeking out from the Doraemon pile (Specs 28 & 39)
  peekOutFromPile(onComplete) {
    this.state = 'PEEK_OUT';
    if (this.container) {
      this.container.style.transition = 'transform 1.1s cubic-bezier(0.2, 0.8, 0.3, 1)';
      // Head peeks up out of the doll pile
      this.container.style.transform = 'translateY(-55px)';
    }
    // Looks left
    setTimeout(() => {
      if (this.torso) {
        this.torso.style.transition = 'transform 0.45s ease';
        this.torso.style.transform = 'rotate(-10deg)';
      }
      // Looks right
      setTimeout(() => {
        if (this.torso) this.torso.style.transform = 'rotate(10deg)';
        // Smiles warmly!
        setTimeout(() => {
          if (this.torso) this.torso.style.transform = 'rotate(0deg) scale(1.03)';
          if (onComplete) onComplete();
        }, 600);
      }, 550);
    }, 850);
  }

  // Candle blowing animation for Final Birthday Scene (Specs 42 & 54)
  blowCandle(onComplete) {
    this.state = 'BLOW_CANDLE';
    // Lean toward cake
    if (this.torso) {
      this.torso.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.3, 1)';
      this.torso.style.transform = 'translateY(10px) rotate(8deg) scale(1.02)';
    }

    // Emit gentle breath stream particles
    if (this.breathStream) {
      this.breathStream.classList.add('active');
    }

    setTimeout(() => {
      if (this.breathStream) this.breathStream.classList.remove('active');
      // Return to peaceful happy wish pose
      if (this.torso) {
        this.torso.style.transition = 'transform 0.6s ease-out';
        this.torso.style.transform = 'translateY(0) rotate(0deg) scale(1)';
      }
      if (onComplete) onComplete();
    }, 850);
  }

  reset() {
    this.state = 'IDLE';
    this.hasBat = false;
    this.showPose('stand');
    if (this.batHand) {
      this.batHand.style.opacity = '0';
      this.batHand.style.transform = 'rotate(0deg)';
    }
    if (this.container) {
      this.container.style.left = this.defaultLeft;
      this.container.style.transform = 'none';
    }
    if (this.torso) {
      this.torso.style.transform = 'none';
      this.torso.style.transition = 'none';
    }
    if (this.shadow) {
      this.shadow.style.transform = 'none';
      this.shadow.style.opacity = '0.8';
    }
    this.startIdle();
  }
}

window.GirlCharacter = GirlCharacter;
