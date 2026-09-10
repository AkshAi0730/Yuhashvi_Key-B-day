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

    // Revisit Navigation Subsystem (Dropdown Quick-Jump)
    this.revisitNavBar = document.getElementById('revisit-nav-bar');
    this.revisitSceneName = document.getElementById('revisit-scene-name');
    this.btnRevisitReturn = document.getElementById('btn-revisit-return');
    this.btnRevisitContinue = document.getElementById('btn-revisit-continue');
    this.isRevisitMode = false;

    this.sceneTitles = {
      'pinata': '🎮 The Fairytale Piñata Quest',
      'exit': "🥺 Doraemon & Nobita's Heartfelt Realm",
      'page2': '💌 The Scalloped Envelope & Love Letter',
      'gate': '🗝️ The Sacred Baroque Gate',
      'gallery': '🌸 The Polaroid Keepsake Gallery',
      'final': '🎂 The Midnight Wish & Candle Ceremony'
    };

    if (this.btnRevisitReturn) {
      this.btnRevisitReturn.addEventListener('click', () => {
        this.returnToFinalFromRevisit();
      });
    }

    if (this.btnRevisitContinue) {
      this.btnRevisitContinue.addEventListener('click', () => {
        this.continueNaturalFlowFromRevisit();
      });
    }

    // Mount initial scene: Page 1 or URL hash deep-link if specified
    const hashScene = window.location.hash ? window.location.hash.replace('#', '').trim() : '';
    if (hashScene && this.scenes[hashScene]) {
      if (this.audioGateOverlay) this.audioGateOverlay.classList.add('hidden');
      this.goToScene(hashScene);
    } else {
      this.goToScene('page1');
    }
  }

  jumpToSceneFromFinal(sceneId) {
    if (!this.scenes[sceneId]) return;

    this.isRevisitMode = true;
    if (this.revisitSceneName) {
      this.revisitSceneName.textContent = this.sceneTitles[sceneId] || sceneId;
    }
    if (this.revisitNavBar) {
      this.revisitNavBar.style.display = 'flex';
      this.revisitNavBar.classList.add('visible');
    }

    // Adjust audio to the target scene
    if (this.audio) {
      if (sceneId === 'pinata') this.audio.playMood('pinata');
      else if (sceneId === 'exit' || sceneId === 'page1') this.audio.playMood('page1');
      else if (sceneId === 'page2') this.audio.playMood('page2');
      else if (sceneId === 'gate') this.audio.playMood('gate');
      else if (sceneId === 'gallery') this.audio.playMood('gallery');
      else if (sceneId === 'final') this.audio.playMood('final');
    }

    this.goToScene(sceneId);
  }

  returnToFinalFromRevisit() {
    this.isRevisitMode = false;
    if (this.revisitNavBar) {
      this.revisitNavBar.style.display = 'none';
      this.revisitNavBar.classList.remove('visible');
    }

    if (this.audio) {
      this.audio.playMood('final');
    }

    this.goToScene('final');
    if (this.scenes['final'] && typeof this.scenes['final'].restoreFinalState === 'function') {
      this.scenes['final'].restoreFinalState();
    }
  }

  continueNaturalFlowFromRevisit() {
    this.isRevisitMode = false;
    if (this.revisitNavBar) {
      this.revisitNavBar.style.display = 'none';
      this.revisitNavBar.classList.remove('visible');
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
    this.isRevisitMode = false;
    if (this.revisitNavBar) {
      this.revisitNavBar.style.display = 'none';
      this.revisitNavBar.classList.remove('visible');
    }

    // Reset all scene states
    Object.values(this.scenes).forEach(s => {
      if (typeof s.resetScene === 'function') s.resetScene();
      else if (typeof s.leave === 'function') s.leave();
    });

    if (window.birthdayParticles) {
      window.birthdayParticles.setMode('ambient');
    }

    if (this.audio) {
      this.audio.currentPortion = null;
      this.audio.playMood('page1');
    }
    this.goToScene('page1');
  }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.birthdayApp = new BirthdayApp();
});
