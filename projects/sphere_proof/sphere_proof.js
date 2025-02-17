let sliderN;
let sliderLabel;
let checkBoxLabel;
let checkBox;

let showLines = 0;
let can;
let button;


function setup() {
  let canvasDiv = document.getElementById("animation-div");

  let w = canvasDiv.offsetWidth * 0.7;
  let h = w * 0.5;
  can = createCanvas(w, h);
  can.parent("animation-canvas");


  checkBoxLabel = createDiv("Show Full Sphere");
  checkBox = createCheckbox();
  sliderLabel = createDiv("AAA")
  sliderN = createSlider(1, 20, 1);
  button = createButton("Save").mousePressed(()=>(save("full_mesh.png")))

  checkBoxLabel.parent("animation-widgets");
  checkBox.parent("animation-widgets");
  sliderLabel.parent("animation-widgets");
  sliderN.parent("animation-widgets");
  button.parent("animation-widgets");

  checkBoxLabel.class("label");
  checkBox.class("checkbox");
  sliderLabel.class("label");
  sliderN.class("slider");
  button.class("button-widgets");
}

function draw() {
  background(40);

  let N = int(map(sliderN.value(), 1, 20, 7, 80));   // Number of slices
  let shift = 50; 
  let L = width - 2 * shift;  // Total width available for triangles
  let dx = L / N;  // Width of each slice
  let dy = height / 3;  // Height of the triangles
  let y = height / 2 - dy / 2;  // Center y position for the triangles
  sliderLabel.html("Number of Slices: " + N);
  strokeWeight(0);
  
  // Loop to draw both upper and lower triangles
  for (let i = 0; i < N; i++) {
    let x = shift + i * dx;  // Calculate the x position of each triangle

    // Alternate colors for the triangles
    let c1 = (i % 2 === 0) ? color(21, 80, 40) : color(231, 238, 233);
    let c2 = (i % 2 === 0) ? color(231, 238, 233) : color(21, 80, 40);

    // Define the points for the upper triangle
    let p1 = createVector(x, y);
    let p2 = createVector(x + dx, y);
    let p3 = createVector(x + dx / 2, y + dy);
    
        // Define the points for the lower triangle
    let p4 = createVector(x + dx / 2, y + dy);  // Top middle point of lower triangle
    let p5 = createVector(x + dx, y);           // Bottom left of lower triangle
    let p6 = createVector(x + dx + dx / 2, y + dy); // Bottom right of lower triangle
    stroke("black");
    strokeWeight(map(N, 7, 80, 1, 0));
    if (checkBox.checked()) {
    fill(c2);
    triangle(p4.x, p4.y, p5.x, p5.y, p6.x, p6.y); // Lower triangle
    }


      fill(c1);
      triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y); // Upper triangle

  }

  // If sliderN is set to 20 and showLines is enabled, draw the reference lines
  if (sliderN.value() == 20) {
    let Y = height / 2 - dy / 2;  // Centered y position for the lines
    push();
    stroke("red");
    strokeWeight(4);
    line(shift, Y, width - shift, Y);  // Horizontal red line
    stroke("orange");
    line(shift, Y, shift, Y + dy);  // Vertical yellow line
    pop();
  }
  
  
}
function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    showLines = (showLines + 1) % 2;
  }
  
}
