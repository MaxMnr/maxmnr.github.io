class Body {
    static palette = [
        [242, 234, 214], // warm cream
        [232, 112, 58], // sky blue
        [123, 179, 217], // soft rose
        [180, 255, 200], // mint green
        [255, 210, 120], // amber
    ];

    constructor(x, y, vx, vy, mass = 1, colorIndex = 0) {
        this.mass = mass;
        this.rad = 0.05;
        this.init_params = {
            pos: { x, y },
            vel: { x: vx, y: vy },
        };
        this.pos = { x, y };
        this.vel = { x: vx, y: vy };
        this.acc = { x: 0, y: 0 };
        this.acc_prev = { x: 0, y: 0 };
        this.is_moving = false;
        this.is_selected = false;
        this.bodyColor = Body.palette[colorIndex % Body.palette.length];
        this.pane = null;
        this.traceBuffer = new Float32Array(1000 * 2);
        this.traceHead = 0;
        this.traceCount = 0;
        this.traceCapacity = 0;
        const paneContainer = document.getElementById("pane-right");
        if (typeof Pane !== 'undefined' && paneContainer) {
            this.pane = new Pane({
                container: paneContainer,
                title: "Body " + colorIndex,
            });
            this.initPane();
        }
    }

    initPane() {
        if (!this.pane) return;
        this.pane.addBinding(this, "mass", { min: 0.0001, max: 100, step: 0.0001 });
        this.pane.addBinding(this.init_params, "vel", {
            picker: "inline",
            expanded: true,
            label: "velocity",
            x: { min: -20, max: 20, step: 0.01 },
            y: { min: -20, max: 20, step: 0.01 },
        });
        // this.pane.addBinding(this.init_params, "vx", { min: -10, max: 10, step: 0.01, label: "vx" });
        // this.pane.addBinding(this.init_params, "vy", { min: -10, max: 10, step: 0.01, label: "vy" });
        this.pane.hidden = true;
    }

    reset() {
        this.pos.x = this.init_params.pos.x;
        this.pos.y = this.init_params.pos.y;
        this.vel.x = this.init_params.vel.x;
        this.vel.y = this.init_params.vel.y;
        this.acc.x = 0; this.acc.y = 0;
        this.acc_prev.x = 0; this.acc_prev.y = 0;
        this.traceHead = 0;
        this.traceCount = 0;
        this.traceCapacity = 0;
    }

    saveTrace(maxtrace) {
        if (maxtrace !== this.traceCapacity) {
            this.traceHead = 0;
            this.traceCount = 0;
            this.traceCapacity = maxtrace;
        }
        const i = this.traceHead * 2;
        this.traceBuffer[i] = this.pos.x;
        this.traceBuffer[i + 1] = this.pos.y;
        this.traceHead = (this.traceHead + 1) % maxtrace;
        if (this.traceCount < maxtrace) this.traceCount++;
    }

    showTrace(maxtrace) {
        const count = this.traceCount;
        if (count < 2) return;

        push();
        noFill();

        const start = count < maxtrace ? 0 : this.traceHead;

        const steps = 50;
        const seg = ceil(count / steps);

        for (let s = 0; s < steps; s++) {
            const i0 = s * seg;
            const i1 = min(count - 1, i0 + seg);

            if (i1 - i0 < 1) continue;

            // older segments faint, newer segments bright
            const alpha = 255 * pow((s + 1) / steps, 1.6) * 1;

            const [r, g, b] = this.bodyColor;
            stroke(r, g, b, alpha);
            strokeWeight(2);
            strokeCap(ROUND);
            strokeJoin(ROUND);

            beginShape();

            for (let i = i0; i <= i1; i++) {
                const idx = ((start + i) % maxtrace) * 2;
                vertex(this.traceBuffer[idx], this.traceBuffer[idx + 1]);
            }

            endShape();
        }

        pop();
    }
    show() {
        push();

        noStroke();

        const x = this.pos.x;
        const y = this.pos.y;

        let col;

        if (this.is_selected) {
            col = color(120, 255, 120);
        } else if (this.is_moving) {
            col = color(180, 180, 180);
        } else {
            const [r, g, b] = this.bodyColor;
            col = color(r, g, b);
        }

        const r = red(col);
        const g = green(col);
        const b = blue(col);

        // Fake radial gradient / glow
        const glowRadius = constrain(this.rad * 4, 0.01, 0.8);
        const layers = 50;

        for (let i = layers; i >= 1; i--) {
            const t = i / layers;
            const radius = glowRadius * t;

            // strongest in the center, fades outward
            const alpha = 255 * 0.12 * pow(1 - t, 1.8);

            fill(r, g, b, alpha);
            drawCircle(x, y, 2 * radius, 50);
        }

        // Main colored body
        fill(col);
        circle(x, y, this.rad * 1);

        // Bright white center
        fill(col[0], col[1], col[2], 100);
        circle(x, y, this.rad * 0.2);

        pop();
    }

    select() {
        this.is_selected = true;
        if (this.pane) this.pane.hidden = false;
    }

    deselect() {
        this.is_selected = false;
        if (this.pane) this.pane.hidden = true;
    }

    drag(mwx, mwy) {
        this.pos.x = mwx;
        this.pos.y = mwy;
        this.init_params.pos.x = mwx;
        this.init_params.pos.y = mwy;
    }

    isInside(x, y) {
        if (dist(x, y, this.pos.x, this.pos.y) < this.rad) {
            return true;
        }
    }
}
