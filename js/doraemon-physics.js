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

    // Load authentic 3D Collectible Doraemon figure (from user's media_1788703101902.png)
    this.doraemonImg = new Image();
    this.doraemonImg.src = 'assets/images/doraemon_doll_3d.png';
    this.imageLoaded = false;
    this.doraemonImg.onload = () => {
      this.imageLoaded = true;
    };

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

  // Generate tightly overlapping, organically tumbled triangular mound target positions (ZERO gaps)
  generateGaplessTriangularTargets(girlCenterX, girlGroundY) {
    const targets = [];
    const baseWidth = 485; // Broad base covering ground around girl
    const totalTiers = 9;
    const tierHeight = 25;

    // 1. Foundational interlocking honeycomb tiers (solid dense bed)
    for (let r = 0; r < totalTiers; r++) {
      const y = girlGroundY - 14 - r * tierHeight;
      // Natural organic bell-curved mound envelope
      const rowWidth = baseWidth * Math.pow(1 - (r / (totalTiers + 0.3)), 0.78);
      // Tight step <= 23px for 54-64px dolls (> 55% overlap!)
      const count = Math.max(2, Math.ceil(rowWidth / 23));
      const step = count > 1 ? rowWidth / (count - 1) : 0;
      const startX = girlCenterX - rowWidth / 2;
      const rowStagger = (r % 2 === 1) ? 8 : -8;

      for (let c = 0; c < count; c++) {
        const x = count > 1 ? startX + c * step + rowStagger : girlCenterX;
        targets.push({
          targetX: x + (Math.random() - 0.5) * 12,
          targetY: y + (Math.random() - 0.5) * 8,
          // Natural lively tumble angles
          rotation: (Math.random() - 0.5) * 0.85,
          size: 53 + Math.random() * 11, // 53px to 64px 3D vinyl figure
          tier: r,
          isForeground: Math.random() < 0.95 // 95% on fgCanvas to physically cover girl
        });
      }
    }

    // 2. Surface tumble dolls scattered organically across the mound face for authentic pile texture
    const surfaceCount = 28;
    for (let s = 0; s < surfaceCount; s++) {
      const r = Math.floor(Math.random() * (totalTiers - 1));
      const rowWidth = baseWidth * Math.pow(1 - (r / (totalTiers + 0.3)), 0.78) * 0.9;
      const x = girlCenterX + (Math.random() - 0.5) * rowWidth;
      const y = girlGroundY - 18 - r * tierHeight + (Math.random() - 0.5) * 14;
      targets.push({
        targetX: x,
        targetY: y,
        // Jaunty surface tilt angles
        rotation: (Math.random() - 0.5) * 1.3,
        size: 52 + Math.random() * 12,
        tier: r,
        isForeground: true
      });
    }

    return targets;
  }

  // Erupt 111 Dolls in waves from broken pinata opening, burying the girl in a 100% gapless triangular pile
  startShower(pinataX, pinataY, girlCenterX, girlGroundY, onBuriedComplete) {
    this.dolls = [];
    this.isRunning = true;
    this.lastGirlCenterX = girlCenterX;
    this.lastGirlGroundY = girlGroundY;

    const targets = this.generateGaplessTriangularTargets(girlCenterX, girlGroundY);
    // Sort from bottom tiers to top tiers so mound naturally builds upward
    targets.sort((a, b) => a.tier - b.tier);

    const waveCount = 6;
    const waveSize = Math.ceil(targets.length / waveCount);

    for (let wave = 0; wave < waveCount; wave++) {
      const waveTargets = targets.slice(wave * waveSize, (wave + 1) * waveSize);
      setTimeout(() => {
        for (let i = 0; i < waveTargets.length; i++) {
          const t = waveTargets[i];
          // Natural parabolic launch towards assigned target slot
          const vx = (t.targetX - pinataX) * 0.024 + (Math.random() - 0.5) * 3.4;
          const vy = -(Math.random() * 3.4 + 1.4);

          this.dolls.push({
            id: this.dolls.length,
            x: pinataX + (Math.random() - 0.5) * 32,
            y: pinataY + Math.random() * 15,
            targetX: t.targetX,
            targetY: t.targetY,
            vx: vx,
            vy: vy,
            gravity: 0.44,
            rotation: Math.random() * Math.PI * 2,
            targetRotation: t.rotation,
            vRot: (Math.random() - 0.5) * 0.18,
            size: t.size,
            tier: t.tier,
            bounces: 0,
            maxBounces: Math.floor(Math.random() * 2) + 1,
            isAtRest: false,
            isRolling: false,
            rollDirection: 0,
            isForeground: t.isForeground
          });
        }
      }, wave * 180);
    }

    this.animate();

    // After dolls tumble down and the gapless triangular mound is completely formed
    setTimeout(() => {
      if (onBuriedComplete) onBuriedComplete();
    }, 2600);
  }

  // Displace 4 to 6 dolls from top apex, rolling and tumbling down both sides as girl emerges
  rollTopDolls(girlCenterX, girlGroundY) {
    const cx = girlCenterX !== undefined ? girlCenterX : this.lastGirlCenterX;
    const gy = girlGroundY !== undefined ? girlGroundY : this.lastGirlGroundY;
    if (!cx || !gy) return;

    // Filter candidate dolls at the top crest of the mound on the foreground canvas
    const candidates = this.dolls.filter(d => 
      d.isForeground && 
      d.tier >= 5 && 
      Math.abs(d.x - cx) < 85 &&
      d.y < (gy - 135)
    );

    // Sort by y ascending (highest dolls in the pile first)
    candidates.sort((a, b) => a.y - b.y);

    const rollCount = Math.min(candidates.length, 6);
    const toRoll = candidates.slice(0, rollCount);

    toRoll.forEach((d, idx) => {
      // Half roll left, half roll right
      const isLeft = (idx % 2 === 0);
      const dir = isLeft ? -1 : 1;

      d.isAtRest = false;
      d.isRolling = true;
      d.rollDirection = dir;
      // Burst outward with lateral momentum and slight upward pop from girl pushing out
      d.vx = dir * (2.8 + Math.random() * 2.2);
      d.vy = -(2.2 + Math.random() * 1.6);
      d.vRot = dir * (0.16 + Math.random() * 0.14);
      d.gravity = 0.42;
      d.bounces = 0;
      d.maxBounces = 2;
      // Landing level along base / foot of mound
      d.targetY = gy - 12 - Math.random() * 22;
    });
  }

  animate() {
    if (!this.isRunning) return;

    if (this.bgCtx && this.bgCanvas) this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    if (this.fgCtx && this.fgCanvas) this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);

    for (let i = 0; i < this.dolls.length; i++) {
      const d = this.dolls[i];

      if (!d.isAtRest) {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += d.gravity;
        d.vx *= 0.992; // subtle air drag
        d.rotation += d.vRot;

        if (d.isRolling) {
          // Dynamic collision with triangular mound slope
          const distFromCenter = Math.abs(d.x - this.lastGirlCenterX);
          // Slope height from peak down to base
          const slopeY = (this.lastGirlGroundY - 200) + distFromCenter * 0.78;

          if (d.y >= slopeY) {
            d.y = slopeY;
            // Tumble and roll along slope
            if (d.bounces < d.maxBounces && d.y < d.targetY - 14) {
              d.vy = -Math.abs(d.vy) * 0.28;
              d.vx *= 0.92;
              d.vRot = d.rollDirection * (0.12 + Math.random() * 0.1);
              d.bounces++;
            } else if (d.y >= d.targetY) {
              d.y = d.targetY;
              d.isAtRest = true;
              d.isRolling = false;
              d.vy = 0;
              d.vx = 0;
              d.vRot = 0;
            }
          }
        } else {
          // Collision with target resting mound level & soft bounce
          if (d.y >= d.targetY) {
            d.y = d.targetY;
            if (d.bounces < d.maxBounces) {
              d.vy = -d.vy * 0.32;
              d.vx *= 0.5;
              d.vRot *= 0.5;
              d.bounces++;
            } else {
              d.isAtRest = true;
              d.x = d.targetX;
              d.y = d.targetY;
              d.vy = 0;
              d.vx = 0;
              d.vRot = 0;
              d.rotation = d.targetRotation;
            }
          }
        }
      }

      // Draw onto foreground canvas (in front of girl) or background canvas
      const ctx = d.isForeground ? this.fgCtx : this.bgCtx;
      if (ctx) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        // Draw 3D collectible Doraemon figure sprite (100% transparent PNG)
        if (this.imageLoaded && this.doraemonImg) {
          ctx.drawImage(this.doraemonImg, -d.size / 2, -d.size / 2, d.size, d.size);
        } else {
          this.renderVectorDoraemonSprite(ctx, d.size);
        }
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
