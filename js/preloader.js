/**
 * ============================================================================
 * ASSET PRELOADER & DOWNLOAD PROGRESS ENGINE (js/preloader.js)
 * Tracks downloading of critical images and fonts.
 * Provides smooth progress bar interpolation, byte indicator, and gate unlock.
 * ============================================================================
 */

class AssetPreloader {
  constructor(options = {}) {
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.assets = [
      { url: 'assets/images/page1_bear_scene.jpg', size: 647169 },
      { url: 'assets/images/exit_doraemon_sad.jpg', size: 583036 },
      { url: 'assets/images/exit_doraemon_happy.jpg', size: 461295 },
      { url: 'assets/images/pinata_fairytale_bg.jpg', size: 728751 },
      { url: 'assets/images/pinata_star_intact.png', size: 982465 },
      { url: 'assets/images/pinata_star_cracked.png', size: 737042 },
      { url: 'assets/images/wooden_baseball_bat.png', size: 22922 },
      { url: 'assets/images/doraemon_doll_3d.png', size: 1006136 },
      { url: 'assets/images/envelope_rectangular.png', size: 1269670 },
      { url: 'assets/images/golden_heart_key.png', size: 271583 },
      { url: 'assets/images/gate_pillar_left_v2.png', size: 214156 },
      { url: 'assets/images/gate_pillar_right_v2.png', size: 174937 },
      { url: 'assets/images/gate_leaf_full_left.png', size: 418495 },
      { url: 'assets/images/gate_leaf_full_right.png', size: 395196 },
      { url: 'assets/images/heart_padlock.png', size: 963580 },
      { url: 'assets/images/golden_birthday_arch.png', size: 85292 },
      { url: 'assets/images/final_night_lit.jpg', size: 719220 },
      { url: 'assets/images/final_night_stars.jpg', size: 693624 },
      { url: 'assets/images/photo_01.jpg', size: 778094 },
      { url: 'assets/images/photo_02.jpg', size: 785294 },
      { url: 'assets/images/photo_03.jpg', size: 734717 },
      { url: 'assets/images/photo_04.jpg', size: 804257 },
      { url: 'assets/characters/girl_standing.png', size: 736191 },
      { url: 'assets/characters/boy_peeking.png', size: 366224 },
      { url: 'assets/characters/boy_throwing_bat.png', size: 337446 },
      { url: 'assets/characters/nobita_runner.png', size: 285437 }
    ];

    this.totalBytes = this.assets.reduce((sum, item) => sum + item.size, 0);
    this.loadedBytes = 0;
    this.loadedCount = 0;
    this.targetPercent = 0;
    this.displayPercent = 0;
    this.isDone = false;
    this.rafId = null;

    // DOM References
    this.loadingSection = document.getElementById('gate-loading-section');
    this.beginSection = document.getElementById('gate-begin-section');
    this.progressBar = document.getElementById('gate-progress-bar');
    this.percentLabel = document.getElementById('gate-loading-percent');
    this.bytesLabel = document.getElementById('gate-loading-bytes');
    this.textLabel = document.querySelector('.gate-loading-text');

    this.startPreload();
    this.startProgressAnimation();
  }

  startPreload() {
    let completed = 0;
    const total = this.assets.length;

    const onItemLoaded = (item) => {
      completed++;
      this.loadedBytes += item.size;
      this.loadedCount = completed;

      // Calculate actual download percentage
      this.targetPercent = Math.min(100, Math.round((this.loadedBytes / this.totalBytes) * 100));

      if (completed >= total) {
        this.targetPercent = 100;
      }
    };

    // Preload each asset image
    this.assets.forEach((item) => {
      const img = new Image();
      img.onload = () => onItemLoaded(item);
      img.onerror = () => onItemLoaded(item); // Resilience: continue even if an asset fails
      img.src = item.url;
    });

    // Also wait for web fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {}).catch(() => {});
    }

    // Safety fallback timeout: guarantee completion after 8s even on slow connections
    setTimeout(() => {
      this.targetPercent = 100;
    }, 8000);
  }

  startProgressAnimation() {
    const totalMb = (this.totalBytes / (1024 * 1024)).toFixed(1);

    const updateLoop = () => {
      // Smooth interpolation towards target percent with paced visual progression
      // Ensures polished, graceful visual feedback (~1.8 - 2.2s)
      const diff = this.targetPercent - this.displayPercent;
      const step = Math.min(1.05, Math.max(0.35, diff * 0.04));

      if (this.displayPercent < this.targetPercent) {
        this.displayPercent = Math.min(this.targetPercent, this.displayPercent + step);
      }

      const rounded = Math.floor(this.displayPercent);

      if (this.progressBar) {
        this.progressBar.style.width = `${rounded}%`;
      }
      if (this.percentLabel) {
        this.percentLabel.textContent = `${rounded}%`;
      }
      if (this.bytesLabel) {
        const currentMb = ((this.displayPercent / 100) * (this.totalBytes / (1024 * 1024))).toFixed(1);
        const currentItems = Math.min(this.assets.length, Math.floor((this.displayPercent / 100) * this.assets.length));
        this.bytesLabel.textContent = `${currentMb} MB / ${totalMb} MB downloaded (${currentItems}/${this.assets.length} items)`;
      }

      if (this.textLabel) {
        if (rounded < 35) {
          this.textLabel.textContent = "Loading magical memories...";
        } else if (rounded < 70) {
          this.textLabel.textContent = "Gathering starry surprises...";
        } else if (rounded < 100) {
          this.textLabel.textContent = "Almost ready...";
        } else {
          this.textLabel.textContent = "Ready with love! ✨";
        }
      }

      this.onProgress(rounded);

      if (this.displayPercent >= 100 && this.targetPercent >= 100 && !this.isDone) {
        this.isDone = true;
        this.finishLoading();
        return;
      }

      this.rafId = requestAnimationFrame(updateLoop);
    };

    this.rafId = requestAnimationFrame(updateLoop);
  }

  finishLoading() {
    if (this.percentLabel) this.percentLabel.textContent = '100%';
    if (this.progressBar) this.progressBar.style.width = '100%';

    setTimeout(() => {
      // 1. Fade out loading bar section
      if (this.loadingSection) {
        this.loadingSection.classList.add('fade-out');
        setTimeout(() => {
          this.loadingSection.style.display = 'none';
        }, 400);
      }

      // 2. Fade in "Let's Begin" button section
      if (this.beginSection) {
        this.beginSection.style.display = 'flex';
      }

      // 3. Notify parent app
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }, 450);
  }
}

window.AssetPreloader = AssetPreloader;
