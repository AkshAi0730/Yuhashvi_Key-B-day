/**
 * ============================================================================
 * PARTICLE SYSTEM (js/particle-system.js)
 * Clean Canvas Engine for:
 * - Ambient floating bokeh / warm dust (Page 1)
 * - Space dust & twinkling stars (Exit Scene)
 * - Shooting star with glowing particle trail (Piñata Scene)
 * - Floating hearts (Envelope Scene)
 * - Confetti burst (Secret Doraemon Gift Box)
 * - Starlight sparkle burst (Candle Blow-Out)
 * ============================================================================
 */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.shootingStars = [];
    this.activeMode = 'ambient';
    this.isRunning = true;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setMode(mode) {
    this.activeMode = mode;
    this.particles = [];

    if (mode === 'ambient') {
      // Warm dreamy floating bokeh
      for (let i = 0; i < 28; i++) {
        this.particles.push({
          type: 'bokeh',
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 4 + 2,
          color: 'rgba(255, 230, 210, ' + (Math.random() * 0.4 + 0.2) + ')',
          vx: (Math.random() - 0.5) * 0.4,
          vy: -Math.random() * 0.5 - 0.2,
        });
      }
    } else if (mode === 'space') {
      // Dark space stars
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          type: 'star',
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          alpha: Math.random(),
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    } else if (mode === 'hearts') {
      // Soft floating hearts for envelope
      for (let i = 0; i < 18; i++) {
        this.particles.push({
          type: 'heart',
          x: Math.random() * this.canvas.width,
          y: this.canvas.height + Math.random() * 100,
          size: Math.random() * 14 + 10,
          color: 'rgba(255, 141, 161, ' + (Math.random() * 0.5 + 0.3) + ')',
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 1.2 - 0.6,
        });
      }
    }
  }

  // Shooting Star (Specs 16 & 26)
  triggerShootingStar(callback) {
    const star = {
      x: -50,
      y: this.canvas.height * 0.22,
      vx: 19,
      vy: 2.4,
      length: 130,
      trail: [],
      active: true,
      onComplete: callback,
    };
    this.shootingStars.push(star);
  }

  // Confetti Burst for Secret Gift Box (Specs 37 & 49)
  triggerConfetti(x, y) {
    const colors = ['#ff8da1', '#ffd166', '#06d6a0', '#118ab2', '#a0c4ff', '#ffc6ff'];
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3.5;
      this.particles.push({
        type: 'confetti',
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        gravity: 0.24,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    }
  }

  // Hundreds of Twinkling Stars when Candle is Blown (Specs 43 & 55)
  triggerStarlightBurst() {
    for (let i = 0; i < 240; i++) {
      this.particles.push({
        type: 'starlight',
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        alpha: 0,
        targetAlpha: Math.random() * 0.85 + 0.2,
        flickerSpeed: Math.random() * 0.05 + 0.02,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Ambient Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.type === 'bokeh') {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = this.canvas.height + 10;
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      } else if (p.type === 'star') {
        p.alpha += p.speed;
        const opacity = (Math.sin(p.alpha) + 1) / 2 * 0.7 + 0.2;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (p.type === 'heart') {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -30) {
          p.y = this.canvas.height + 20;
          p.x = Math.random() * this.canvas.width;
        }
        this._drawHeart(p.x, p.y, p.size, p.color);
      } else if (p.type === 'confetti') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.life -= p.decay;

        if (p.life > 0) {
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.life;
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();
        } else {
          this.particles.splice(i, 1);
        }
      } else if (p.type === 'starlight') {
        p.alpha += p.flickerSpeed;
        const currentOpacity = ((Math.sin(p.alpha) + 1) / 2) * p.targetAlpha;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 245, 220, ${currentOpacity})`;
        this.ctx.shadowColor = 'rgba(255, 220, 160, 0.85)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    // 2. Draw Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      if (!s.active) continue;

      s.trail.unshift({ x: s.x, y: s.y });
      if (s.trail.length > 20) s.trail.pop();

      s.x += s.vx;
      s.y += s.vy;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      for (let j = 0; j < s.trail.length; j++) {
        const pt = s.trail[j];
        this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.strokeStyle = 'rgba(255, 240, 200, 0.85)';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#fff';
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (s.x > this.canvas.width + 60) {
        s.active = false;
        if (s.onComplete) s.onComplete();
        this.shootingStars.splice(i, 1);
      }
    }

    if (this.isRunning) {
      requestAnimationFrame(this.animate);
    }
  }

  _drawHeart(x, y, size, color) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(0, topCurveHeight);
    this.ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    this.ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.2);
    this.ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    this.ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.restore();
  }
}

window.birthdayParticles = new ParticleSystem('particle-canvas');
