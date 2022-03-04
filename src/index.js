import css from './styles.css';

let THREE;
let VRButton;
let RectAreaLightUniformsLib;
let FirstPersonControls;

let Light;
let LorenzAttractor;
let Ninja;
let ninjaInit;
let Pool;
let Spectrum;
let Walls;
let Water;
let XRControllerModelFactory;

class State {
    analyzer;
    camera;
    clock;
    controls;
    dolly;
    lorenz;
    ninjas;
    raycaster;
    renderer;
    scene;
    slights;
    sound;
    spectrum;
    water;

    mouse;
    mouseMove = false;
    mouseDown = false;
    mouseDownEdge = false;

    controller1Selected = false;
    controller2Selected = false;
    controller1;
    controller2;
    controllerGrip1;
    controllerGrip2;
}

let s = undefined;

function onMouseMove(event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    s.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    s.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    s.mouseMove = true;
}

function onMouseDown(event) {
    if (event.button == 0) {
        s.mouseDown = true;
        s.mouseDownEdge = true;
    }
}

function onMouseUp(event) {
    if (event.button == 0) {
        s.mouseDown = false;
    }
}

function onSelectStart(event) {

    if (event.target == s.controller1) {
        s.controller1Selected = true;
    } else if (event.target == s.controller2) {
        s.controller2Selected = true;
    }

}

function onSelectEnd(event) {

    if (event.target == s.controller1) {
        s.controller1Selected = false;
    } else if (event.target == s.controller2) {
        s.controller2Selected = false;
    }

}

function buildController(data) {

    let geometry, material;

    switch (data.targetRayMode) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

            material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });

            return new THREE.Line(geometry, material);

        case 'gaze':

            geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(geometry, material);

    }

}

function addNinjas(ninjas) {
    for (let i = 0; i < 6; i++) {
        const ninja = new Ninja(s.scene);
        ninjas.push(ninja);
    }
    const dx = 2.5;
    const dz = 1.5;
    const ry = Math.PI / 2;

    ninjas[0].getModel().translateZ(-dz);
    ninjas[0].getModel().translateX(dx);
    ninjas[0].getModel().rotateY(-ry);

    ninjas[1].getModel().translateX(dx);
    ninjas[1].getModel().rotateY(-ry);

    ninjas[2].getModel().translateZ(dz);
    ninjas[2].getModel().translateX(dx);
    ninjas[2].getModel().rotateY(-ry);

    ninjas[3].getModel().translateZ(-dz);
    ninjas[3].getModel().translateX(-dx);
    ninjas[3].getModel().rotateY(ry);

    ninjas[4].getModel().translateX(-dx);
    ninjas[4].getModel().rotateY(ry);

    ninjas[5].getModel().translateZ(dz);
    ninjas[5].getModel().translateX(-dx);
    ninjas[5].getModel().rotateY(ry);
}

async function addSLights(slights) {
    for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
            const l = new Light(s.scene);
            await l.initialize();
            const model = l.getModel();
            model.position.set(3 * (x - 0.5), 3.9, 3 * (z - 0.5));
            slights.push(l);
        }
    }
}

function setControllerRaycaster(controller) {

    const tempMatrix = new THREE.Matrix4();

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    s.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    s.raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

}

function addController(n) {
    const controller = s.renderer.xr.getController(n);
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('connected', function (event) {

        this.add(buildController(event.data));

    });
    controller.addEventListener('disconnected', function () {

        this.remove(this.children[0]);

    });
    s.dolly.add(controller);
    return controller;
}

function addControllerGrip(controllerModelFactory, n) {
    const controllerGrip = s.renderer.xr.getControllerGrip(n);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    s.dolly.add(controllerGrip);
    return controllerGrip;
}

function setProgress(msg) {
    document.getElementById("progress").innerHTML = msg + "...";
}

async function load() {
    return new Promise(async (resolve, reject) => {

        setProgress("importing modules");

        THREE = await import(/*webpackChunkName: "three"*/ 'three');
        VRButton = (await import(/*webpackChunkName: "vrbutton"*/ 'three/examples/jsm/webxr/VRButton')).VRButton;
        RectAreaLightUniformsLib = (await import(/*webpackChunkName: "rectarealightuniformslib"*/ 'three/examples/jsm/lights/RectAreaLightUniformsLib')).RectAreaLightUniformsLib;
        FirstPersonControls = (await import(/*webpackChunkName: "firstpersoncontrols"*/ './FirstPersonControls')).FirstPersonControls;
        XRControllerModelFactory = (await import(/*webpackChunkName: "xrcontrollermodelfactory"*/ 'three/examples/jsm/webxr/XRControllerModelFactory')).XRControllerModelFactory;

        Light = (await import(/*webpackChunkName: "light"*/ "./light")).default;
        LorenzAttractor = (await import(/*webpackChunkName: "lorenz"*/ "./lorenz")).default;
        const n = await import(/*webpackChunkName: "ninja"*/ "./ninja");
        Ninja = n.default;
        ninjaInit = n.init;
        Pool = (await import(/*webpackChunkName: "pool"*/ "./pool")).default;
        Spectrum = (await import(/*webpackChunkName: "spectrum"*/ "./spectrum")).default;
        Walls = (await import(/*webpackChunkName: "walls"*/ "./walls")).default;
        Water = (await import(/*webpackChunkName: "water"*/ "./water")).default;

        RectAreaLightUniformsLib.init();

        setProgress("creating scene");

        s = new State();

        s.scene = new THREE.Scene();

        const fog = new THREE.FogExp2(0xff48c4, 0.16);
        s.scene.fog = fog;

        //const alight = new THREE.AmbientLight(0x005e75);
        //s.scene.add(alight);

        const light = new THREE.SpotLight(0x66e0ff, 2.0, 20, Math.PI / 4, 1.0, 1.0);
        light.position.set(5, 5, -5);
        light.castShadow = true;
        light.shadow.camera.top = 10;
        light.shadow.camera.bottom = -10;
        light.shadow.camera.right = 10;
        light.shadow.camera.left = -10;
        light.shadow.mapSize.set(4096, 4096);
        s.scene.add(light);

        s.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);

        s.dolly = new THREE.Group();
        s.dolly.add(s.camera);
        s.scene.add(s.dolly);
        s.dolly.position.set(0, 1.2, 4);

        s.renderer = new THREE.WebGLRenderer({ antialias: true });
        s.renderer.setSize(window.innerWidth, window.innerHeight);
        s.renderer.shadowMap.enabled = true;
        s.renderer.xr.enabled = true;
        s.renderer.xr.setReferenceSpaceType('local');
        document.getElementById("scene").appendChild(s.renderer.domElement);

        s.controls = new FirstPersonControls(s.dolly, s.renderer.domElement);
        s.controls.movementSpeed = 2;
        s.controls.lookSpeed = Math.PI / 3;

        document.body.appendChild(VRButton.createButton(s.renderer));

        setProgress("creating water simulation");

        s.water = new Water(s.scene);
        await s.water.initialize();

        const pool = new Pool(s.scene);
        await pool.initialize();

        setProgress("initializing sound");

        const loudspeakerGroup = new THREE.Group();
        loudspeakerGroup.position.set(0, 1.6, -5);
        s.scene.add(loudspeakerGroup);

        const listener = new THREE.AudioListener();
        s.camera.add(listener);

        s.sound = new THREE.PositionalAudio(listener);
        s.sound.setRefDistance(5);
        loudspeakerGroup.add(s.sound);

        await new Promise((resolve, reject) => {
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load('assets/audio/occasions-trance-9105.mp3', function (buffer) {
                s.sound.setBuffer(buffer);
                s.sound.setLoop(true);
                s.sound.setVolume(1.0);
                resolve();
            });
        });

        s.analyzer = new THREE.AudioAnalyser(s.sound, 32);

        setProgress("creating spectrum analyzer");

        s.spectrum = new Spectrum(s.scene);
        await s.spectrum.initialize();

        const walls = new Walls(s.scene);
        await walls.initialize(s.spectrum.getCutouts());

        setProgress("creating Lorenz Attractor simulation");

        s.lorenz = new LorenzAttractor(s.scene);
        await s.lorenz.initialize();

        setProgress("creating ninjas");

        s.ninjas = [];
        await ninjaInit();
        addNinjas(s.ninjas);

        setProgress("adding spotlights");

        s.slights = [];
        addSLights(s.slights);

        setProgress("initializing controllers");

        s.mouse = new THREE.Vector2();
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mouseup', onMouseUp, false);

        s.raycaster = new THREE.Raycaster();

        s.controller1 = addController(0);
        s.controller2 = addController(1);

        const controllerModelFactory = new XRControllerModelFactory();

        s.controllerGrip1 = addControllerGrip(controllerModelFactory, 0);
        s.controllerGrip2 = addControllerGrip(controllerModelFactory, 1);

        s.clock = new THREE.Clock();

        window.addEventListener('resize', () => {
            s.renderer.setSize(window.innerWidth, window.innerHeight);
            s.camera.aspect = window.innerWidth / window.innerHeight;
            s.camera.updateProjectionMatrix();
            s.controls.handleResize();
        }, true);

        resolve();
    });
}

const render = function () {

    const dT = s.clock.getDelta();

    s.analyzer.getFrequencyData();

    // update the picking ray with the camera and mouse position
    s.raycaster.setFromCamera(s.mouse, s.camera);

    s.water.handleRaycaster(s.raycaster, s.mouseDown, s.mouseDownEdge, s.mouseMove);

    setControllerRaycaster(s.controller1);

    s.water.handleRaycaster(s.raycaster, s.controller1Selected, false, true);

    setControllerRaycaster(s.controller2);

    s.water.handleRaycaster(s.raycaster, s.controller2Selected, false, true);

    s.water.update(dT);

    s.spectrum.update(s.analyzer.data);

    s.controls.update(dT);

    s.lorenz.update(dT);

    for (let i = 0; i < 6; i++) {
        s.ninjas[i].update(dT);
    }

    for (let i = 0; i < s.slights.length; i++) {
        s.slights[i].update(dT);
    }

    //renderer.xr.updateCamera(camera);
    s.renderer.render(s.scene, s.camera);

    s.mouseMove = false;
    s.mouseDownEdge = false;
}

const animate = function () {
    s.sound.play();
    s.renderer.setAnimationLoop(render);
};

function go() {
    document.getElementById("scene").classList = ["shown"];
    document.getElementById("loadscreen").classList = ["hidden"];
    animate();
}

document.getElementById("button").addEventListener("click", go);

load().then(() => {

    document.getElementById("button").disabled = false;
    document.getElementById("progress").classList = ["hidden"];
});
