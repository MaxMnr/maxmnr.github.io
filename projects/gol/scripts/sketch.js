let gol;
let widgets;
let jsons;
let jsons_names = ["Select A Mask", "glyder", "osc", "weekender", "glyder gun", "eater"];

function preload() {
  jsons = loadJSON("masks.json");
}

function setup() {
  let canvasDiv = document.getElementById("animation-div");
  let w = canvasDiv.offsetWidth * 0.7;
  let h = w * 0.5;
  let can = createCanvas(w, h);
  can.parent("animation-canvas");
  gol = new GameOfLife(25, 20);
  widgets = new Widgets();
}

function draw() {
  background(51);
  gol.show();
  if (mouseOnScreen()) {
    gol.update();
  }

  widgets.update();

  if (gol.running == 1) {
    gol.run();
  } else {
    frameRate(30);
  }
}

function mouseOnScreen() {
  let x = mouseX;
  let y = mouseY;
  return x > 0 && x < width && y > 0 && y < height;
}

function mousePressed() {
  if (mouseOnScreen()) {
    gol.mousePressed(mouseX, mouseY);
  }
}

