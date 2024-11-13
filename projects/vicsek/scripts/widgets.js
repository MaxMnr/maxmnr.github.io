class Widgets {
  constructor() {
    this.sliderN = new Slider(50, 1000, 200, 50, "N=");
    this.sliderL = new Slider(5, 50, 10, 1, "L=");
    this.sliderB = new Slider(0, 2, 0.1, 0.1, "Bias=");

    this.divD = createDiv().parent("animation-widgets").class("label");
    this.divV = createDiv().parent("animation-widgets").class("label");
  }
  update() {
    if (this.sliderL.value() != simulation.L) {
      this.sliderL.update();
      simulation.L = this.sliderL.value();
      simulation.initialize();
    }
    if (this.sliderB.value() != simulation.B) {
      this.sliderB.update();
      simulation.B = this.sliderB.value();
    }
    if (this.sliderN.value() != simulation.N) {
      this.sliderN.update();
      simulation.N = this.sliderN.value();
      simulation.initialize();
    }

    let N = this.sliderN.value();
    let L = this.sliderL.value();
    this.divD.html("Density: " + str(round(N / (L * L), 2)));
    this.divV.html("Order: " + str(simulation.getAverageVelocity().toFixed(1)));
  }
}

class Slider {
  constructor(min_, max_, start_, step_, label) {
    this.label = label;
    this.container = createDiv().class("slider-label").parent("animation-widgets");
    this.slider = createSlider(min_, max_, start_, step_).parent(this.container).class("slider");

    this.div = createDiv(label + str(this.slider.value()))
      .parent(this.container)
      .class("label");
  }

  update() {
    this.div.html(this.label + str(this.slider.value()));
  }

  value() {
    return round(this.slider.value(), 2);
  }

  setValue(val) {
    this.slider.value(val);
    this.div.html(this.label + str(val));
  }
}

