class Mask {
  constructor(nrow, ncol, num) {
    this.nrow = nrow;
    this.ncol = ncol;
    this.type = jsons[num].name;
    this.mask = jsons[num].text;
    this.grid = this.makeGrid(mouseX, mouseY);
  }

  makeGrid(x, y) {
    let grid = [];
    for (let i = 0; i < this.nrow; i++) {
      let row = [];
      for (let j = 0; j < this.ncol; j++) {
        row.push(0);
      }
      grid.push(row);
    }
    let col = int(map(x, 0, width, 0, this.ncol));
    let row = int(map(y, 0, height, 0, this.nrow));
    let row_max = this.mask.length;
    let col_max = this.mask[0].length;
    for (let i = 0; i < this.mask.length; i++) {
      for (let j = 0; j < this.mask[0].length; j++) {
        if (this.mask[i][j] == 1) {
          grid[mod(row + i - int(row_max / 2), this.nrow)][mod(col + j - int(col_max / 2), this.ncol)] = 1;
        }
      }
    }
    return grid;
  }
}

