let THREE = undefined;
let CSG = undefined;
let KINDS = undefined;
let loadTextures = undefined;

const roomWidth = 10;
const roomHeight = 4;
const roomDepth = 10;
const poolWidth = 3;
const poolHeight = 5;

const floorTextureWidth = 2;
const floorTextureHeight = 2;
const wallTextureWidth = 2;
const wallTextureHeight = 2;
const ceilingTextureWidth = 2;
const ceilingTextureHeight = 2;

class Walls {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize(cutouts) {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }
        if (CSG == undefined) {
            CSG = (await import(/*webpackChunkName: "threecsgts"*/ 'three-csg-ts')).CSG;
        }

        if (KINDS == undefined) {
            const t = await import(/*webpackChunkName: "texturehelpers"*/ './texture-helpers');
            KINDS = t.KINDS;
            loadTextures = t.loadTextures;
        }

        const wallGroup = new THREE.Group();

        const floorTextures = await loadTextures('TilesOnyxOpaloBlack001', [KINDS.COL, KINDS.DISP, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], floorTextureWidth, floorTextureHeight, roomWidth, roomDepth);
        const wall1Textures = await loadTextures('TilesRectangularMirrorGray001', [KINDS.COL, KINDS.DISP, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], wallTextureWidth, wallTextureHeight, roomWidth, roomHeight);
        const wall2Textures = await loadTextures('TilesRectangularMirrorGray001', [KINDS.COL, KINDS.DISP, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], wallTextureWidth, wallTextureHeight, roomDepth, roomHeight);
        const ceilingTextures = await loadTextures('TerrazzoVenetianMatteWhite001', [KINDS.COL, KINDS.DISP, KINDS.NRM, KINDS.ROUGH, KINDS.REFL, KINDS.AO, KINDS.BUMP], ceilingTextureWidth, ceilingTextureHeight, roomWidth, roomDepth);


        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: floorTextures[KINDS.COL],
            //aoMap: floorTextures[KINDS.AO],
            displacementMap: floorTextures[KINDS.DISP],
            displacementScale: 0.01,
            normalMap: floorTextures[KINDS.NRM],
            roughnessMap: floorTextures[KINDS.ROUGH],
            metalnessMap: floorTextures[KINDS.REFL],
        });

        const wall1Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: wall1Textures[KINDS.COL],
            //aoMap: wall1Textures[KINDS.AO],
            displacementMap: wall1Textures[KINDS.DISP],
            displacementScale: 0.02,
            normalMap: wall1Textures[KINDS.NRM],
            roughnessMap: wall1Textures[KINDS.ROUGH],
            metalnessMap: wall1Textures[KINDS.REFL],
        });

        const wall2Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: wall2Textures[KINDS.COL],
            //aoMap: wall2Textures[KINDS.AO],
            displacementMap: wall2Textures[KINDS.DISP],
            displacementScale: 0.02,
            normalMap: wall2Textures[KINDS.NRM],
            roughnessMap: wall2Textures[KINDS.ROUGH],
            metalnessMap: wall2Textures[KINDS.REFL],
        });

        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: ceilingTextures[KINDS.COL],
            aoMap: ceilingTextures[KINDS.AO],
            displacementMap: ceilingTextures[KINDS.DISP],
            displacementScale: 0.05,
            normalMap: ceilingTextures[KINDS.NRM],
            roughnessMap: ceilingTextures[KINDS.ROUGH],
            metalnessMap: ceilingTextures[KINDS.REFL],
            bumpMap: ceilingTextures[KINDS.BUMP],
            bumpScale: 0.05,
        });

        const floorPlaneMesh = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomDepth, 0.01), floorMaterial);
        const floorBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(poolWidth, poolHeight, 0.1));
        floorPlaneMesh.updateMatrix();
        floorBoxMesh.updateMatrix();

        let wall1BoxMesh = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 1), wall1Material);
        wall1BoxMesh.translateZ(- 0.5);
        wall1BoxMesh.translateY(roomHeight / 2);
        wall1BoxMesh.updateMatrix();

        for (let i = 0; i <  cutouts.length; i++) {
            wall1BoxMesh = CSG.subtract(wall1BoxMesh, cutouts[i]);
        }
        wall1BoxMesh.translateZ(- roomDepth / 2);

        const wall2PlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wall2Material);
        wall2PlaneMesh.translateY(roomHeight / 2);
        wall2PlaneMesh.translateX(roomWidth / 2);
        wall2PlaneMesh.rotateY(-Math.PI / 2)

        const wall3PlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wall1Material);
        wall3PlaneMesh.translateY(roomHeight / 2);
        wall3PlaneMesh.translateZ(roomDepth / 2);
        wall3PlaneMesh.rotateX(Math.PI);

        const wall4PlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wall2Material);
        wall4PlaneMesh.translateY(roomHeight / 2);
        wall4PlaneMesh.translateX(-roomWidth / 2);
        wall4PlaneMesh.rotateY(Math.PI / 2)

        const ceilingPlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), ceilingMaterial);
        ceilingPlaneMesh.translateY(roomHeight);
        ceilingPlaneMesh.rotateX(Math.PI / 2)

        const floorMesh = CSG.subtract(floorPlaneMesh, floorBoxMesh);
        floorMesh.rotateX(-Math.PI / 2);
        wallGroup.add(floorMesh);
        wallGroup.add(wall1BoxMesh);
        wallGroup.add(wall2PlaneMesh);
        wallGroup.add(wall3PlaneMesh);
        wallGroup.add(wall4PlaneMesh);
        wallGroup.add(ceilingPlaneMesh);
        this.scene.add(wallGroup);

    }

}

export default Walls;