class FourierDrawing {
  constructor(points, x_shift = 0, y_shift = 0, clr=[0, 0, 0]) {
    this.points = points;            
    this.coeff = dft(points);  
    this.run = 1;                    
    this.t = 0;                      
    this.path = [];                   
    this.x_shift = x_shift;               
    this.y_shift = y_shift;   
    
    this.clr = clr;
    if (clr[0] == 22){
        this.opacity = 255;
    }else{
        this.opacity = 100;
    }

    this.n_max = this.coeff.length/2;
  }

  updateAndShow() {
    if (!this.run) return;

    let x = 0;
    let y = 0;

    for (let i = 0; i < this.n_max; i++) {
      let freq = this.coeff[i].freq;
      let radius = this.coeff[i].amp;
      let phase = this.coeff[i].phase;

      let prevX = x;
      let prevY = y;

      x += radius * cos(freq * this.t + phase);
      y += radius * sin(freq * this.t + phase);
    
      if (i > 0 && i < 50 && this.t < TWO_PI){
        push();
        noFill();
        stroke(255, 50);
        strokeWeight(0.5);
        circle(prevX + this.x_shift, prevY + this.y_shift, radius * 2);
        line(prevX + this.x_shift, prevY + this.y_shift, x + this.x_shift, y + this.y_shift);
        pop();
      }
    }
    if (this.t < TWO_PI){
        this.path.push(createVector(x + this.x_shift, y + this.y_shift));
    }
    // Draw the traced path with x-axis and y-axis shift
    push();
    noFill();
    beginShape();
    stroke(clr_1[0], clr_1[1], clr_1[2]);
    strokeWeight(3);
    if (this.t > TWO_PI) {
      fill(color(this.clr[0], this.clr[1], this.clr[2], this.opacity));
      noStroke();
      this.opacity = this.opacity > 255 ? 255 : this.opacity + 3;
    }
    for (let v of this.path) {
      vertex(v.x, v.y);
    }
    endShape();
    pop();

    // Increment time for the next frame
    this.t += (TWO_PI / this.points.length);
  }
}



function dft(points) {
  let N = points.length;
  let coef = [];
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      let pt = points[n];
      let omega = (TWO_PI * k * n) / N;
      re += pt.x * cos(omega) + pt.y * sin(omega);
      im -= pt.x * sin(omega) - pt.y * cos(omega);
    }
    re = re / N;
    im = im / N;

    let freq = k;
    let amp = sqrt(re * re + im * im);
    let phase = atan2(im, re);
    coef.push({ re, im, freq, amp, phase });
  }
  //Sort the coeff by decreasing mag
  coef = coef.sort((a, b) => b.amp - a.amp);
  return coef;
}
