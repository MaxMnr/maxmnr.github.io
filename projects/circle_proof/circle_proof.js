let R;
let depth = 0;
let shift_x = 0, shift_y = 0;
let sc = [1, 1];
let isDragging = false;
let lastMouseX, lastMouseY;
let button, button2, button3;
let depthDiv;
let nbrPts;
let can;
function setup() {
    let canvasDiv = document.getElementById("animation-div");

    let w = canvasDiv.offsetWidth * 0.4;
    let h = w
    can = createCanvas(w, h);
    can.parent("animation-canvas");
  R = width*0.95; // Make quarter-circle fill the whole canvas
  depthDiv = createDiv("Depth: " + depth);

  button = createButton("Iterate");
  button.mousePressed(() => depth += 1);

  button2 = createButton("Reset");
  button2.mousePressed(() => reset_func());

  button3 = createButton("Save");
  button3.mousePressed(() => save("folded_fractal.png"));

    depthDiv.parent("animation-widgets");
    button.parent("animation-widgets");
    button2.parent("animation-widgets");
    button3.parent("animation-widgets");

    button.class("button-widgets");
    button2.class("button-widgets");
    button3.class("button-widgets");
    depthDiv.class("label");
}

function draw() {

  background(40); // Dark gray background

  nbrPts = 3 * pow(2, depth);
  // Move origin to bottom-left corner
  translate(0 + shift_x, height + shift_y);
  scale(sc[0], sc[1]);
  scale(1, -1); // Flip to match the desired quadrant

  // Draw the top-right quarter circle filling the canvas
  stroke(color(231, 238, 233));
  strokeWeight(2);
  noFill();
  arc(0, 0, 2 * R, 2 * R, 0, HALF_PI); // Quarter-circle centered at bottom-left
  
  // Define the initial large square inside the quarter-circle
  let p1 = createVector(0, R);
  let p2 = createVector(R, R);
  let p3 = createVector(R, 0);
  
  push();
  square_mania(p1, p2, p3, depth, 0);
  pop();

  push();

    // Updta the depth label
    depthDiv.html("Depth: " + depth + " (" + nbrPts + " points)");

}

function square_mania(p1, p2, p3, depth, level) {
  if (depth == 0) {
    let c1 = color(21, 80, 40);
    stroke(c1)
    strokeWeight(2)
    line(p1.x, p1.y, p2.x, p2.y);
    line(p2.x, p2.y, p3.x, p3.y);
    
    return;
  }

  let angle = PI * 0.25;
  let ray = createVector(p2.x, p2.y);
  let dir = createVector(-cos(angle), -sin(angle));
  
  let eps = 1;
  let maxStep = 1000;
  while (ray.mag() - R > eps && maxStep > 0) {
    maxStep -= 1;
    ray.add(dir);
  }
  
  let new_p3 = createVector(ray.x, ray.y);
  let new_p2 = createVector(new_p3.x, p1.y);
  let new_p1 = createVector(p1.x, new_p2.y);
  
  square_mania(new_p1, new_p2, new_p3, depth - 1, level + 1);
  
  let a = new_p3.copy();
  let b = createVector(p3.x, a.y);
  let c = p3.copy();
  
  square_mania(a, b, c, depth - 1, level + 1);
}

function reset_func() {
  depth = 0;
  shift_x = 0;
  shift_y = 0;
  sc = [1, 1];
}

function mouseWheel(event) {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
  let zoomFactor = event.delta > 0 ? 0.95 : 1.05;
  sc[0] *= zoomFactor;
  sc[1] *= zoomFactor;
}

function mousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  isDragging = false;
}

function mouseDragged() {
  if (isDragging) {
    shift_x += mouseX - lastMouseX;
    shift_y += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
