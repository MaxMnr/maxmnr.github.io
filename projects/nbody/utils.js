
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