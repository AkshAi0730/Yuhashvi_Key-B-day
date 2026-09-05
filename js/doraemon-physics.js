/**
 * ============================================================================
 * DORAEMON PHYSICS & 3D BURIAL PILE ENGINE (js/doraemon-physics.js)
 * 100% Transparent Vector Chibi Doraemon Dolls (ZERO white squares / rectangles).
 * Physics:
 * - Originates directly from broken piñata opening
 * - 5 cascading waves (~100 total dolls) with gravity, tumbling rotation, bounce
 * - 3D dual-layer pile (foreground & background) that accumulates around the girl
 * - Substantially buries the girl before triggering her comedic peek-out
 * ============================================================================
 */

class DoraemonPhysicsEngine {
  constructor(bgCanvasId, fgCanvasId) {
    this.bgCanvas = document.getElementById(bgCanvasId);
    this.fgCanvas = document.getElementById(fgCanvasId);
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.fgCtx = this.fgCanvas ? this.fgCanvas.getContext('2d') : null;

    this.dolls = [];
    this.isRunning = false;
    this.animId = null;

    // Pre-render a high-res crisp transparent vector Doraemon sprite to an offscreen canvas
    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = 128;
    this.spriteCanvas.height = 128;
    this.renderVectorDoraemonSprite(this.spriteCanvas.getContext('2d'), 128);

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.bgCanvas) {
      this.bgCanvas.width = w;
      this.bgCanvas.height = h;
    }
    if (this.fgCanvas) {
      this.fgCanvas.width = w;
      this.fgCanvas.height = h;
    }
  }

  // Pre-render 100% transparent vector Doraemon chibi doll (No white bounding boxes!)
  renderVectorDoraemonSprite(ctx, size) {
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, w, h, r) { ctx.rect(x, y, w, h); };
    }
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    const scale = size / 100;
    ctx.scale(scale, scale);

    // 1. Blue Body & Round Head
    ctx.beginPath();
    ctx.arc(50, 42, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#009fe8';
    ctx.fill();

    // 2. White Face Area
    ctx.beginPath();
    ctx.arc(50, 48, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 3. Eyes
    ctx.beginPath();
    ctx.ellipse(43, 30, 8, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(57, 30, 8, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pupils
    ctx.beginPath();
    ctx.arc(44, 32, 3.5, 0, Math.PI * 2);
    ctx.arc(56, 32, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Catchlights
    ctx.beginPath();
    ctx.arc(43, 30, 1.2, 0, Math.PI * 2);
    ctx.arc(55, 30, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 4. Red Nose & Vertical Line
    ctx.beginPath();
    ctx.arc(50, 41, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ee2233';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(50, 46);
    ctx.lineTo(50, 58);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 5. Mouth (Cute Happy Smile)
    ctx.beginPath();
    ctx.arc(50, 46, 16, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Whiskers
    const whiskers = [
      [32, 42, 18, 38], [31, 48, 16, 48], [32, 54, 18, 58],
      [68, 42, 82, 38], [69, 48, 84, 48], [68, 54, 82, 58]
    ];
    whiskers.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(w[0], w[1]);
      ctx.lineTo(w[2], w[3]);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // 7. Red Collar & Golden Bell
    ctx.beginPath();
    ctx.roundRect(26, 70, 48, 8, 4);
    ctx.fillStyle = '#e52b2b';
    ctx.fill();
    // Bell
    ctx.beginPath();
    ctx.arc(50, 78, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd13b';
    ctx.fill();
    ctx.strokeStyle = '#996f00';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(50, 78, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    // 8. Lower Body & White Pouch
    ctx.beginPath();
    ctx.roundRect(30, 76, 40, 18, 8);
    ctx.fillStyle = '#009fe8';
    ctx.fill();
    // Belly Oval
    ctx.beginPath();
    ctx.arc(50, 83, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // 4D Pocket
    ctx.beginPath();
    ctx.arc(50, 83, 9, 0, Math.PI);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 9. White Feet Paws
    ctx.beginPath();
    ctx.ellipse(38, 95, 10, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(62, 95, 10, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // Erupt 100 Dolls in 5 waves from broken pinata opening, burying the girl in a 3D mound
  startShower(pinataX, pinataY, girlCenterX, girlGroundY, onBuriedComplete) {
    this.dolls = [];
    this.isRunning = true;
    const totalDolls = 105;
    const waveCount = 5;
    const dollsPerWave = Math.floor(totalDolls / waveCount);

    for (let wave = 0; wave < waveCount; wave++) {
      setTimeout(() => {
        for (let i = 0; i < dollsPerWave; i++) {
          const dollIndex = wave * dollsPerWave + i;
          
          // Mound resting layer calculation:
          // Center of mound is girlCenterX, forming a 3D hill that covers her
          const moundOffset = (Math.random() - 0.5) * 160;
          const targetX = girlCenterX + moundOffset;
          // Closer to center of girl = higher resting level (burying her feet, legs, skirt, shoulders)
          const distToGirl = Math.abs(moundOffset);
          const moundHeight = Math.max(0, 140 - distToGirl * 0.85);
          const groundTarget = girlGroundY - moundHeight + (Math.random() - 0.5) * 20;

          // 55% in front of girl, 45% behind girl for true 3D visual depth
          const isForeground = Math.random() < 0.58;

          this.dolls.push({
            id: dollIndex,
            x: pinataX + (Math.random() - 0.5) * 35,
            y: pinataY + Math.random() * 20,
            vx: (targetX - pinataX) * 0.024 + (Math.random() - 0.5) * 4.5,
            vy: Math.random() * 4 + 3.5,
            gravity: 0.36,
            targetGround: groundTarget,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.22,
            size: Math.random() * 12 + 30, // 30px to 42px (much smaller than girl)
            bounces: 0,
            maxBounces: Math.floor(Math.random() * 2) + 1,
            isAtRest: false,
            isForeground: isForeground
          });
        }
      }, wave * 320);
    }

    this.animate();

    // Comedic pause: girl completely buried by the mound of 100 Doraemons (Spec 27)
    setTimeout(() => {
      if (onBuriedComplete) onBuriedComplete();
    }, 3800);
  }

  animate() {
    if (!this.isRunning) return;

    if (this.bgCtx && this.bgCanvas) this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    if (this.fgCtx && this.fgCanvas) this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);

    let allAtRest = true;

    for (let i = 0; i < this.dolls.length; i++) {
      const d = this.dolls[i];

      if (!d.isAtRest) {
        allAtRest = false;
        d.x += d.vx;
        d.y += d.vy;
        d.vy += d.gravity;
        d.rotation += d.vRot;

        // Collision with resting mound level & bouncing
        if (d.y >= d.targetGround) {
          d.y = d.targetGround;
          if (d.bounces < d.maxBounces) {
            d.vy = -d.vy * 0.42;
            d.vx *= 0.6;
            d.vRot *= 0.5;
            d.bounces++;
          } else {
            d.isAtRest = true;
            d.vy = 0;
            d.vx = 0;
            d.vRot = 0;
          }
        }
      }

      // Draw onto either background canvas or foreground canvas based on 3D depth layer
      const ctx = d.isForeground ? this.fgCtx : this.bgCtx;
      if (ctx) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        // Draw transparent offscreen vector sprite (Zero white boxes!)
        ctx.drawImage(this.spriteCanvas, -d.size / 2, -d.size / 2, d.size, d.size);
        ctx.restore();
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  reset() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.dolls = [];
    if (this.bgCtx && this.bgCanvas) this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    if (this.fgCtx && this.fgCanvas) this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
  }
}

window.DoraemonPhysicsEngine = DoraemonPhysicsEngine;
