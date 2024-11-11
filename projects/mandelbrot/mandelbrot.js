let mandelbrot;
let mouse;
let slider;
let returnButton;
let resetButton;
let can;

function setup() {
  let canvasDiv = document.getElementById("animation-both");
  let w = canvasDiv.offsetWidth;
  let h = canvasDiv.offsetHeight;
  can = createCanvas(int(w), int(w / 1.8));
  can.parent("animation-canvas");
  can.style("border-radius: 10pt");

  pixelDensity(1);
  mandelbrot = new Mandelbrot();
  mouse = new Mouse();

  slider = new Slider(32, 256, 16, 16, "Maximum Iter:");

  returnButton = createButton("Return").mousePressed(returnB);
  resetButton = createButton("Reset").mousePressed(resetB);

  returnButton.parent("animation-widgets");
  resetButton.parent("animation-widgets");

  resetButton.addClass("button").style("width: 10%; height:50%");
  returnButton.addClass("button").style("width: 10%; height:50%");
}

function draw() {
  background(0);
  slider.update();
  mandelbrot.plot();
  mouse.update();
  if (slider.value() != mandelbrot.maxstep) {
    mandelbrot.maxstep = slider.value();
    mandelbrot.makeGrid();
  }
}

function resetB() {
  mandelbrot.xBounds = [-2.1, 1];
  mandelbrot.yBounds = [-1, 1];
  mandelbrot.boundsSave = [[mandelbrot.xBounds, mandelbrot.yBounds]];
  mandelbrot.makeGrid();
}

function returnB() {
  if (mandelbrot.boundsSave.length > 1) {
    mandelbrot.xBounds = mandelbrot.boundsSave[mandelbrot.boundsSave.length - 2][0];
    mandelbrot.yBounds = mandelbrot.boundsSave[mandelbrot.boundsSave.length - 2][1];
    mandelbrot.boundsSave.pop();
    mandelbrot.makeGrid();
  }
}

// =================== MANDELBROT CLASS ===================

class Mandelbrot {
  constructor() {
    this.xBounds = [-2.1, 1];
    this.yBounds = [-1, 1];
    this.boundsSave = [[this.xBounds, this.yBounds]];
    this.maxstep = 64;
    this.B = 4;
    this.grid = [];
    this.makeGrid();
  }

  makeGrid() {
    for (let i = 0; i < width; i++) {
      this.grid[i] = [];
      let x = map(i, 0, width, this.xBounds[0], this.xBounds[1]);
      for (let j = 0; j < height; j++) {
        let y = map(j, 0, height, this.yBounds[0], this.yBounds[1]);
        let comp = this.compute(x, y);
        this.grid[i][j] = this.chooseColor(comp.n, comp.mod);
      }
    }
  }

  chooseColor(n, mod) {
    //let clr = map(n, 0, this.maxstep, 0, 255);
    let iter = n;
    if (n < this.maxstep) {
      let log_zn = Math.log(mod);
      let mu = Math.log(log_zn / log(2) ** n) / log(2);
      iter = iter + 1 - mu;
    }
    let col1 = palette[floor(iter) % palette.length];
    let col2 = palette[(floor(iter) + 1) % palette.length];

    let clr = linear_interpolate(col1, col2, n - floor(n));
    return clr;
  }

  compute(x, y) {
    let z = { x: 0, y: 0, mod: 0 };
    let c = { x: x, y: y };
    let step = 0;
    while (z.mod < this.B * this.B && step < this.maxstep) {
      let new_x = z.x * z.x - z.y * z.y + c.x;
      let new_y = 2 * z.x * z.y + c.y;
      z.x = new_x;
      z.y = new_y;
      z.mod = z.x * z.x + z.y * z.y;
      step++;
    }
    return { n: step, mod: z.mod };
  }

  plot() {
    background(0);
    loadPixels();
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let index = (i + j * width) * 4;
        let clr = this.grid[i][j];
        pixels[index] = clr.r;
        pixels[index + 1] = clr.g;
        pixels[index + 2] = clr.b;
        pixels[index + 3] = 255;
      }
    }
    updatePixels();
  }
}

let palette = [
  // Shades of purple
  { r: 22, g: 22, b: 26 }, // dark purple
  { r: 75, g: 35, b: 75 }, // medium purple
  { r: 150, g: 111, b: 214 }, // light purple

  // Shades of blue
  { r: 9, g: 1, b: 47 }, // dark blue
  { r: 4, g: 4, b: 73 }, // blue
  { r: 0, g: 7, b: 100 }, // bright blue
  { r: 12, g: 44, b: 138 }, // blue-grey
  { r: 24, g: 82, b: 177 }, // soft blue
  { r: 57, g: 125, b: 209 }, // sky blue
  { r: 134, g: 181, b: 229 }, // light sky blue
  { r: 211, g: 236, b: 248 }, // very light blue

  // Shades of yellow
  { r: 241, g: 233, b: 191 }, // light yellow
  { r: 248, g: 201, b: 95 }, // yellow
  { r: 255, g: 170, b: 0 }, // bright yellow

  // Shades of orange
  { r: 204, g: 128, b: 0 }, // orange
  { r: 153, g: 87, b: 0 }, // dark orange
  { r: 106, g: 52, b: 3 }, // darker orange
  { r: 255, g: 140, b: 0 }, // lighter orange
];

function linear_interpolate(color1, color2, fraction) {
  let r = color1.r + fraction * (color2.r - color1.r);
  let g = color1.g + fraction * (color2.g - color1.g);
  let b = color1.b + fraction * (color2.b - color1.b);
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// =================== MOUSE EVENTS CLASS ===================

class Mouse {
  constructor() {
    this.down = false;
    this.x = 0;
    this.y = 0;
    this.xpressed = 0;
    this.ypressed = 0;
    this.len = 0;
  }
  update() {
    if (this.down) {
      this.x = this.xpressed;
      this.y = this.ypressed;
      this.len = -this.x + mouseX;
      push();
      fill("rgba(250, 255, 250, 0.25)");
      stroke("white");
      strokeWeight(0.8);
      rect(this.x, this.y, this.len, this.len);
      pop();
    }
  }
}

function mousePressed() {
  if (mouseOnCanvas()) {
    mouse.down = true;
    mouse.xpressed = mouseX;
    mouse.ypressed = mouseY;
  }
}

function mouseReleased() {
  if (mouseOnCanvas() && mouse.len > 10) {
    mouse.down = false;

    // Aspect ratio of the canvas
    let aspectRatio = width / height;
    // Calculate selected area dimensions
    let w = Math.abs(mouse.len);
    let h = Math.abs(mouse.len);
    // Calculate new boundaries
    let xmin = map(mouse.x, 0, width, mandelbrot.xBounds[0], mandelbrot.xBounds[1]);
    let ymin = map(mouse.y, 0, height, mandelbrot.yBounds[0], mandelbrot.yBounds[1]);
    let xmax = map(mouse.x + w, 0, width, mandelbrot.xBounds[0], mandelbrot.xBounds[1]);
    let ymax = map(mouse.y + h, 0, height, mandelbrot.yBounds[0], mandelbrot.yBounds[1]);
    ymax /= aspectRatio;
    ymin /= aspectRatio;
    mandelbrot.xBounds = [min(xmin, xmax), max(xmin, xmax)];
    mandelbrot.yBounds = [min(ymin, ymax), max(ymin, ymax)];
    mandelbrot.boundsSave.push([mandelbrot.xBounds, mandelbrot.yBounds]);
    mandelbrot.makeGrid();
  } else {
    mouse.down = false;
  }
}

function mouseOnCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function windowResized() {
  //resizeCanvas(int(windowHeight * 0.8), int(windowHeight * 0.7));
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