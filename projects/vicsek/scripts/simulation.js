class Simulation {
  constructor(N, L, B) {
    this.B = B;
    this.L = L;
    this.N = N;
    this.v_0 = 0.05;
    this.dt = 1;
    this.R = 1;

    this.particles = this.getParticles(this.N);
  }

  getParticles(N) {
    let particles = [];
    for (let i = 0; i < N; i++) {
      particles.push(new Particle(random(0, this.L), random(0, this.L)));
    }
    return particles;
  }

  show() {
    for (let part of this.particles) {
      part.show();
    }
  }

  updateAngles() {
    let savePart = this.particles.slice();
    for (let i = 0; i < this.particles.length; i++) {
      let p_i = this.particles[i];
      let n_i = [];

      // Get the neighbors of the i-th particle;
      for (let j = 0; j < this.particles.length; j++) {
        if (i != j) {
          let p_j = this.particles[j];
          let distance = toroidalDistance(p_i.pos.x, p_i.pos.y, p_j.pos.x, p_j.pos.y, this.L);
          if (distance < this.R) {
            n_i.push(j);
          }
        }
      }

      // Update the angle accordingly
      let c_i = new Complex(0, 0);
      for (let j = 0; j < n_i.length; j++) {
        let p_j = this.particles[n_i[j]];
        let c_j = new Complex(Math.cos(p_j.angle), Math.sin(p_j.angle));
        c_i.add(c_j);
      }
      if (n_i.length > 0) {
        c_i.divInt(n_i.length);
      }
      this.particles[i].angle = Complex.arg(c_i) + random(-this.B, this.B);
    }
  }

  updatePositions() {
    for (let i = 0; i < this.particles.length; i++) {
      let p_i = this.particles[i];
      let vel = createVector(this.v_0 * cos(p_i.angle), this.v_0 * sin(p_i.angle));

      p_i.pos.add(vel.mult(this.dt));

      // Logic for toroidal boundary conditions
      p_i.pos.x = (p_i.pos.x + this.L) % this.L;
      p_i.pos.y = (p_i.pos.y + this.L) % this.L;
    }
  }

  getAverageVelocity() {
    let v = new Complex(0, 0);
    for (let i = 0; i < this.particles.length; i++) {
      let p_i = this.particles[i];
      let v_i = new Complex(Math.cos(p_i.angle), Math.sin(p_i.angle));
      v.add(v_i);
    }

    // Divide the summed velocity vector by the number of particles to get the average
    v.divInt(this.particles.length);

    // Get the magnitude of the averaged velocity vector
    let avg_vel = Math.sqrt(Complex.nrm(v));
    return avg_vel;
  }

  initialize() {
    this.particles = this.getParticles(this.N);
    frameCount = 0;
  }
}

function toroidalDistance(x1, y1, x2, y2, L) {
  let delta_x = Math.min(Math.abs(x1 - x2), L - Math.abs(x1 - x2));
  let delta_y = Math.min(Math.abs(y1 - y2), L - Math.abs(y1 - y2));
  return Math.sqrt(delta_x ** 2 + delta_y ** 2);
}

