/* ──────────────────────────────────────────────────────────────
   2D Ising model — adapted to portfolio palette.
   Glauber dynamics. Marching-squares overlay shows the boundary
   between phases.
   ──────────────────────────────────────────────────────────── */

let spins = [-1, 1];
let grid = [];
let row, col;
let res;
let T;
let running = false;
let can;

let tempSlider, resSlider, tempValEl, resValEl, magValEl;
let startBtn, resetBtn;

const COL_BG     = "#050403";
const COL_LINE   = "#3A332C";
const COL_DOWN   = "#7BB3D9";   // ice-blue (-1)
const COL_UP     = "#E8703A";   // burnt orange (+1)
const COL_INK    = "#F2EAD6";

function setup() {
  const host = document.getElementById("canvas-host");
  const w = host.clientWidth;
  const h = host.clientHeight;
  can = createCanvas(w, h);
  can.parent("canvas-host");

  tempSlider = document.getElementById("temp-slider");
  resSlider  = document.getElementById("res-slider");
  tempValEl  = document.getElementById("temp-val");
  resValEl   = document.getElementById("res-val");
  magValEl   = document.getElementById("mag-val");
  startBtn   = document.getElementById("btn-start");
  resetBtn   = document.getElementById("btn-reset");

  tempSlider.addEventListener("input", () => {
    tempValEl.textContent = parseFloat(tempSlider.value).toFixed(2);
  });
  resSlider.addEventListener("input", () => {
    resValEl.textContent = resSlider.value;
    res = parseInt(resSlider.value, 10);
    resetGrid();
  });
  startBtn.addEventListener("click", () => {
    running = !running;
    startBtn.textContent = running ? "Pause" : "Start";
    startBtn.classList.toggle("primary", !running);
  });
  resetBtn.addEventListener("click", resetGrid);

  frameRate(30);
  res = parseInt(resSlider.value, 10);
  tempValEl.textContent = parseFloat(tempSlider.value).toFixed(2);
  resValEl.textContent  = res;
  resetGrid();
}

function resetGrid() {
  res = parseInt(resSlider.value, 10);
  col = 2 * res;
  row = res;
  grid = [];
  for (let i = 0; i < row + 1; i++) {
    const r = [];
    for (let j = 0; j < col + 1; j++) {
      r.push(spins[(Math.random() * 2) | 0]);
    }
    grid.push(r);
  }
}

function draw() {
  background(COL_BG);

  T = parseFloat(tempSlider.value);

  if (running) {
    // Glauber dynamics — one full sweep per frame
    const sweepN = grid.length * grid[0].length;
    for (let k = 0; k < sweepN; k++) {
      const x = (Math.random() * grid[0].length) | 0;
      const y = (Math.random() * grid.length) | 0;
      const S =
        grid[y][mod(x + 1, grid[0].length)] +
        grid[y][mod(x - 1, grid[0].length)] +
        grid[mod(y + 1, grid.length)][x] +
        grid[mod(y - 1, grid.length)][x];
      const dE = 2 * grid[y][x] * S;
      const proba = 1 / (1 + Math.exp(dE / T));
      if (Math.random() < proba) grid[y][x] *= -1;
    }
  }

  const w = width / col;
  const h = height / row;
  const r = Math.min(w, h) * 0.28;

  // Spin glyphs
  for (let i = 0; i < row + 1; i++) {
    for (let j = 0; j < col + 1; j++) {
      const cx = j * w;
      const cy = i * h;
      if (grid[i][j] === -1) {
        stroke(COL_DOWN);
        strokeWeight(1);
        noFill();
        circle(cx, cy, r * 1.4);
      } else {
        stroke(COL_UP);
        strokeWeight(1);
        const s = r;
        line(cx - s, cy - s, cx + s, cy + s);
        line(cx - s, cy + s, cx + s, cy - s);
      }
    }
  }

  // Marching-squares contour — phase boundary in cream
  stroke(COL_INK);
  strokeWeight(1.2);
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      const TL = grid[i][j];
      const TR = grid[i][j + 1];
      const DR = grid[i + 1][j + 1];
      const DL = grid[i + 1][j];
      const sq = squareType(TL, TR, DR, DL);

      const ax = j * w + w / 2, ay = i * h;
      const bx = j * w + w,     by = i * h + h / 2;
      const cx = j * w + w / 2, cy = i * h + h;
      const dx = j * w,         dy = i * h + h / 2;

      switch (sq) {
        case 0:  break;
        case 1:  line(cx, cy, dx, dy); break;
        case 2:  line(bx, by, cx, cy); break;
        case 3:  line(bx, by, dx, dy); break;
        case 4:  line(ax, ay, bx, by); break;
        case 5:  line(ax, ay, dx, dy); line(bx, by, cx, cy); break;
        case 6:  line(ax, ay, cx, cy); break;
        case 7:  line(ax, ay, dx, dy); break;
        case 8:  line(ax, ay, dx, dy); break;
        case 9:  line(ax, ay, cx, cy); break;
        case 10: line(ax, ay, bx, by); line(cx, cy, dx, dy); break;
        case 11: line(ax, ay, bx, by); break;
        case 12: line(bx, by, dx, dy); break;
        case 13: line(bx, by, cx, cy); break;
        case 14: line(cx, cy, dx, dy); break;
        case 15: break;
      }
    }
  }

  // magnetisation readout
  if (frameCount % 6 === 0 && magValEl) {
    let s = 0, n = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) { s += grid[i][j]; n++; }
    }
    const m = s / n;
    magValEl.textContent = (m >= 0 ? "+" : "") + m.toFixed(3);
  }

  // T_c indicator
  if (Math.abs(T - 2.269) < 0.05) {
    push();
    noStroke();
    fill(232, 112, 58, 200);
    textFont("ui-monospace, SF Mono, monospace");
    textSize(11);
    textAlign(LEFT, TOP);
    text("≈ T_c (≈ 2.269)", 16, 14);
    pop();
  }
}

function squareType(c1, c2, c3, c4) {
  return (c1 === 1 ? 8 : 0) + (c2 === 1 ? 4 : 0) + (c3 === 1 ? 2 : 0) + (c4 === 1 ? 1 : 0);
}

function mod(x, m) {
  return ((x % m) + m) % m;
}

function windowResized() {
  const host = document.getElementById("canvas-host");
  const w = host.clientWidth;
  const h = host.clientHeight;
  resizeCanvas(w, h);
}
