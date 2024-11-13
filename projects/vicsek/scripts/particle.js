class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.angle = random(0, 2 * PI);
  }

  show() {
    drawParticle(this.pos.x, this.pos.y, this.angle);
  }
}
function drawParticle(x, y, angle) {
  x = map(x, 0, simulation.L, 0, width);
  y = map(y, 0, simulation.L, 0, height);

  let len = 10;
  push();
  stroke("white");
  fill("white");
  translate(x, y);

  let vel_angle = atan2(sin(angle), cos(angle));
  let part_angle = map(angle, 0, 2 * PI, 0, 2);
  line(0, 0, -len * cos(vel_angle + part_angle / 2), -len * sin(vel_angle + part_angle / 2));
  line(0, 0, -len * cos(vel_angle - part_angle / 2), -len * sin(vel_angle - part_angle / 2));
  pop();
}
