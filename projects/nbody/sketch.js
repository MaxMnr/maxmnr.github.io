let camera;
let simulation;
let presets;
let startButton;
let addBodyButton;
let params;
let canvas;
let background_stars;

function preload() {
    presets = loadJSON("presets.json");
}

function setup() {
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas = createCanvas(500 * dpr, 300 * dpr, WEBGL);
    canvas.parent('canvas-container');
    camera = new Camera2D();
    simulation = new Simulation(G = 1, dt = 0.001, epsilon = 0.001);
    simulation.loadPreset(presets["bhh"]);
    startButton = createButton("Start").mousePressed(() => simulation.running = !simulation.running).parent("canvas-container")
    addBodyButton = createButton("Add Body").mousePressed(() => simulation.bodies.push(new Body(0, 0, 0, 0, 1, simulation.bodies.length))).parent("canvas-container")
    background_stars = makeBackground();
}

function draw() {
    background("#0A0908");
    push();
    camera.apply();
    simulation.update();
    simulation.show();

    displayStars(background_stars);
    pop();
}

function mouseWheel(event) {
    if (!mouseOnCanvas()) return;

    // zoom in/out (factor > 1.0 for zoom in, factor <
    const factor = event.delta > 0 ? 1.01 : 0.99;
    camera.zoomAt(factor, width / 2, height / 2);
    return false;
}

function mouseClicked() {
    if (!mouseOnCanvas()) return;
    let [mwx, mwy] = Object.values(camera.screenToWorld(mouseX, mouseY))
    simulation.mouseClicked(mwx, mwy)

}

function mousePressed() {
    if (!mouseOnCanvas()) return;
    let [mwx, mwy] = Object.values(camera.screenToWorld(mouseX, mouseY))
    simulation.mousePressed(mwx, mwy);
}

function mouseReleased() {
    if (!mouseOnCanvas()) return;
    let [mwx, mwy] = Object.values(camera.screenToWorld(mouseX, mouseY))
    simulation.mouseReleased(mwx, mwy);

}

function mouseDragged() {
    if (!mouseOnCanvas()) return;
    let [mwx, mwy] = Object.values(camera.screenToWorld(mouseX, mouseY))
    simulation.mouseDragged(mwx, mwy);

}


function mouseOnCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height
}

function makeBackground() {
    let stars = [];

    // density-based count similar to the original code
    const count = max(1000, floor((width * height) / 18000));

    for (let n = 0; n < count; n++) {
        stars.push({
            // screen-space coordinates
            x: random(-25, 25),
            y: random(-15, 15),
            // radius
            r: random(0, 0.03),
            // base alpha
            a: random(0.15, 0.7),
            // twinkle phase
            tw: random(TWO_PI),
        });
    }
    return stars;
}

function displayStars(stars) {
    noStroke();
    for (let star of stars) {
        // animate twinkle
        star.tw += 0.02;
        // oscillating alpha
        let alpha = star.a * (0.7 + 0.3 * sin(star.tw));
        fill(242, 234, 214, alpha * 255);
        circle(
            star.x,
            star.y,
            2 * star.r
        );
    }
}