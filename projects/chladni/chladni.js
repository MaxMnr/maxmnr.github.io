let simulation, w, h, dt;
let start_time;
let fps = null;
let can;

function setup() {
    let canvasDiv = document.getElementById("animation-div");
    let w = canvasDiv.offsetWidth * 0.5;
    let h = w * 0.8;
    can = createCanvas(int(w), int(h));
    can.parent("animation-canvas");
  pixelDensity(1);

  let N = 10000;
  let n = 4;
  let m = 5;
  w = width / 2;
  h = height / 2;
  dt = 0.04;

  simulation = new Simulation(N, n, m);
  start_time = millis();
  
}

function draw() {
  background(20);
  simulation.show();
  simulation.update();
  
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
    let n = int(map(mouseY, 0, height, 1, 10));
    let m = int(map(mouseX, 0, width, simulation.n+1, simulation.n+10));
    if (m != simulation.m){
      simulation.n = n;
      simulation.m = m;
      simulation.shake();
    }
  }
  
  printFPS();
  manageFPS();
  printParams();
}
  

class Simulation {
  constructor(nbr_sands, n, m) {
    this.N = nbr_sands;
    this.n = n;
    this.m = m;
    this.sands = [];
    this.makeSands();
  }

  makeSands() {
    let arr = [];
    for (let i = 0; i < this.N; i++) {
      arr.push(new Sand());
    }
    this.sands = arr
  }

  shake(){
    for (let grain of this.sands){
      let x = constrain(grain.pos.x+random(-dt, dt), -1, 1);
      let y = constrain(grain.pos.y+random(-dt, dt), -1, 1);
      grain.pos = createVector(x, y);
    }
  }
  
  show() {
    loadPixels();  // Prepare to manipulate pixel data

    let radius = 1;  // Radius of the circle around each grain
    let alphaValue = 200;  // Transparency level for the circle

    for (let grain of this.sands) {
      let x = int(map(grain.pos.x, -1, 1, 0, width));
      let y = int(map(grain.pos.y, -1, 1, 0, height));

      // Iterate over the pixels in a square around the grain
      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          let dx = x + i;
          let dy = y + j;

          // Ensure the pixel is within bounds
          if (dx >= 0 && dx < width && dy >= 0 && dy < height) {
            // Check if the pixel lies inside the circle (using Pythagoras)
            if (i * i + j * j <= radius * radius) {
              let index = (dx + dy * width) * 4;  // Calculate the pixel index

              pixels[index] = 127;         // Red
              pixels[index + 1] = 90;     // Green
              pixels[index + 2] = 240;   // Blue
              pixels[index + 3] = alphaValue;  // Alpha (transparency)
            }
          }
        }
      }
    }

    updatePixels();  // Apply changes to the canvas
  }

  update(){
    for (let grain of this.sands){
      grain.move();
    }
  }
}

class Sand {
  constructor() {
    this.pos = createVector(random(-1, 1), random(-1, 1));
  }

  move() {
    let ampl = getAmplitude(this.pos.x, this.pos.y, simulation.n, simulation.m);
    let angle = random(0, 2 * PI);
    let dir = p5.Vector.fromAngle(angle);
    let dr = p5.Vector.mult(dir, dt * ampl);
    this.pos.add(dr);
  }
}

function getAmplitude(x, y, n, m) {
  return abs(
    sin(n * PI * x * 0.5) * sin(m * PI * y * 0.5) - 
    sin(m * PI * x * 0.5) * sin(n * PI * y * 0.5)
  );
}

function printFPS() {
  textSize(14);
  fill("white");
  textAlign(CENTER);
  text("FPS: " + round(fps), 50, 40);
}

function printParams(){
  push();
  textSize(14);
  fill("white");
  textAlign(CENTER);
  text("N: " + round(simulation.n), 50, 60);
  text("M: " + round(simulation.m), 50, 75);
  pop();
}

function manageFPS(){
  let time_elapsed = (millis() - start_time) / 1000;
  fps = frameCount / time_elapsed;
  // To add: If FPS are too low, modify simulation.N to reduce the number of grains
  
  
}