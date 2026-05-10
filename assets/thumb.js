(function () {
  "use strict";

  // ────────── Mandelbrot Thumbnail ──────────
  const MANDEL_PALETTE = [
    { r: 10,  g: 9,   b: 8   },
    { r: 20,  g: 18,  b: 22  },
    { r: 35,  g: 30,  b: 44  },
    { r: 60,  g: 44,  b: 72  },
    { r: 92,  g: 56,  b: 82  },
    { r: 132, g: 68,  b: 74  },
    { r: 178, g: 88,  b: 56  },
    { r: 220, g: 116, b: 54  },
    { r: 232, g: 161, b: 76  },
    { r: 242, g: 210, b: 138 },
    { r: 248, g: 234, b: 196 },
    { r: 220, g: 195, b: 158 },
    { r: 156, g: 132, b: 110 },
    { r: 92,  g: 72,  b: 68  },
    { r: 44,  g: 36,  b: 40  },
  ];

  function blendRGB(c1, c2, f) {
    return {
      r: Math.round(c1.r + f * (c2.r - c1.r)),
      g: Math.round(c1.g + f * (c2.g - c1.g)),
      b: Math.round(c1.b + f * (c2.b - c1.b)),
    };
  }

  class MandelbrotThumb {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      // Fixed internal resolution — fast and upscaled smoothly by CSS
      this.W = 200;
      this.H = 150;
      canvas.width = this.W;
      canvas.height = this.H;
      this._render();
    }

    _render() {
      const W = this.W, H = this.H;
      const xBounds = [-2.1, 1.0];
      const yBounds = [-0.95, 0.95];
      const maxstep = 80;
      const B2 = 256;
      const log2 = Math.log(2);
      const dx = (xBounds[1] - xBounds[0]) / W;
      const dy = (yBounds[1] - yBounds[0]) / H;
      const buf = new Uint8ClampedArray(W * H * 4);

      for (let j = 0; j < H; j++) {
        const cy = yBounds[0] + j * dy;
        for (let i = 0; i < W; i++) {
          const cx = xBounds[0] + i * dx;
          let zx = 0, zy = 0, n = 0, zx2 = 0, zy2 = 0;
          while (zx2 + zy2 < B2 && n < maxstep) {
            zy = 2 * zx * zy + cy;
            zx = zx2 - zy2 + cx;
            zx2 = zx * zx; zy2 = zy * zy;
            n++;
          }
          const base = (i + j * W) * 4;
          if (n >= maxstep) {
            buf[base] = 8; buf[base+1] = 7; buf[base+2] = 6; buf[base+3] = 255;
          } else {
            const log_zn = Math.log(zx2 + zy2) / 2;
            const nu = Math.log(log_zn / log2) / log2;
            const v = n + 1 - nu;
            const f = Math.pow(v / maxstep, 0.45) * (MANDEL_PALETTE.length - 1) * 1.4;
            const i0 = Math.floor(f) % MANDEL_PALETTE.length;
            const i1 = (i0 + 1) % MANDEL_PALETTE.length;
            const c = blendRGB(MANDEL_PALETTE[i0], MANDEL_PALETTE[i1], f - Math.floor(f));
            buf[base] = c.r; buf[base+1] = c.g; buf[base+2] = c.b; buf[base+3] = 255;
          }
        }
      }
      this.ctx.putImageData(new ImageData(buf, W, H), 0, 0);
    }
  }

  // ────────── Ising Thumbnail ──────────
  // 32 cols × 24 rows keeps the 4∶3 cell grid aligned to the canvas aspect ratio
  const ISING_ROWS = 24;
  const ISING_COLS = 32;

  function isingMod(x, m) { return ((x % m) + m) % m; }

  function squareType(c1, c2, c3, c4) {
    return (c1 === 1 ? 8 : 0) + (c2 === 1 ? 4 : 0) + (c3 === 1 ? 2 : 0) + (c4 === 1 ? 1 : 0);
  }

  class IsingThumb {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this._dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.T = 2.3; // just above T_c — dynamic domain structure
      this._grid = this._makeGrid();
      this._lastDraw = 0;
      this._frameInterval = 1000 / 15; // ~15 fps
      this._resize();
      this._raf = requestAnimationFrame(this._tick.bind(this));
      window.addEventListener("resize", () => this._resize());
    }

    _makeGrid() {
      return Array.from({ length: ISING_ROWS + 1 }, () =>
        Array.from({ length: ISING_COLS + 1 }, () => (Math.random() < 0.5 ? 1 : -1))
      );
    }

    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = this._dpr;
      this.canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }

    _step() {
      const grid = this._grid;
      const T = this.T;
      const sweepN = ISING_ROWS * ISING_COLS;
      for (let k = 0; k < sweepN; k++) {
        const x = (Math.random() * (ISING_COLS + 1)) | 0;
        const y = (Math.random() * (ISING_ROWS + 1)) | 0;
        const S =
          grid[y][isingMod(x + 1, ISING_COLS + 1)] +
          grid[y][isingMod(x - 1, ISING_COLS + 1)] +
          grid[isingMod(y + 1, ISING_ROWS + 1)][x] +
          grid[isingMod(y - 1, ISING_ROWS + 1)][x];
        const dE = 2 * grid[y][x] * S;
        if (Math.random() < 1 / (1 + Math.exp(dE / T))) grid[y][x] *= -1;
      }
    }

    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width, H = this.canvas.height;
      const grid = this._grid;
      const dpr = this._dpr;
      const cw = W / ISING_COLS, ch = H / ISING_ROWS;
      const r = Math.min(cw, ch) * 0.22;

      ctx.fillStyle = "#050403";
      ctx.fillRect(0, 0, W, H);

      // Spin glyphs
      for (let i = 0; i <= ISING_ROWS; i++) {
        for (let j = 0; j <= ISING_COLS; j++) {
          const cx = j * cw, cy = i * ch;
          if (grid[i][j] === -1) {
            ctx.strokeStyle = "#7BB3D9";
            ctx.lineWidth = dpr;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.strokeStyle = "#E8703A";
            ctx.lineWidth = dpr;
            const s = r * 0.6;
            ctx.beginPath();
            ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
            ctx.moveTo(cx - s, cy + s); ctx.lineTo(cx + s, cy - s);
            ctx.stroke();
          }
        }
      }

      // Marching-squares phase boundary in cream
      ctx.strokeStyle = "rgba(242,234,214,0.85)";
      ctx.lineWidth = 1.1 * dpr;
      for (let i = 0; i < ISING_ROWS; i++) {
        for (let j = 0; j < ISING_COLS; j++) {
          const sq = squareType(grid[i][j], grid[i][j+1], grid[i+1][j+1], grid[i+1][j]);
          const ax = j*cw + cw/2, ay = i*ch;
          const bx = j*cw + cw,   by = i*ch + ch/2;
          const cx = j*cw + cw/2, cy = i*ch + ch;
          const dx = j*cw,        dy = i*ch + ch/2;
          ctx.beginPath();
          switch (sq) {
            case 1:  ctx.moveTo(cx,cy); ctx.lineTo(dx,dy); break;
            case 2:  ctx.moveTo(bx,by); ctx.lineTo(cx,cy); break;
            case 3:  ctx.moveTo(bx,by); ctx.lineTo(dx,dy); break;
            case 4:  ctx.moveTo(ax,ay); ctx.lineTo(bx,by); break;
            case 5:  ctx.moveTo(ax,ay); ctx.lineTo(dx,dy); ctx.moveTo(bx,by); ctx.lineTo(cx,cy); break;
            case 6:  ctx.moveTo(ax,ay); ctx.lineTo(cx,cy); break;
            case 7:  ctx.moveTo(ax,ay); ctx.lineTo(dx,dy); break;
            case 8:  ctx.moveTo(ax,ay); ctx.lineTo(dx,dy); break;
            case 9:  ctx.moveTo(ax,ay); ctx.lineTo(cx,cy); break;
            case 10: ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.moveTo(cx,cy); ctx.lineTo(dx,dy); break;
            case 11: ctx.moveTo(ax,ay); ctx.lineTo(bx,by); break;
            case 12: ctx.moveTo(bx,by); ctx.lineTo(dx,dy); break;
            case 13: ctx.moveTo(bx,by); ctx.lineTo(cx,cy); break;
            case 14: ctx.moveTo(cx,cy); ctx.lineTo(dx,dy); break;
          }
          ctx.stroke();
        }
      }
    }

    _tick(ts) {
      if (ts - this._lastDraw >= this._frameInterval) {
        this._step();
        this._draw();
        this._lastDraw = ts;
      }
      this._raf = requestAnimationFrame(this._tick.bind(this));
    }
  }

  // ────────── Mass Spec Thumbnail ──────────
  // Loosely inspired by a peptide MS2 fragmentation spectrum
  const MS_PEAKS = [
    [0.055, 0.14], [0.11,  0.28], [0.18,  0.09], [0.24,  0.52],
    [0.30,  0.13], [0.36,  0.71], [0.43,  0.33], [0.49,  0.19],
    [0.545, 1.00], [0.60,  0.15], [0.655, 0.46], [0.71,  0.28],
    [0.77,  0.63], [0.825, 0.11], [0.88,  0.39], [0.935, 0.17],
  ];

  class MassSpecThumb {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this._dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._t = 0;
      this._resize();
      this._raf = requestAnimationFrame(this._tick.bind(this));
      window.addEventListener("resize", () => this._resize());
    }

    _resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width  = Math.max(1, Math.floor(rect.width  * this._dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * this._dpr));
    }

    _tick() {
      this._t += 0.018;
      this._draw();
      this._raf = requestAnimationFrame(this._tick.bind(this));
    }

    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width, H = this.canvas.height;
      const dpr = this._dpr;
      const t = this._t;

      ctx.fillStyle = "#050403";
      ctx.fillRect(0, 0, W, H);

      const plotBottom = H * 0.84;
      const plotH = plotBottom * 0.82;

      // Dim grid lines
      ctx.strokeStyle = "rgba(58,51,44,0.35)";
      ctx.lineWidth = dpr * 0.5;
      for (let g = 0.25; g < 1; g += 0.25) {
        const y = plotBottom - g * plotH;
        ctx.beginPath(); ctx.moveTo(W * 0.04, y); ctx.lineTo(W * 0.97, y); ctx.stroke();
      }

      // Baseline noise
      ctx.strokeStyle = "rgba(92,72,68,0.3)";
      ctx.lineWidth = dpr;
      ctx.beginPath();
      ctx.moveTo(0, plotBottom);
      for (let x = 0; x < W; x += 2) {
        const noise = (Math.sin(x * 0.25 + t * 2.1) + Math.sin(x * 0.09 + t * 0.7)) * H * 0.004;
        ctx.lineTo(x, plotBottom + noise);
      }
      ctx.stroke();

      // Peaks
      const barW = Math.max(dpr * 1.8, W * 0.016);
      MS_PEAKS.forEach(([mz, intensity], idx) => {
        const pulse = idx === 8 ? 1 + 0.03 * Math.sin(t * 2.5) : 1;
        const peakH = intensity * plotH * pulse;
        const px = mz * W;
        const py = plotBottom - peakH;

        // Color: low = brick, high = golden cream
        const bright = intensity;
        const r = Math.round(132 + bright * (242 - 132));
        const g = Math.round( 68 + bright * (210 -  68));
        const b = Math.round( 74 + bright * (138 -  74));

        const grad = ctx.createLinearGradient(px, py, px, plotBottom);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.92)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.28)`);
        ctx.fillStyle = grad;
        ctx.fillRect(px - barW / 2, py, barW, peakH);
      });

      // Axis
      ctx.strokeStyle = "rgba(92,72,68,0.6)";
      ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(W * 0.04, plotBottom); ctx.lineTo(W * 0.97, plotBottom); ctx.stroke();

      // Scan line sweeping across — amber glow
      const scanX = ((t * 0.2) % 1) * W;
      const scanGrad = ctx.createLinearGradient(scanX - W * 0.06, 0, scanX + W * 0.02, 0);
      scanGrad.addColorStop(0,   "rgba(232,112,58,0)");
      scanGrad.addColorStop(0.7, "rgba(232,112,58,0.06)");
      scanGrad.addColorStop(1,   "rgba(232,112,58,0.14)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - W * 0.06, 0, W * 0.08, plotBottom);

      ctx.strokeStyle = "rgba(232,112,58,0.4)";
      ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, plotBottom); ctx.stroke();

      // Label
      ctx.font = `${9 * dpr}px ui-monospace, SF Mono, monospace`;
      ctx.fillStyle = "rgba(92,72,68,0.6)";
      ctx.textAlign = "center";
      ctx.fillText("m / z", W / 2, H - dpr * 2);
    }
  }

  window.MandelbrotThumb = MandelbrotThumb;
  window.IsingThumb      = IsingThumb;
  window.MassSpecThumb   = MassSpecThumb;
})();
