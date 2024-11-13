class Widgets {
  constructor() {
    this.select = createSelect().parent("animation-widgets").addClass("select");
    for (let name of jsons_names) {
      this.select.option(name);
    }

    this.run_button = createButton("Run")
      .mousePressed(() => (gol.running = (gol.running + 1) % 2))
      .parent("animation-widgets")
      .addClass("button-widgets")
      .style("width: 10%; height: 70%");
    this.random_button = createButton("Random")
      .mousePressed(() => (gol.board.grid = gol.board.makeRandomGrid()))
      .parent("animation-widgets")
      .addClass("button-widgets")
      .style("width: 10%; height: 70%");
    this.reset_button = createButton("Reset")
      .mousePressed(() => gol.reset())
      .parent("animation-widgets")
      .addClass("button-widgets")
      .style("width: 10%; height: 70%");

    this.size_slider = new Slider(10, 100, 20, 5, "Size: ");
    this.speed_slider = new Slider(10, 60, 10, 5, "Speed: ");

    this.save_button = createButton("save")
      .mousePressed(() => save(gol.board.grid, "saved_mask.json"))
      .parent("animation-widgets")
      .addClass("button-widgets")
      .style("width: 10%; height: 70%");
  }

  update() {
    this.size_slider.update();
    this.speed_slider.update();
    if (gol.board.mask.type != this.select.value()) {
      gol.board.changeMask(this.select.value());
    }
    if (gol.nrow != int(this.size_slider.value())) {
      let ratio = width / height;
      gol.nrow = this.size_slider.value();
      gol.ncol = this.size_slider.value() * ratio;
      gol.reset();
    }

    frameRate(this.speed_slider.value());
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

