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

    // Essential assets list with exact byte weights
    // Opening song is item 0 (first priority)
    this.assets = [
      { url: 'assets/audio/opening.mp3', size: 3673580, type: 'audio', isOpening: true, label: 'Opening Melody' },
      { url: 'assets/images/page1_bear_scene.jpg', size: 647169, type: 'image' },
      { url: 'assets/images/exit_doraemon_sad.jpg', size: 583036, type: 'image' },
      { url: 'assets/images/exit_doraemon_happy.jpg', size: 461295, type: 'image' },
      { url: 'assets/audio/pinata.mp3', size: 492075, type: 'audio' },
      { url: 'assets/images/pinata_fairytale_bg.jpg', size: 728751, type: 'image' },
      { url: 'assets/images/pinata_star_intact.png', size: 982465, type: 'image' },
      { url: 'assets/images/pinata_star_cracked.png', size: 737042, type: 'image' },
      { url: 'assets/characters/girl_standing.png', size: 736191, type: 'image' },
      { url: 'assets/characters/boy_peeking.png', size: 463126, type: 'image' },
      { url: 'assets/characters/boy_throwing_bat.png', size: 538997, type: 'image' },
      { url: 'assets/images/wooden_baseball_bat.png', size: 22922, type: 'image' },
      { url: 'assets/images/doraemon_doll_3d.png', size: 669700, type: 'image' },
      { url: 'assets/images/golden_birthday_arch.png', size: 85292, type: 'image' },
      { url: 'assets/images/envelope_rectangular.png', size: 1269670, type: 'image' },
      { url: 'assets/characters/nobita_runner.png', size: 190145, type: 'image' },
      { url: 'assets/images/golden_heart_key.png', size: 271583, type: 'image' },
      { url: 'assets/images/photo_01.jpg', size: 68133, type: 'image' },
      { url: 'assets/images/photo_02.jpg', size: 61684, type: 'image' },
      { url: 'assets/images/photo_03.jpg', size: 69269, type: 'image' },
      { url: 'assets/images/photo_04.jpg', size: 161889, type: 'image' },
      { url: 'assets/images/gate_pillar_left_v2.png', size: 222678, type: 'image' },
      { url: 'assets/images/gate_pillar_right_v2.png', size: 210738, type: 'image' },
      { url: 'assets/images/gate_leaf_full_left.png', size: 389388, type: 'image' },
      { url: 'assets/images/gate_leaf_full_right.png', size: 391588, type: 'image' },
      { url: 'assets/images/heart_padlock.png', size: 963580, type: 'image' },
      { url: 'assets/images/final_night_lit.jpg', size: 719220, type: 'image' },
      { url: 'assets/images/final_night_stars.jpg', size: 693624, type: 'image' },
      { url: 'assets/audio/final.mp3', size: 1542406, type: 'audio' }
    ];

    this.totalBytes = this.assets.reduce((sum, item) => sum + item.size, 0);
    this.loadedBytes = 0;
    this.completedCount = 0;
    this.targetPercent = 0;
    this.displayPercent = 0;
    this.isDone = false;
    this.isOpeningLoaded = false;
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
    const total = this.assets.length;

    const onAssetFinished = (item) => {
      this.completedCount++;
      if (item.isOpening) {
        this.isOpeningLoaded = true;
      }
      if (this.completedCount >= total) {
        this.targetPercent = 100;
      }
    };

    const onProgressDelta = (deltaBytes) => {
      this.loadedBytes = Math.min(this.totalBytes, this.loadedBytes + deltaBytes);
      this.targetPercent = Math.min(100, Math.round((this.loadedBytes / this.totalBytes) * 100));
    };

    // 1. PRIORITY 1: Initiate download of opening song immediately
    const openingAsset = this.assets[0];
    this.downloadItem(openingAsset, onProgressDelta, () => {
      onAssetFinished(openingAsset);
    });

    // 2. Concurrently download all other essential assets
    for (let i = 1; i < this.assets.length; i++) {
      const item = this.assets[i];
      setTimeout(() => {
        this.downloadItem(item, onProgressDelta, () => {
          onAssetFinished(item);
        });
      }, 25 * i);
    }

    // Also wait for web fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {}).catch(() => {});
    }

    // Safety fallback timeout: guarantee completion after 9s even on slow connections
    setTimeout(() => {
      this.targetPercent = 100;
    }, 9000);
  }

  downloadItem(item, onProgressDelta, onDone) {
    let itemLoadedBytes = 0;
    let isFinished = false;

    const finishOnce = () => {
      if (isFinished) return;
      isFinished = true;
      const remaining = item.size - itemLoadedBytes;
      if (remaining > 0) {
        onProgressDelta(remaining);
        itemLoadedBytes = item.size;
      }
      onDone();
    };

    // Attempt XHR with progress for real byte tracking
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', item.url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (e) => {
        if (e.lengthComputable && e.loaded > itemLoadedBytes) {
          const delta = e.loaded - itemLoadedBytes;
          itemLoadedBytes = e.loaded;
          onProgressDelta(delta);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (item.isOpening) {
            try {
              const blobUrl = URL.createObjectURL(xhr.response);
              const audio = new Audio(blobUrl);
              audio.preload = 'auto';
              audio.load();
              window.preloadedOpeningAudio = audio;
            } catch (err) {}
          }
          finishOnce();
        } else {
          this.fallbackLoad(item, finishOnce);
        }
      };

      xhr.onerror = () => {
        this.fallbackLoad(item, finishOnce);
      };

      xhr.send();
    } catch (err) {
      this.fallbackLoad(item, finishOnce);
    }
  }

  fallbackLoad(item, finishOnce) {
    if (item.type === 'audio') {
      const audio = new Audio();
      audio.preload = 'auto';
      if (item.isOpening) {
        window.preloadedOpeningAudio = audio;
      }
      audio.addEventListener('canplaythrough', () => finishOnce(), { once: true });
      audio.addEventListener('loadeddata', () => finishOnce(), { once: true });
      audio.addEventListener('error', () => finishOnce(), { once: true });
      audio.src = item.url;
      audio.load();
    } else {
      const img = new Image();
      img.onload = () => finishOnce();
      img.onerror = () => finishOnce();
      img.src = item.url;
    }
  }

  startProgressAnimation() {
    const totalMb = (this.totalBytes / (1024 * 1024)).toFixed(1);

    const updateLoop = () => {
      // Smooth interpolation towards real downloaded percent
      const diff = this.targetPercent - this.displayPercent;
      const step = Math.min(2.5, Math.max(0.4, diff * 0.08));

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
        this.bytesLabel.textContent = `${currentMb} MB / ${totalMb} MB downloaded (${this.completedCount}/${this.assets.length} essentials)`;
      }

      if (this.textLabel) {
        if (!this.isOpeningLoaded && rounded < 25) {
          this.textLabel.textContent = "Downloading opening song & melodies...";
        } else if (rounded < 40) {
          this.textLabel.textContent = "Loading magical memories...";
        } else if (rounded < 75) {
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
