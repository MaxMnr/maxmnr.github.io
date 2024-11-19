let mandelbrot;
let mouse;
let slider;
let returnButton;
let resetButton;
let can;

function setup() {
   let w = document.getElementById("animation-div").offsetWidth * 0.7;
   let h = w * 0.5;

   can = createCanvas(int(w), int(h));
   can.parent("animation-canvas");
   pixelDensity(1);
   mandelbrot = new Mandelbrot();
   mouse = new Mouse();
   slider = new Slider(32, 128, 16, 8, "Maximum Iter:");

   returnButton = createButton("Return").mousePressed(returnB);
   resetButton = createButton("Reset").mousePressed(resetB);

  returnButton.parent("animation-widgets");
  resetButton.parent("animation-widgets");

  resetButton.addClass("button-widgets");
  returnButton.addClass("button-widgets");

}

function draw() {
  background(0);
  fill(255);
  circle(0, 0, 200);
  slider.update();
  mandelbrot.plot();
  mouse.show();
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
  { r: 51, g: 51, b: 51 }, // dark purple
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

  // Shades of orange
  { r: 40, g: 142, b: 105 }, // green
  { r: 50, g: 162, b: 125 }, // shade green
  { r: 62, g: 182, b: 125 }, // shade green

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
  show(){
    push();
    textSize(14);
    noStroke();
    
    let x = map(mouseX, 0, width, mandelbrot.xBounds[0], mandelbrot.xBounds[1]);
    let y = map(mouseY, 0, height, mandelbrot.yBounds[0], mandelbrot.yBounds[1]);
    text("x: " + x + " y: " + y, 20, 20);
    pop();
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

    // Calculate selected area dimensions
    let selectionSize = Math.abs(mouse.len);
    
    // Map the selected area to complex plane coordinates
    let xmin = map(mouse.x, 0, width, mandelbrot.xBounds[0], mandelbrot.xBounds[1]);
    let ymin = map(mouse.y, 0, height, mandelbrot.yBounds[0], mandelbrot.yBounds[1]);
    let xmax = map(mouse.x + selectionSize, 0, width, mandelbrot.xBounds[0], mandelbrot.xBounds[1]);
    let ymax = map(mouse.y + selectionSize, 0, height, mandelbrot.yBounds[0], mandelbrot.yBounds[1]);

    // Calculate the actual aspect ratio of the canvas
    let aspectRatio = width / height;

    // Adjust bounds to keep the aspect ratio consistent
    let newWidth = xmax - xmin;
    let newHeight = (ymax - ymin) / aspectRatio;

    mandelbrot.xBounds = [xmin, xmin + newWidth];
    mandelbrot.yBounds = [ymin, ymin + newHeight];

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
    let w = document.getElementById("animation-div").offsetWidth * 0.7;
   let h = w * 0.5;
  resizeCanvas(int(w), int(h));
  mandelbrot = new Mandelbrot();
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
