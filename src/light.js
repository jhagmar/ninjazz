let THREE = undefined;

const PERIOD = 30;
const MIN_X_PERIOD = 2;
const MAX_X_PERIOD = 4;
const MIN_Z_PERIOD = 2;
const MAX_Z_PERIOD = 4;

class Light {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize() {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }

        this.group = new THREE.Group();

        const cylinder1Geometry = new THREE.CylinderGeometry(0.075, 0.075, 0.2, 64);
        const cylinder1Material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const cylinder1 = new THREE.Mesh(cylinder1Geometry, cylinder1Material);
        cylinder1.translateY(-0.1);
        this.group.add(cylinder1);

        this.color = new THREE.Color();

        const cylinder2Geometry = new THREE.CylinderGeometry(0.075, 0.075, 0.01, 64);
        const cylinder2Material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cylinder2 = new THREE.Mesh(cylinder2Geometry, cylinder2Material);
        cylinder2.translateY(-0.205)
        this.group.add(cylinder2);

        this.disc = cylinder2;

        const spotLight = new THREE.SpotLight(0xffffff, 1.0, 20, Math.PI/24, 0.2, 1);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 0.5;
        spotLight.shadow.camera.far = 20;
        spotLight.shadow.camera.fov = 30;

        this.spotLight = spotLight;

        this.group.add(spotLight);
        this.scene.add(this.group);
        spotLight.target = this.disc;

        this.t = Math.random() * PERIOD;
        this.xPeriod = MIN_X_PERIOD + Math.random() * (MAX_X_PERIOD - MIN_X_PERIOD);
        this.zPeriod = MIN_Z_PERIOD + Math.random() * (MAX_Z_PERIOD - MIN_Z_PERIOD);

        this.color = new THREE.Color();

        //const lightHelper = new THREE.SpotLightHelper( spotLight );
		//scene.add( lightHelper );
    }

    getModel() {
        return this.group;
    }

    update(dT) {
        this.t += dT;
        this.color.setHSL(this.t / PERIOD, 1, 0.5);
        this.disc.material.emissive.set(this.color);
        this.spotLight.color.set(this.color);

        const xr = Math.sin(2*Math.PI * this.t / this.xPeriod) * Math.PI / 4;
        const zr = Math.sin(2*Math.PI * this.t / this.zPeriod) * Math.PI / 4;
        this.group.rotation.set(xr, 0., zr);
    }

}

export default Light;