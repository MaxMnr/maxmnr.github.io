
function fps() {
    push();
    resetMatrix();
    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, TOP);
    text(`FPS: ${round(frameRate())}`, -width / 2 + 10, -height / 2 + 10);
    pop();
}

function drawCircle(x, y, rad, steps) {
    beginShape();
    for (let i = 0; i < steps; i++) {
        const a = TWO_PI * i / steps;
        vertex(
            x + cos(a) * rad,
            y + sin(a) * rad
        );
    }
    endShape(CLOSE);
}