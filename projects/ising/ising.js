let res;

let spins = [-1, 1];
let grid = [];
let row, col;

let sliderRes;
let sliderTemp;
let T;
let run = 0;
let can;
function setup() {
  let canvasDiv = document.getElementById("animation-div");
  let w = canvasDiv.offsetWidth * 0.7;
  let h = w * 0.5;
  can = createCanvas(w, h);
  can.parent("animation-canvas");

  buttonStart = createButton("Start").mousePressed(startB);
  buttonReset = createButton("Reset").mousePressed(reset);
  sliderTemp = new Slider(0.1, 5, 2.27, 0.01, "Temperature: ");
  sliderRes = new Slider(10, 100, 10, 1, "Resolution: ");

  buttonStart.parent("animation-widgets");
  buttonReset.parent("animation-widgets");

  buttonStart.addClass("button-widgets");
  buttonReset.addClass("button-widgets");

  frameRate(20);
  res = int(sliderRes.value());
  col = 2 * res;
  row = res;
  grid = [];
  for (let i = 0; i < row + 1; i++) {
    let new_row = [];
    for (let j = 0; j < col + 1; j++) {
      new_row.push(spins[int(random(2))]);
    }
    grid.push(new_row);
  }
}
function startB() {
  run = (run + 1) % 2;
  if (run % 2 == 1) {
    buttonStart.html("Stop");
  } else {
    buttonStart.html("Start");
  }
}
function resetup() {
  grid = [];
  res = sliderRes.value();
  col = 2 * res;
  row = res;

  for (let i = 0; i < row + 1; i++) {
    let new_row = [];
    for (let j = 0; j < col + 1; j++) {
      new_row.push(spins[int(random(2))]);
    }
    grid.push(new_row);
  }
}
function draw() {
  background(51);

  T = sliderTemp.value();
  sliderTemp.update();
  sliderRes.update();
  if (int(sliderRes.value()) != int(res)) {
    res = sliderRes.value();
    resetup();
  }

  if (run == 1) {
    //Simulate the evolution of the system using Glauber Dynamics
    for (let i = 0; i < grid.length * grid[0].length; i++) {
      let x = int(random(grid[0].length));
      let y = int(random(grid.length));
      let S =
        grid[y][mod(x + 1, grid[0].length)] +
        grid[y][mod(x - 1, grid[0].length)] +
        grid[mod(y + 1, grid.length)][x] +
        grid[mod(y - 1, grid.length)][x];
      let dE = 2 * grid[y][x] * S;
      let proba = 1 / (1 + exp(dE / T));
      if (random(1) < proba) {
        grid[y][x] *= -1;
      }
    }
  }

  //Display the grid using Marching Squares
  let w = width / col;
  let h = height / row;
  for (let i = 0; i < row + 1; i++) {
    for (let j = 0; j < col + 1; j++) {
      push();
      strokeWeight(1);
      if (grid[i][j] == -1) {
        stroke("#7f5af0");
        noFill();
        circle(j * w, i * h, min(w, h) / 2);
        point(j * w, i * h);
      }
      if (grid[i][j] == 1) {
        stroke("#2cb67d");
        cross(j * w, i * h, min(w, h) / 2);
      }
      //point(j * res + res/2, i * res + res/2)
      pop();

      // Accessing neighboring cells
      let TL = grid[i][j]; // Current cell
      let TR = j < col ? grid[i][j + 1] : undefined; // Right neighbor
      let DR = i < row && j < col ? grid[i + 1][j + 1] : undefined; // Bottom-right neighbor
      let DL = i < row ? grid[i + 1][j] : undefined; // Bottom neighbor

      let squareType = getSquareType(TL, TR, DR, DL);

      let a = createVector(j * w + w / 2, i * h);
      let b = createVector(j * w + w, i * h + h / 2);
      let c = createVector(j * w + w / 2, i * h + h);
      let d = createVector(j * w, i * h + h / 2);

      stroke("white");
      switch (squareType) {
        case 0:
          break;
        case 1:
          drawLine(c, d);
          break;
        case 2:
          drawLine(b, c);
          break;
        case 3:
          drawLine(b, d);
          break;
        case 4:
          drawLine(a, b);
          break;
        case 5:
          drawLine(a, d);
          drawLine(b, c);
          break;
        case 6:
          drawLine(a, c);
          break;
        case 7:
          drawLine(a, d);
          break;
        case 8:
          drawLine(a, d);
          break;
        case 9:
          drawLine(a, c);
          break;
        case 10:
          drawLine(a, b);
          drawLine(c, d);
          break;
        case 11:
          drawLine(a, b);
          break;
        case 12:
          drawLine(b, d);
          break;
        case 13:
          drawLine(b, c);
          break;
        case 14:
          drawLine(c, d);
          break;
        case 15:
          break;
      }
    }
  }
}

function windowResized() {
    let canvasDiv = document.getElementById("animation-div");
    let w = canvasDiv.offsetWidth * 0.7;
    let h = h * 0.5;

  resizeCanvas(int(w), int(h));
  resetup();
}

function reset() {
  grid = [];
  for (let i = 0; i < row + 1; i++) {
    let new_row = [];
    for (let j = 0; j < col + 1; j++) {
      new_row.push(spins[int(random(2))]);
    }
    grid.push(new_row);
  }
}

function getSquareType(c1, c2, c3, c4) {
  let b1 = c1;
  let b2 = c2;
  let b3 = c3;
  let b4 = c4;

  if (b1 == -1) {
    b1 = 0;
  }
  if (b2 == -1) {
    b2 = 0;
  }
  if (b3 == -1) {
    b3 = 0;
  }
  if (b4 == -1) {
    b4 = 0;
  }
  return int(b1 * 8 + b2 * 4 + b3 * 2 + b4 * 1);
}

function drawLine(vec1, vec2) {
  line(vec1.x, vec1.y, vec2.x, vec2.y);
}

function mod(x, m) {
  let res = x;
  while (res < 0) {
    res += m;
  }
  return res % m;
}

function cross(x, y, s) {
  line(x - s / 2, y - s / 2, x + s / 2, y + s / 2);
  line(x - s / 2, y + s / 2, x + s / 2, y - s / 2);
}

class Slider {
  constructor(min_, max_, start_, step_, label) {
    this.label = label;
    this.container = createDiv().class("slider-label").parent("animation-widgets");
    this.slider = createSlider(min_, max_, start_, step_).parent(this.container).class("slider");

    this.div = createDiv(label + str(this.slider.value()))
      .parent(this.container)
      .class("label");
  }

  update() {
    this.div.html(this.label + str(this.slider.value()));
  }

  value() {
    return round(this.slider.value(), 2);
  }

  setValue(val) {
    this.slider.value(val);
    this.div.html(this.label + str(val));
  }
}