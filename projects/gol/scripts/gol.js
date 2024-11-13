class GameOfLife {
  constructor(nrow, ncol) {
    this.nrow = nrow;
    this.ncol = ncol;

    this.board = new Board(nrow, ncol);

    this.running = 0;
  }

  update() {
    this.board.update();
    
  }

  show() {
    this.board.show();
  }

  run() {
    let copy_grid = copyArray(this.board.grid);
    for (let row = 0; row < this.nrow; row++) {
      for (let col = 0; col < this.ncol; col++) {
        let alives = getNeighbours(copy_grid, row, col);

        // First Rule
        if (copy_grid[row][col] == 0 && alives == 3) {
          this.board.swap(row, col);
        }
        // Second Rule
        if (copy_grid[row][col] == 1 && !(alives == 2 || alives == 3)) {
          this.board.swap(row, col);
        }
      }
    }
  }
  reset() {
    this.board = new Board(this.nrow, this.ncol);
    this.running = 0;
  }
  mousePressed(x, y) {
    if (this.board.mask.type != "none") {
      this.board.applyMask();
      this.board.changeMask(0);
    } else {
      let col = int(map(x, 0, width, 0, this.ncol));
      let row = int(map(y, 0, height, 0, this.nrow));
      this.board.swap(row, col);
    }
  }
}

function mod(n, mod) {
  return (n + mod) % mod;
}

function copyArray(arr) {
  let copy = [];
  for (let r = 0; r < arr.length; r++) {
    let row = [];
    for (let c = 0; c < arr[0].length; c++) {
      row.push(arr[r][c]);
    }
    copy.push(row);
  }
  return copy;
}

function getNeighbours(array, row, col) {
  let N = array.length;
  let M = array[0].length;

  let c1 = array[mod(row - 1, N)][mod(col - 1, M)];
  let c2 = array[mod(row - 1, N)][col];
  let c3 = array[mod(row - 1, N)][mod(col + 1, M)];
  let c4 = array[row][mod(col + 1, M)];
  let c5 = array[mod(row + 1, N)][mod(col + 1, M)];
  let c6 = array[mod(row + 1, N)][col];
  let c7 = array[mod(row + 1, N)][mod(col - 1, M)];
  let c8 = array[row][mod(col - 1, M)];

  let alives = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8;
  return alives;
}

