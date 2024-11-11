let canvas;
let scale = 0.3;
//let clr_1 = [44, 182, 125];
let clr_1 = [127, 90, 240];
let clr_2 = [22, 22, 26];

let data_left;
let data_right_1;
let data_right_2;
let data_right_3;

let fourier_left;
let fourier_right_1;
let fourier_right_2;
let fourier_right_3;


function preload() {
  data_left = loadStrings('projects/main_animation_fourier/data_path/points_left.txt');  
  data_right_1 = loadStrings('projects/main_animation_fourier/data_path/points_right_1.txt');
  data_right_2 = loadStrings('projects/main_animation_fourier/data_path/points_right_2.txt');
  data_right_3 = loadStrings('projects/main_animation_fourier/data_path/points_right_3.txt');
}

function setup() {
  let w = document.getElementById("main-section").offsetWidth;
  let h = document.getElementById("main-section").offsetHeight;

  canvas = createCanvas(w, h*0.99);
  canvas.parent("p5-main-animation");

  points_left = parse_file(data_left);
  points_right_1 = parse_file(data_right_1);
  points_right_2 = parse_file(data_right_2);
  points_right_3 = parse_file(data_right_3);

  let x_shift = width/2*(1-scale);
  let y_shift = -2 + height*(1-scale)/2;
  fourier_left = new FourierDrawing(points_left, 0 + x_shift, -2 + y_shift , clr=clr_1);
  fourier_right_1 = new FourierDrawing(points_right_1, width/2.1, -1 + y_shift, clr=clr_1);
  fourier_right_2 = new FourierDrawing(points_right_2, width/2.1, -1 + y_shift, clr=clr_2);
  fourier_right_3 = new FourierDrawing(points_right_3, width/2.1, -1 + y_shift, clr=clr_2);

}

function draw() {
  background(22, 22, 26);
  fourier_left.updateAndShow();
  fourier_right_1.updateAndShow();
  fourier_right_2.updateAndShow();
  fourier_right_3.updateAndShow();
}

function parse_file(data){
    let pts = [];
    for (let i = 0; i < data.length; i++){
      let [x, y] = data[i].split(" ");
      pts.push(createVector(x*width/2*scale, y*height*scale));
    }
    return pts
}

function windowResized() {
  let w = document.getElementById("main-section").offsetWidth;
  let h = document.getElementById("main-section").offsetHeight;
  resizeCanvas(w, h*0.99);
  points_left = parse_file(data_left);
  points_right_1 = parse_file(data_right_1);
  points_right_2 = parse_file(data_right_2);
  points_right_3 = parse_file(data_right_3);
  

  

  let x_shift = width/2*(1-scale);
  let y_shift = -2 + height*(1-scale)/2;
  fourier_left = new FourierDrawing(points_left, 0 + x_shift, -2 + y_shift , clr=clr_1);
  fourier_right_1 = new FourierDrawing(points_right_1, width/2.14, -1 + y_shift, clr=clr_1);
  fourier_right_2 = new FourierDrawing(points_right_2, width/2.14, -1 + y_shift, clr=clr_2);
  fourier_right_3 = new FourierDrawing(points_right_3, width/2.14, -1 + y_shift, clr=clr_2);

}
