class Camera2D {
    constructor(viewSize = 8) {
        this.x = 0;
        this.y = 0;
        this.fixed = true;
        this.viewSize = viewSize;
        this.minViewSize = 2;   // max zoom in
        this.maxViewSize = 30;   // max zoom out
    }
    apply() {
        const zoom = height / this.viewSize;
        scale(zoom, -zoom, 1);
        translate(-this.x, -this.y, 0);
    }

    screenToWorld(mx, my) {
        const zoom = height / this.viewSize;
        return {
            x: (mx - width / 2) / zoom + this.x,
            y: -(my - height / 2) / zoom + this.y,
        };
    }

    zoomAt(factor, mx, my) {
        if (this.fixed) return;
        const before = this.screenToWorld(mx, my);
        this.viewSize *= factor;
        this.viewSize = constrain(
            this.viewSize,
            this.minViewSize,
            this.maxViewSize
        );
        const after = this.screenToWorld(mx, my);
        this.x += before.x - after.x;
        this.y += before.y - after.y;
    }
}