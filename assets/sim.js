(function () {
  "use strict";

  const PRESETS = {
    "figure-8": {
      label: "Chenciner–Montgomery",
      sub: "Figure-8 orbit, 2000",
      bodies: [
        { x: 0.97000436, y: -0.24308753, vx: 0.46620369, vy: 0.43236573 },
        { x: -0.97000436, y: 0.24308753, vx: 0.46620369, vy: 0.43236573 },
        { x: 0.0, y: 0.0, vx: -0.93240737, vy: -0.86473146 },
      ],
      period: 6.3259,
      view: 1.6,
    },
    "lagrange": {
      label: "Lagrange",
      sub: "Equilateral triangle, 1772",
      // equal masses on equilateral triangle, side L=√3 → R=1, omega=√3/3·√3=√(3/(3√3))
      // angular omega with G=m=1, side L: omega^2 = 3/L^3 ⇒ for R=1, L=√3, omega = √(3/(3√3)) ≈ 0.7598
      bodies: (() => {
        const R = 1, omega = Math.sqrt(1 / Math.sqrt(3));
        const angles = [Math.PI / 2, Math.PI / 2 + 2 * Math.PI / 3, Math.PI / 2 + 4 * Math.PI / 3];
        return angles.map(a => ({
          x: R * Math.cos(a), y: R * Math.sin(a),
          vx: -R * omega * Math.sin(a), vy: R * omega * Math.cos(a),
        }));
      })(),
      period: 2 * Math.PI / Math.sqrt(1 / Math.sqrt(3)),
      view: 1.4,
    },
    "bhh": {
      label: "BHH",
      sub: "BHH",
      bodies: [
        { x: -1.3, y: 0, vx: 0, vy: -1.246 },
        { x: -0.7, y: 0, vx: 0, vy: 0.580 },
        { x: 2.0, y: 0, vx: 0, vy: 0.667 },
      ],
      period: 18.85,
      view: 4,
    },

  };

  function suvakov(p1, p2) {
    return {
      bodies: [
        { x: -1, y: 0, vx: p1, vy: p2 },
        { x: 1, y: 0, vx: p1, vy: p2 },
        { x: 0, y: 0, vx: -2 * p1, vy: -2 * p2 },
      ],
    };
  }

  // ────────── physics ──────────
  const G = 1.0;
  const M = [1.0, 1.0, 1.0];
  const SOFT2 = 1e-4;

  function accel(bodies) {
    const a = bodies.map(() => ({ ax: 0, ay: 0 }));
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const r2 = dx * dx + dy * dy + SOFT2;
        const r3 = r2 * Math.sqrt(r2);
        const f = G / r3;
        a[i].ax += f * M[j] * dx;
        a[i].ay += f * M[j] * dy;
        a[j].ax -= f * M[i] * dx;
        a[j].ay -= f * M[i] * dy;
      }
    }
    return a;
  }

  function step(bodies, dt) {
    const a0 = accel(bodies);
    for (let i = 0; i < bodies.length; i++) {
      bodies[i].x += bodies[i].vx * dt + 0.5 * a0[i].ax * dt * dt;
      bodies[i].y += bodies[i].vy * dt + 0.5 * a0[i].ay * dt * dt;
    }
    const a1 = accel(bodies);
    for (let i = 0; i < bodies.length; i++) {
      bodies[i].vx += 0.5 * (a0[i].ax + a1[i].ax) * dt;
      bodies[i].vy += 0.5 * (a0[i].ay + a1[i].ay) * dt;
    }
  }

  // ────────── renderer ──────────
  class NBodySim {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.opts = Object.assign({
        preset: "figure-8",
        speed: 1.0,        // 1.0 = baseline
        trailLength: 0.985, // alpha decay per frame; closer to 1 = longer trail
        showStars: true,
        colors: ["#F2EAD6", "#E8703A", "#7BB3D9"], // cream, orange, ice-blue
        glow: true,
        autoplay: true,
      }, opts);
      this.bodies = [];
      this.trails = [[], [], []];
      this.maxTrail = 1800;
      this.viewScale = 1.6;
      this.t = 0;
      this.running = false;
      this._raf = null;
      this._stars = null;
      this._dpr = 1;
      this._lastTs = 0;

      this._onResize = this._resize.bind(this);
      window.addEventListener("resize", this._onResize);
      this._resize();
      this.load(this.opts.preset);
      if (this.opts.autoplay) this.start();
    }

    setOption(key, value) {
      this.opts[key] = value;
    }

    load(presetKey) {
      const p = PRESETS[presetKey];
      if (!p) return;
      this.opts.preset = presetKey;
      // deep copy
      this.bodies = p.bodies.map(b => ({ ...b }));
      this.trails = this.bodies.map(() => []);
      this.viewScale = p.view || 1.8;
      this.t = 0;
    }

    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._dpr = dpr;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this._genStars();
    }

    _genStars() {
      if (!this.opts.showStars) return;
      const count = Math.max(60, Math.floor((this.canvas.width * this.canvas.height) / 18000));
      const stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          r: Math.random() * 1.1 * this._dpr,
          a: 0.15 + Math.random() * 0.55,
          tw: Math.random() * Math.PI * 2,
        });
      }
      this._stars = stars;
    }

    start() {
      if (this.running) return;
      this.running = true;
      this._lastTs = performance.now();
      const tick = (ts) => {
        if (!this.running) return;
        const dt = Math.min(50, ts - this._lastTs);
        this._lastTs = ts;
        this._frame(dt / 1000);
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
    }

    stop() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
    }

    destroy() {
      this.stop();
      window.removeEventListener("resize", this._onResize);
    }

    _frame(dtReal) {
      // Physics — fixed sub-steps for stability
      const speed = this.opts.speed;
      const physDt = 0.0035;
      const physTime = Math.min(dtReal * speed, 0.05);
      let acc = physTime;
      while (acc > 0) {
        const h = Math.min(physDt, acc);
        step(this.bodies, h);
        acc -= h;
        this.t += h;
      }

      // Update trails
      for (let i = 0; i < this.bodies.length; i++) {
        this.trails[i].push({ x: this.bodies[i].x, y: this.bodies[i].y });
        // trail length controlled by opts.trailLength: 0..1 → 200..maxTrail
        const lenFrac = this.opts.trailLength;
        // Interpret trailLength as alpha decay: smaller trail = drop earlier
        const targetLen = Math.floor(60 + lenFrac * (this.maxTrail - 60));
        if (this.trails[i].length > targetLen) {
          this.trails[i].splice(0, this.trails[i].length - targetLen);
        }
      }

      this._draw();
    }

    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width, H = this.canvas.height;

      // Background fill (no fade-trail; we draw trails by polyline w/ gradient alpha)
      ctx.fillStyle = "#0A0908";
      ctx.fillRect(0, 0, W, H);

      // Stars
      if (this.opts.showStars && this._stars) {
        for (const s of this._stars) {
          s.tw += 0.02;
          const a = s.a * (0.7 + 0.3 * Math.sin(s.tw));
          ctx.fillStyle = `rgba(242, 234, 214, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // World → screen mapping
      const scale = (Math.min(W, H) / 2) / this.viewScale;
      const cx = W / 2, cy = H / 2;
      const toX = x => cx + x * scale;
      const toY = y => cy - y * scale;

      // Trails — fading polyline per body
      for (let i = 0; i < this.trails.length; i++) {
        const trail = this.trails[i];
        if (trail.length < 2) continue;
        const color = this.opts.colors[i % this.opts.colors.length];
        const N = trail.length;
        // segmented stroke for fading
        const steps = 20;
        const seg = Math.ceil(N / steps);
        for (let s = 0; s < steps; s++) {
          const i0 = s * seg;
          const i1 = Math.min(N - 1, i0 + seg);
          if (i1 - i0 < 1) continue;
          const a = Math.pow((s + 1) / steps, 1.6);
          ctx.strokeStyle = withAlpha(color, a * 0.9);
          ctx.lineWidth = 1.4 * this._dpr;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(toX(trail[i0].x), toY(trail[i0].y));
          for (let k = i0 + 1; k <= i1; k++) {
            ctx.lineTo(toX(trail[k].x), toY(trail[k].y));
          }
          ctx.stroke();
        }
      }

      // Bodies — glow + core
      for (let i = 0; i < this.bodies.length; i++) {
        const b = this.bodies[i];
        const x = toX(b.x), y = toY(b.y);
        const color = this.opts.colors[i % this.opts.colors.length];
        if (this.opts.glow) {
          const grd = ctx.createRadialGradient(x, y, 0, x, y, 22 * this._dpr);
          grd.addColorStop(0, withAlpha(color, 0.55));
          grd.addColorStop(0.4, withAlpha(color, 0.12));
          grd.addColorStop(1, withAlpha(color, 0));
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(x, y, 22 * this._dpr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3.6 * this._dpr, 0, Math.PI * 2);
        ctx.fill();
        // bright center
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, 1.4 * this._dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function withAlpha(hex, a) {
    // hex like #RRGGBB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  // expose
  window.NBodySim = NBodySim;
  window.NBODY_PRESETS = PRESETS;
})();
