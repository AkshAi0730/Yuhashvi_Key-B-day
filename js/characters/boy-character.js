/**
 * ============================================================================
 * ARTICULATED 3D CHIBI BOY CHARACTER ENGINE (js/characters/boy-character.js)
 * Uses high-resolution transparent 3D chibi boy assets:
 * - boy_peeking.png: Peeking around the corner smiling excitedly
 * - boy_throwing_bat.png: Leaning forward launching the bat
 * Coordinates realistic bat toss trajectory arc, comic BAM!, and retreat.
 * ============================================================================
 */

class BoyCharacter {
  constructor(containerId, batId) {
    this.container = document.getElementById(containerId);
    this.batElement = document.getElementById(batId);
    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="boy-puppet-wrap">
        <img src="assets/characters/boy_peeking.png" id="boy-img-peek" class="boy-char-img boy-img-peek" alt="Boy Peeking" />
        <img src="assets/characters/boy_throwing_bat.png" id="boy-img-throw" class="boy-char-img boy-img-throw" alt="Boy Throwing" />
      </div>
    `;

    this.peekImg = this.container.querySelector('#boy-img-peek');
    this.throwImg = this.container.querySelector('#boy-img-throw');
    this.puppetWrap = this.container.querySelector('.boy-puppet-wrap');
    this.reset();
  }

  // Peek in, wind up / throw bat across scene, and retreat (Specs 10, 11)
  performThrowSequence(targetLandingX, onBamSound, onComplete) {
    if (!this.container || !this.puppetWrap) return;

    // 1. Peek from left edge into scene
    if (this.peekImg) this.peekImg.style.opacity = '1';
    if (this.throwImg) this.throwImg.style.opacity = '0';
    this.puppetWrap.style.transition = 'transform 0.75s cubic-bezier(0.2, 0.8, 0.3, 1)';
    this.puppetWrap.style.transform = 'translateX(-35px)';

    setTimeout(() => {
      // 2. Snap into throw pose
      if (this.peekImg) this.peekImg.style.opacity = '0';
      if (this.throwImg) this.throwImg.style.opacity = '1';
      this.puppetWrap.style.transition = 'transform 0.25s ease-out';
      this.puppetWrap.style.transform = 'translateX(-10px) scale(1.02)';

      // 3. Launch the bat flying across the screen
      this.launchBat(targetLandingX, onBamSound);

      // 4. Return to peek / wave pose then retreat off-screen
      setTimeout(() => {
        if (this.peekImg) this.peekImg.style.opacity = '1';
        if (this.throwImg) this.throwImg.style.opacity = '0';

        setTimeout(() => {
          this.puppetWrap.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          this.puppetWrap.style.transform = 'translateX(-260px)';
          if (onComplete) onComplete();
        }, 500);
      }, 700);
    }, 850);
  }

  launchBat(landingX, onBamSound) {
    if (!this.batElement) return;

    const startX = 90;
    const startY = 130;
    const peakY = 40;
    const groundY = 220;

    this.batElement.style.display = 'block';
    this.batElement.style.opacity = '1';
    this.batElement.style.left = `${startX}px`;
    this.batElement.style.top = `${startY}px`;

    const duration = 850; // Relaxed graceful throw
    const startTime = performance.now();

    const batFlight = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Parabolic flight arc
      const currentX = startX + (landingX - startX) * progress;
      const currentY = groundY - 4 * (groundY - peakY) * progress * (1 - progress);
      const rotation = progress * 720; // 2 full spins

      this.batElement.style.left = `${currentX}px`;
      this.batElement.style.top = `${currentY}px`;
      this.batElement.style.transform = `rotate(${rotation}deg)`;

      if (progress < 1) {
        requestAnimationFrame(batFlight);
      } else {
        // Lands beside girl with BAM! (rests naturally like bat next to boy)
        this.batElement.style.top = `${groundY}px`;
        this.batElement.style.transform = 'rotate(18deg)';
        if (onBamSound) onBamSound();
      }
    };

    requestAnimationFrame(batFlight);
  }

  reset() {
    if (this.puppetWrap) {
      this.puppetWrap.style.transition = 'none';
      this.puppetWrap.style.transform = 'translateX(-260px)';
    }
    if (this.peekImg) this.peekImg.style.opacity = '1';
    if (this.throwImg) this.throwImg.style.opacity = '0';
    if (this.batElement) {
      this.batElement.style.display = 'none';
      this.batElement.style.opacity = '0';
      this.batElement.style.transform = 'none';
    }
  }
}

window.BoyCharacter = BoyCharacter;
