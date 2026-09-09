/**
 * ============================================================================
 * MAIN APPLICATION & FINITE STATE MACHINE (js/app.js)
 * Strict Single-Scene Controller:
 * - opening -> exit -> pinata -> envelope -> gallery -> final
 * - Zero scrolling, zero overlap, proper lifecycle teardown
 * - Complete reset on "Experience Again"
 * ============================================================================
 */

class BirthdayApp {
  constructor() {
    this.audio = window.birthdayAudio;
    this.currentSceneId = null;
    this.scenes = {};

    this.audioGateOverlay = document.getElementById('audio-gate-overlay');
    this.musicToggleBtn = document.getElementById('music-toggle-btn');

    this.init();
  }

  init() {
    this.isPageLoaded = false;

    // Start dreamy music-box waiting music immediately on page load
    if (this.audio && typeof this.audio.playWaitingMusic === 'function') {
      this.audio.playWaitingMusic();
    }

    // Asset Preloading Engine with live download tracking & progress bar
    if (window.AssetPreloader) {
      this.preloader = new window.AssetPreloader({
        onComplete: () => {
          this.isPageLoaded = true;
          if (this.audioGateOverlay) {
            this.audioGateOverlay.classList.add('ready');
          }
        }
      });
    } else {
      this.isPageLoaded = true;
      if (this.audioGateOverlay) {
        this.audioGateOverlay.classList.add('ready');
      }
      const beginSec = document.getElementById('gate-begin-section');
      if (beginSec) beginSec.style.display = 'flex';
      const loadSec = document.getElementById('gate-loading-section');
      if (loadSec) loadSec.style.display = 'none';
    }

    // Story Transition Handler (Guards against starting before 100% download)
    const handleStartStory = () => {
      if (!this.isPageLoaded) return;
      this.audio.init();
      this.audio.resume();
      this.audio.playMood('page1');
      if (this.audioGateOverlay) {
        this.audioGateOverlay.classList.add('hidden');
      }
    };

    if (this.audioGateOverlay) {
      this.audioGateOverlay.addEventListener('click', () => {
        if (this.isPageLoaded) {
          handleStartStory();
        }
      });
    }

    const btnLetsBegin = document.getElementById('btn-lets-begin');
    if (btnLetsBegin) {
      btnLetsBegin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isPageLoaded) {
          handleStartStory();
        }
      });
    }

    // Persistent Music Mute Control
    if (this.musicToggleBtn) {
      this.musicToggleBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        this.musicToggleBtn.innerHTML = isMuted ? '🔇' : '♪';
        this.musicToggleBtn.title = isMuted ? 'Unmute music' : 'Mute music';
      });
    }

    // Initialize all scene controllers
    this.scenes['page1'] = new window.Page1Scene(this);
    this.scenes['exit'] = new window.ExitScene(this);
    this.scenes['pinata'] = new window.PinataScene(this);
    this.scenes['page2'] = new window.Page2EnvelopeScene(this);
    this.scenes['gallery'] = new window.PhotoGalleryScene(this);
    this.scenes['gate'] = new window.GateScene(this);
    this.scenes['final'] = new window.FinalScene(this);

    // Mount initial scene: Page 1 or URL hash deep-link if specified
    const hashScene = window.location.hash ? window.location.hash.replace('#', '').trim() : '';
    if (hashScene && this.scenes[hashScene]) {
      if (this.audioGateOverlay) this.audioGateOverlay.classList.add('hidden');
      this.goToScene(hashScene);
    } else {
      this.goToScene('page1');
    }
  }

  goToScene(sceneId) {
    if (this.currentSceneId === sceneId) return;

    // 1. Teardown previous scene
    const previousScene = this.scenes[this.currentSceneId];
    if (previousScene && typeof previousScene.leave === 'function') {
      previousScene.leave();
    }
    if (this.currentSceneId) {
      const prevEl = document.getElementById(`scene-${this.currentSceneId}`);
      if (prevEl) prevEl.classList.remove('active');
    }

    // 2. Activate target scene
    this.currentSceneId = sceneId;
    const nextEl = document.getElementById(`scene-${sceneId}`);
    if (nextEl) {
      nextEl.classList.add('active');
    }

    // 3. Initialize next scene
    const nextScene = this.scenes[sceneId];
    if (nextScene && typeof nextScene.enter === 'function') {
      nextScene.enter();
    }
  }

  // Full reset for "Experience Again" (Specs 44 & 56)
  resetAllAndGoToOpening() {
    // Reset all scene states
    Object.values(this.scenes).forEach(s => {
      if (typeof s.resetScene === 'function') s.resetScene();
      else if (typeof s.leave === 'function') s.leave();
    });

    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }

    this.audio.playMood('page1');
    this.goToScene('page1');
  }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.birthdayApp = new BirthdayApp();
});
