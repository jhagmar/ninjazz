let THREE = undefined;
let Line2 = undefined;
let LineGeometry = undefined;
let LineMaterial = undefined;
let Lorenz = undefined;

const trailLength = 5;
const dt = 1 / 90;

class LorenzAttractor {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize() {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }

        if (Line2 == undefined) {
            Line2 = (await import(/*webpackChunkName: "line2"*/ 'three/examples/jsm/lines/Line2')).Line2;
        }

        if (LineGeometry == undefined) {
            LineGeometry = (await import(/*webpackChunkName: "linegeometry"*/ 'three/examples/jsm/lines/LineGeometry')).LineGeometry;
        }

        if (LineMaterial == undefined) {
            LineMaterial = (await import(/*webpackChunkName: "linematerial"*/ 'three/examples/jsm/lines/LineMaterial')).LineMaterial;
        }

        if (Lorenz == undefined) {
            Lorenz = (await import(/*webpackChunkName: "lorenzattractor"*/ '../lorenz/pkg/lorenz')).LorenzAttractor;
        }
        //console.log(Lorenz);*/

        this.lorenz = Lorenz.new();

        this.positions = [];
        const color = new THREE.Color();
        const colors = [];
        
        for (this.t = 0; this.t < trailLength; this.t += dt) {
            const state = this.lorenz.next(dt);
            this.positions.push(state.x, state.y, state.z);
            state.free();

            const h = this.t / trailLength;
            color.setHSL(h, 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        }
        this.T = this.t;

        this.geometry = new LineGeometry()
        this.geometry.setPositions(this.positions);
        this.geometry.setColors(colors);

        const matLine = new LineMaterial({
            color: 0xffffff,
            linewidth: 0.005, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
        });

        this.group = new THREE.Group();

        const line = new Line2(this.geometry, matLine);
        line.scale.set(1/30, 1/30, 1/30);
        line.translateZ(-1);
        this.group.add(line);
        this.group.translateY(2);
        this.scene.add(this.group);

    }

    update(dT) {
        this.T += dT;
        const n = Math.floor((this.T - this.t) / dt);
        for (let i = 0; i < n; i++) {
            const state = this.lorenz.next(dt);
            this.positions.push(state.x, state.y, state.z);
            state.free();
        }
        this.positions.splice(0, 3 * n);
        this.t += dt * n;
        this.geometry.setPositions(this.positions);
        this.group.rotateY(dT * Math.PI / 3);
    }

}

export default LorenzAttractor;