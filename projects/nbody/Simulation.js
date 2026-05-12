
class Simulation {
    constructor(G, dt, epsilon, camera = null) {
        this.G = G;
        this.dt = dt;
        this.epsilon = epsilon;
        this.bodies = [];
        this.running = false;
        this.trajectories = [];
        this.trajectorySteps = 5000;
        this.trajectoryUpdateStep = 4;
        this.substeps = 10;
        this.traceLength = 1000;
        this.showCOM = false;
        this.pane = null;
        const paneContainer = document.getElementById("pane-left");
        if (typeof Pane !== 'undefined' && paneContainer) {
            this.pane = new Pane({
                container: paneContainer,
                title: "Physics",
            });
            this.initPane();
        }
        this.camera = camera
    }

    initPane() {
        if (!this.pane) return;

        this.pane.addBinding(this, "G", { min: 0, max: 10, step: 0.01 });
        this.pane.addBinding(this, "dt", { min: 0.0001, max: 0.01, step: 0.0001 });
        this.pane.addBinding(this, "epsilon", { min: 0.0001, max: 0.1, step: 0.001 });
        // this.pane.addBinding(this, "showCOM", { label: "Show Center of Mass" });
        this.pane.addBinding(this, "trajectorySteps", { min: 1000, max: 20000, step: 100, label: "Trajectory Steps" });
        this.pane.addBlade({
            view: 'separator',
        });
        this.pane.addBinding(this, "substeps", { min: 1, max: 100, step: 1, label: "Animation Speed" });
        this.pane.addBinding(this, "traceLength", { min: 100, max: 2000, step: 100, label: "Trail Length" });
        const btn = this.pane.addButton({ title: 'Start', label: 'Start / Stop' });
        btn.on('click', () => {
            this.running = !this.running;
            btn.title = this.running ? 'Stop' : 'Start';
        });
    }

    // Call after initPane() to insert a preset dropdown at the top of the physics pane.
    // presets is the full JSON object; currentKey is the initially selected key.
    addPresetSelector(presets, currentKey) {
        if (!this.pane) return;
        const opts = {};
        for (const [key, p] of Object.entries(presets)) {
            if (key !== 'default') opts[p.label] = key;
        }
        const state = { preset: currentKey || Object.values(opts)[0] };
        this.pane.addBinding(state, 'preset', {
            label: 'Preset',
            options: opts,
            index: 0,
        }).on('change', ev => {
            this.loadPreset(presets[ev.value]);
        });
    }

    loadPreset(preset) {
        for (const body of this.bodies) {
            if (body.pane) body.pane.dispose();
        }
        this.bodies = [];
        for (let i = 0; i < preset.bodies.length; i++) {
            const body = preset.bodies[i];
            this.bodies.push(new Body(body.x, body.y, body.vx, body.vy, body.mass, i));
        }
        this.initAcceleration();

        if (this.camera != null) {
            this.camera.viewSize = preset.view;
        }
    }

    show() {
        for (let body of this.bodies) {
            body.show()
        }
        if (!this.running) {
            this.showTrajectory()
        } else {
            for (let body of this.bodies) {
                body.showTrace(this.traceLength)
            }
        }

        if (this.showCOM) {
            this.displayCenterOfMass();
        }
    }

    update() {
        if (this.running) {
            for (let step = 0; step < this.substeps; step++) {
                this.velvetIntegration();
                if (step % 10 == 0) {
                    for (let body of this.bodies) {
                        body.saveTrace(this.traceLength);
                    }
                }
            }
        } else {
            if (frameCount % 5 == 0) {
                this.calculateTrajectory();
            }
        }
        this.updateRadii();
    }

    updateRadii() {
        const minR = 0.05;
        const maxR = 1;
        const equalR = 0.055;

        let minM = Infinity, maxM = -Infinity;
        for (const b of this.bodies) {
            if (b.mass < minM) minM = b.mass;
            if (b.mass > maxM) maxM = b.mass;
        }

        const span = maxM - minM;
        for (const body of this.bodies) {
            if (span < 1e-9) {
                body.rad = equalR;
            } else {
                // cube-root curve: 8× mass → 2× radius
                const t = (body.mass - minM) / span;
                body.rad = minR + (maxR - minR) * Math.pow(t, 1 / 3);
            }
        }
    }

    calculateTrajectory() {
        const nBodies = this.bodies.length;
        const nSaved = Math.ceil(this.trajectorySteps / this.trajectoryUpdateStep);

        this.trajectories = Array.from(
            { length: nBodies },
            () => new Float32Array(nSaved * 2)
        );

        this.trajectorySavedCount = 0;

        for (let step = 0; step < this.trajectorySteps; step++) {
            this.velvetIntegration();

            if (step % this.trajectoryUpdateStep === 0) {
                const k = this.trajectorySavedCount * 2;

                for (let i = 0; i < nBodies; i++) {
                    const body = this.bodies[i];
                    this.trajectories[i][k] = body.pos.x;
                    this.trajectories[i][k + 1] = body.pos.y;
                }

                this.trajectorySavedCount++;
            }
        }

        for (let body of this.bodies) {
            body.reset();
        }
        this.initAcceleration();
    }
    showTrajectory() {
        for (let j = 0; j < this.trajectories.length; j++) {
            const trajectory = this.trajectories[j];
            const [r, g, b] = Body.palette[j % Body.palette.length];

            push();
            strokeWeight(1);
            stroke(r, g, b, 120);
            noFill();

            beginShape();
            for (let p = 0; p < this.trajectorySavedCount; p++) {
                const k = p * 2;
                vertex(trajectory[k], trajectory[k + 1]);
            }
            endShape();

            pop();
        }
    }

    initAcceleration() {
        const n = this.bodies.length;
        const eps2 = this.epsilon * this.epsilon;
        for (let bi of this.bodies) { bi.acc.x = 0; bi.acc.y = 0; }
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const bi = this.bodies[i], bj = this.bodies[j];
                const rx = bj.pos.x - bi.pos.x;
                const ry = bj.pos.y - bi.pos.y;
                const d2 = rx * rx + ry * ry + eps2;
                const f = this.G / (d2 * Math.sqrt(d2));
                const fx = rx * f;
                const fy = ry * f;
                bi.acc.x += fx * bj.mass;
                bi.acc.y += fy * bj.mass;
                bj.acc.x -= fx * bi.mass;
                bj.acc.y -= fy * bi.mass;
            }
        }
    }

    velvetIntegration() {
        const n = this.bodies.length;
        const dt = this.dt;
        const eps2 = this.epsilon * this.epsilon;
        const G = this.G;
        const dt2half = dt * dt * 0.5;
        for (let bi of this.bodies) {
            bi.pos.x += bi.vel.x * dt + bi.acc.x * dt2half;
            bi.pos.y += bi.vel.y * dt + bi.acc.y * dt2half;
        }
        for (let bi of this.bodies) {
            bi.acc_prev.x = bi.acc.x;
            bi.acc_prev.y = bi.acc.y;
            bi.acc.x = 0;
            bi.acc.y = 0;
        }
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const bi = this.bodies[i], bj = this.bodies[j];
                const rx = bj.pos.x - bi.pos.x;
                const ry = bj.pos.y - bi.pos.y;
                const d2 = rx * rx + ry * ry + eps2;
                const f = G / (d2 * Math.sqrt(d2));
                const fx = rx * f;
                const fy = ry * f;
                bi.acc.x += fx * bj.mass;
                bi.acc.y += fy * bj.mass;
                bj.acc.x -= fx * bi.mass;
                bj.acc.y -= fy * bi.mass;
            }
        }
        const dthalf = dt * 0.5;
        for (let bi of this.bodies) {
            bi.vel.x += (bi.acc_prev.x + bi.acc.x) * dthalf;
            bi.vel.y += (bi.acc_prev.y + bi.acc.y) * dthalf;
        }
    }

    mouseClicked(mwx, mwy) {
        // Manage the selection of a body
        for (let body of this.bodies) {
            if (body.isInside(mwx, mwy)) {
                if (body.is_selected) {
                    body.deselect();
                } else {
                    body.select()
                }
                for (let b of this.bodies) {
                    if (b != body) {
                        b.deselect();
                    }
                }
                break
            }
        }


    }

    mousePressed(mwx, mwy) {
        for (let body of this.bodies) {
            if (body.isInside(mwx, mwy)) {
                body.is_moving = true;
            }
        }
    }

    mouseReleased(mwx, mwy) {
        for (let body of this.bodies) {
            if (body.isInside(mwx, mwy)) {
                body.is_moving = false;
            }
        }
    }

    mouseDragged(mwx, mwy) {
        for (let body of this.bodies) {
            if (body.is_moving) {
                body.drag(mwx, mwy);
            }
        }
    }


    displayCenterOfMass() {
        let cmx = 0, cmy = 0;
        let totalMass = 0;
        for (let body of this.bodies) {
            cmx += body.pos.x * body.mass;
            cmy += body.pos.y * body.mass;
            totalMass += body.mass;
        }
        cmx /= totalMass;
        cmy /= totalMass;
        let s = 0.01;
        push();
        fill("#1c1a1a");
        stroke("#1c1a1a");

        strokeWeight(0.1);
        line(cmx - s * cos(3 * PI / 4), cmy - s * sin(3 * PI / 4),
            cmx - s * cos(7 * PI / 4), cmy - s * sin(7 * PI / 4));
        line(cmx - s * cos(1 * PI / 4), cmy - s * sin(1 * PI / 4),
            cmx - s * cos(5 * PI / 4), cmy - s * sin(5 * PI / 4));
        pop();
    }
}
