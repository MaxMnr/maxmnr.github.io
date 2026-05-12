class Camera2D {
    constructor(viewSize = 8) {
        this.x = 0;
        this.y = 0;
        this.fixed = true;
        this.viewSize = viewSize;
        this.minViewSize = 2;
        this.maxViewSize = 30;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.viewSize = 0;
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

    pan(prevMx, prevMy, mx, my) {
        if (this.fixed) return;
        const prev = this.screenToWorld(prevMx, prevMy);
        const curr = this.screenToWorld(mx, my);
        this.x += prev.x - curr.x;
        this.y += prev.y - curr.y;
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