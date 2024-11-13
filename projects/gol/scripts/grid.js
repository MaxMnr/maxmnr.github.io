class Board {
  constructor(nrow, ncol) {
    this.nrow = nrow;
    this.ncol = ncol;
    this.grid = this.makeGrid();
    this.mask = new Mask(nrow, ncol, 0);
  }

  update() {
    if (this.mask.type != "none") {
      this.mask.grid = this.mask.makeGrid(mouseX, mouseY);
    }
  }

  show() {
    push();
    strokeWeight(map(this.nrow, 10, 200, 1, 0.1));
    stroke(100);
    let w = width / this.ncol;
    let h = height / this.nrow;
    for (let row = 0; row < this.nrow; row++) {
      for (let col = 0; col < this.ncol; col++) {
        let cellState = this.grid[row][col];
        if (cellState === 0) {
          noFill();
          rect(col * w, row * h, w, h);
        } else if (cellState === 1) {
          fill("#2cb67d");
          rect(col * w, row * h, w, h, 2);
        }
        if (this.mask.grid[row][col] == 1 && mouseOnScreen()) {
          fill("#7f5af0");
          circle(col * w + w / 2, row * h + h / 2, h * 0.8);
        }
      }
    }
    pop();
  }

  swap(row, col) {
    this.grid[row][col] = (this.grid[row][col] + 1) % 2;
  }

  makeGrid() {
    let grid = [];
    for (let i = 0; i < this.nrow; i++) {
      let row = [];
      for (let j = 0; j < this.ncol; j++) {
        row.push(0);
      }
      grid.push(row);
    }
    return grid;
  }
  makeRandomGrid() {
    let grid = [];
    for (let i = 0; i < this.nrow; i++) {
      let row = [];
      for (let j = 0; j < this.ncol; j++) {
        row.push(int(random(2)));
      }
      grid.push(row);
    }
    return grid;
  }
  // ============= Mask related =============
  changeMask(type) {
    for (let i = 0; i < jsons_names.length; i++) {
      if (type == jsons_names[i]) {
        this.mask = new Mask(this.nrow, this.ncol, i);
      }
    }
  }

  applyMask() {
    for (let i = 0; i < this.nrow; i++) {
      for (let j = 0; j < this.ncol; j++) {
        if (this.mask.grid[i][j] == 1) {
          this.grid[i][j] = 1;
        }
      }
    }
    this.mask = new Mask(this.nrow, this.ncol, 0);
  }
  // =========================================
}

function mod(n, mod) {
  return (n + mod) % mod;
}

