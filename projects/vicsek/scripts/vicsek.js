let simulation;
let widgets;
function setup() {
  let canvasDiv = document.getElementById("animation-div");
  let w = canvasDiv.offsetWidth*0.7;
  let h = w * 0.5;
  let can = createCanvas(w, h);
  can.parent("animation-canvas");

  simulation = new Simulation(300, 10, 0);
  widgets = new Widgets();
}

function draw() {
  background(51);
  simulation.show();
  simulation.updateAngles();
  simulation.updatePositions();

  widgets.update();
}


