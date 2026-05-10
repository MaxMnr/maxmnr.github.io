/* ──────────────────────────────────────────────────────────────
   Mandelbrot — adapted to the portfolio palette.
   Drag a square on the canvas to zoom; Back / Reset to navigate.
   Slider sets max iterations.
   ──────────────────────────────────────────────────────────── */

let mandelbrot;
let mouseSel;
let can;

let iterSlider;
let iterValEl;
let backBtn;
let resetBtn;

function setup() {
  const host = document.getElementById("canvas-host");
  const w = host.clientWidth;
  const h = host.clientHeight;
  can = createCanvas(w, h);
  can.parent("canvas-host");
  pixelDensity(1);
  noSmooth();

  iterSlider = document.getElementById("iter-slider");
  iterValEl = document.getElementById("iter-val");
  backBtn = document.getElementById("btn-back");
  resetBtn = document.getElementById("btn-reset");

  iterSlider.addEventListener("input", () => {
    iterValEl.textContent = iterSlider.value;
    mandelbrot.maxstep = parseInt(iterSlider.value, 10);
    mandelbrot.makeGrid();
  });
  backBtn.addEventListener("click", returnLevel);
  resetBtn.addEventListener("click", resetLevel);

  mandelbrot = new Mandelbrot();
  mouseSel = new Selection();

  iterValEl.textContent = iterSlider.value;
  mandelbrot.maxstep = parseInt(iterSlider.value, 10);
  mandelbrot.makeGrid();
}

function draw() {
  background(5, 4, 3);
  mandelbrot.plot();
  mouseSel.draw();
  drawCoordReadout();
}

function resetLevel() {
  mandelbrot.xBounds = [-2.1, 1.0];
  mandelbrot.yBounds = [-0.95, 0.95];
  mandelbrot.boundsSave = [[mandelbrot.xBounds, mandelbrot.yBounds]];
  mandelbrot.makeGrid();
}

function returnLevel() {
  if (mandelbrot.boundsSave.length > 1) {
    mandelbrot.boundsSave.pop();
    const last = mandelbrot.boundsSave[mandelbrot.boundsSave.length - 1];
    mandelbrot.xBounds = last[0];
    mandelbrot.yBounds = last[1];
    mandelbrot.makeGrid();
  }
}

// ────────── PALETTE ──────────
// Voyager / Apollo: deep space → warm cream → burnt orange flare → back to deep
// All values in 0-255 sRGB.
const palette = [
  { r: 10, g: 9, b: 8 }, // bg
  { r: 20, g: 18, b: 22 }, // night
  { r: 35, g: 30, b: 44 }, // indigo
  { r: 60, g: 44, b: 72 }, // plum
  { r: 92, g: 56, b: 82 }, // mauve
  { r: 132, g: 68, b: 74 }, // brick
  { r: 178, g: 88, b: 56 }, // burnt sienna
  { r: 220, g: 116, b: 54 }, // amber
  { r: 232, g: 161, b: 76 }, // golden
  { r: 242, g: 210, b: 138 }, // sunlit cream
  { r: 248, g: 234, b: 196 }, // warm cream highlight
  { r: 220, g: 195, b: 158 }, // cream warm
  { r: 156, g: 132, b: 110 }, // dust
  { r: 92, g: 72, b: 68 }, // muddy
  { r: 44, g: 36, b: 40 }, // back to night
];

function blendRGB(c1, c2, f) {
  return {
    r: Math.round(c1.r + f * (c2.r - c1.r)),
    g: Math.round(c1.g + f * (c2.g - c1.g)),
    b: Math.round(c1.b + f * (c2.b - c1.b)),
  };
}

// ────────── MANDELBROT ──────────
class Mandelbrot {
  constructor() {
    this.xBounds = [-2.1, 1.0];
    this.yBounds = [-0.95, 0.95];
    this.boundsSave = [[this.xBounds, this.yBounds]];
    this.maxstep = 96;
    this.B = 16;
    this.grid = null;
  }

  makeGrid() {
    const W = width, H = height;
    const buf = new Uint8ClampedArray(W * H * 4);
    const xLo = this.xBounds[0], xHi = this.xBounds[1];
    const yLo = this.yBounds[0], yHi = this.yBounds[1];
    const dx = (xHi - xLo) / W;
    const dy = (yHi - yLo) / H;
    const maxstep = this.maxstep;
    const B2 = this.B * this.B;
    const log2 = Math.log(2);

    for (let j = 0; j < H; j++) {
      const cy = yLo + j * dy;
      for (let i = 0; i < W; i++) {
        const cx = xLo + i * dx;
        let zx = 0, zy = 0;
        let n = 0;
        let zx2 = 0, zy2 = 0;
        while (zx2 + zy2 < B2 && n < maxstep) {
          zy = 2 * zx * zy + cy;
          zx = zx2 - zy2 + cx;
          zx2 = zx * zx;
          zy2 = zy * zy;
          n++;
        }

        let idx = (i + j * W) * 4;
        if (n >= maxstep) {
          // inside set — deep warm-black
          buf[idx] = 8;
          buf[idx + 1] = 7;
          buf[idx + 2] = 6;
          buf[idx + 3] = 255;
        } else {
          // smooth coloring
          const log_zn = Math.log(zx2 + zy2) / 2;
          const nu = Math.log(log_zn / log2) / log2;
          const v = (n + 1 - nu);
          // map to palette with a nonlinear ramp so the warm zone shows up
          const f = Math.pow(v / maxstep, 0.45) * (palette.length - 1) * 1.4;
          const i0 = Math.floor(f) % palette.length;
          const i1 = (i0 + 1) % palette.length;
          const frac = f - Math.floor(f);
          const c = blendRGB(palette[i0], palette[i1], frac);
          buf[idx] = c.r;
          buf[idx + 1] = c.g;
          buf[idx + 2] = c.b;
          buf[idx + 3] = 255;
        }
      }
    }
    this.grid = new ImageData(buf, W, H);
  }

  plot() {
    if (!this.grid) return;
    drawingContext.putImageData(this.grid, 0, 0);
  }
}

// ────────── SELECTION RECTANGLE ──────────
class Selection {
  constructor() {
    this.down = false;
    this.x0 = 0; this.y0 = 0;
    this.size = 0;
  }
  draw() {
    if (!this.down) return;
    push();
    noFill();
    stroke(232, 112, 58, 220);
    strokeWeight(1);
    drawingContext.setLineDash([4, 4]);
    rect(this.x0, this.y0, this.size, this.size);
    drawingContext.setLineDash([]);
    fill(232, 112, 58, 24);
    noStroke();
    rect(this.x0, this.y0, this.size, this.size);
    pop();
  }
}

function drawCoordReadout() {
  if (!onCanvas()) return;
  const x = lerp(mandelbrot.xBounds[0], mandelbrot.xBounds[1], mouseX / width);
  const y = lerp(mandelbrot.yBounds[0], mandelbrot.yBounds[1], mouseY / height);
  push();
  noStroke();
  fill(10, 9, 8, 200);
  rect(12, 12, 220, 30, 2);
  fill(242, 234, 214);
  textFont("ui-monospace, SF Mono, monospace");
  textSize(11);
  textAlign(LEFT, CENTER);
  text(`re ${x.toFixed(6)}   im ${y.toFixed(6)}`, 22, 28);
  pop();
}

function mousePressed() {
  if (onCanvas()) {
    mouseSel.down = true;
    mouseSel.x0 = mouseX;
    mouseSel.y0 = mouseY;
    mouseSel.size = 0;
  }
}

function mouseDragged() {
  if (mouseSel.down) {
    mouseSel.size = mouseX - mouseSel.x0;
  }
}

function mouseReleased() {
  if (!mouseSel.down) return;
  mouseSel.down = false;
  if (Math.abs(mouseSel.size) < 8) return;

  const s = mouseSel.size;
  const x0 = mouseSel.x0;
  const y0 = mouseSel.y0;
  const xa = Math.min(x0, x0 + s);
  const ya = Math.min(y0, y0 + s);
  const sz = Math.abs(s);

  const xLo = lerp(mandelbrot.xBounds[0], mandelbrot.xBounds[1], xa / width);
  const xHi = lerp(mandelbrot.xBounds[0], mandelbrot.xBounds[1], (xa + sz) / width);
  // keep aspect ratio of canvas
  const aspect = width / height;
  const newW = xHi - xLo;
  const newH = newW / aspect;
  const yMid = lerp(mandelbrot.yBounds[0], mandelbrot.yBounds[1], (ya + sz / 2) / height);
  const yLo = yMid - newH / 2;
  const yHi = yMid + newH / 2;

  mandelbrot.xBounds = [xLo, xHi];
  mandelbrot.yBounds = [yLo, yHi];
  mandelbrot.boundsSave.push([mandelbrot.xBounds, mandelbrot.yBounds]);
  mandelbrot.makeGrid();
}

function onCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function windowResized() {
  const host = document.getElementById("canvas-host");
  const w = host.clientWidth;
  const h = host.clientHeight;
  resizeCanvas(w, h);
  mandelbrot.makeGrid();
}
