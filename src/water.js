let THREE = undefined;
let Wave = undefined;

const waterWidth = 3;
const waterWidthResolution = 0.05;
const waterWidthSegments = Math.floor(waterWidth / waterWidthResolution);
const waterHeight = 5;
const waterHeightResolution = 0.05;
const waterHeightSegments = Math.floor(waterHeight / waterHeightResolution);

const waveSpeed = 1.0;

const nWaveGridPoints = (waterWidthSegments + 1) * (waterHeightSegments + 1);

class Water {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize() {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }

        if (Wave == undefined) {
            Wave = (await import(/*webpackChunkName: "wave"*/ '../wave/build/wave')).default;
        }

        this.waveEngine = await Wave();
        this.waveSim = this.waveEngine._init(waterWidthSegments + 1, waterHeightSegments + 1, waterWidthResolution
            , waterHeightResolution, waveSpeed);

        const waterGeometry = new THREE.PlaneGeometry(waterWidth, waterHeight, waterWidthSegments, waterHeightSegments);
        const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x43cad1, opacity: 0.8, transparent: true });
        this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        this.scene.add(this.waterMesh);
        this.waterMesh.rotateX(- Math.PI / 2);
        this.waterVertices = this.waterMesh.geometry.attributes.position;
        this.waterVerticesArray = this.waterVertices.array;
    }

    handleRaycaster(raycaster, mouseDown, mouseDownEdge, mouseMove) {
        if (mouseDownEdge || (mouseDown && mouseMove)) {
            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects([this.waterMesh]);

            if (intersects.length > 0) {
                const x = intersects[0].uv.x * waterWidth;
                const y = (1 - intersects[0].uv.y) * waterHeight;
                this.waveEngine._perturb(this.waveSim, x, y);
            }
        }

    }

    update(dT) {
        const grid = this.waveEngine._next(this.waveSim, 1/60);
        const gridPtr = this.waveEngine.HEAPF64.subarray(grid / 8, grid / 8 + nWaveGridPoints);

        let j = 2;
        for (let i = 0; i < nWaveGridPoints; i++) {
            this.waterVerticesArray[j] = gridPtr[i];
            j += 3;
        }
        this.waterVertices.needsUpdate = true;
        this.waterMesh.geometry.computeVertexNormals();
    }

}

export default Water;