class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
  add(complex) {
    this.re += complex.re;
    this.im += complex.im;
  }
  divInt(N) {
    this.re /= N;
    this.im /= N;
  }

  static arg(complex) {
    const argument = Math.atan2(complex.im, complex.re);
    return argument;
  }

  static nrm(complex) {
    return complex.re ** 2 + complex.im ** 2;
  }
}

