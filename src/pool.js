let THREE = undefined;
let KINDS = undefined;
let loadTextures = undefined;
let CSG = undefined;

const poolWidth = 3;
const poolHeight = 5;
const poolDepth = 2;
const borderWidth = 0.2;
const borderHeight = 0.05;

const slabWidth = poolWidth + 2 * borderWidth;
const slabHeight = poolHeight + 2 * borderWidth;

const textureWidth = 1.1;
const textureHeight = 1.1;

class Pool {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize() {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }
        if (KINDS == undefined) {
            const t = await import(/*webpackChunkName: "texturehelpers"*/ './texture-helpers');
            KINDS = t.KINDS;
            loadTextures = t.loadTextures;
        }
        if (CSG == undefined) {
            CSG = (await import(/*webpackChunkName: "threecsgts"*/ 'three-csg-ts')).CSG;
        }

        const plane1Textures = await loadTextures('Marble062', [KINDS.COL, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], textureWidth, textureHeight, poolWidth, poolDepth);
        const plane3Textures = await loadTextures('Marble062', [KINDS.COL, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], textureWidth, textureHeight, poolHeight, poolDepth);
        const plane5Textures = await loadTextures('Marble062', [KINDS.COL, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], textureWidth, textureHeight, poolWidth, poolHeight);
        const borderTextures = await loadTextures('Marble062', [KINDS.COL, KINDS.NRM, KINDS.ROUGH, KINDS.REFL], textureWidth, textureHeight, slabWidth, slabHeight);

        const poolGroup = new THREE.Group();

        const poolPlane1Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: plane1Textures[KINDS.COL],
            normalMap: plane1Textures[KINDS.NRM],
            roughnessMap: plane1Textures[KINDS.ROUGH],
            metalnessMap: plane1Textures[KINDS.REFL],
        });

        const poolPlane3Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: plane3Textures[KINDS.COL],
            normalMap: plane3Textures[KINDS.NRM],
            roughnessMap: plane3Textures[KINDS.ROUGH],
            metalnessMap: plane3Textures[KINDS.REFL],
        });

        const poolPlane5Material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: plane5Textures[KINDS.COL],
            normalMap: plane5Textures[KINDS.NRM],
            roughnessMap: plane5Textures[KINDS.ROUGH],
            metalnessMap: plane5Textures[KINDS.REFL],
        });

        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: borderTextures[KINDS.COL],
            normalMap: borderTextures[KINDS.NRM],
            roughnessMap: borderTextures[KINDS.ROUGH],
            metalnessMap: borderTextures[KINDS.REFL],
        });

        const plane1Geometry = new THREE.PlaneGeometry(poolWidth, poolDepth);
        const plane1Mesh = new THREE.Mesh(plane1Geometry, poolPlane1Material);
        plane1Mesh.castShadow = true;
        plane1Mesh.receiveShadow = true;
        plane1Mesh.translateZ(-poolHeight/2);
        plane1Mesh.translateY(-poolDepth/2);
        plane1Mesh.geometry.computeBoundingBox();
        plane1Mesh.geometry.computeBoundingSphere();

        const plane2Mesh = plane1Mesh.clone();
        plane2Mesh.translateZ(poolHeight);
        plane2Mesh.rotateY(Math.PI);
        plane2Mesh.geometry.computeBoundingBox();
        plane2Mesh.geometry.computeBoundingSphere();

        const plane3Geometry = new THREE.PlaneGeometry(poolHeight, poolDepth);
        const plane3Mesh = new THREE.Mesh(plane3Geometry, poolPlane3Material);
        plane3Mesh.castShadow = true;
        plane3Mesh.receiveShadow = true;
        plane3Mesh.rotateY(Math.PI / 2);
        plane3Mesh.translateZ(-poolWidth/2);
        plane3Mesh.translateY(-poolDepth/2);
        plane3Mesh.geometry.computeBoundingBox();
        plane3Mesh.geometry.computeBoundingSphere();

        const plane4Mesh = plane3Mesh.clone();
        plane4Mesh.translateZ(poolWidth);
        plane4Mesh.rotateY(Math.PI);
        plane4Mesh.geometry.computeBoundingBox();
        plane4Mesh.geometry.computeBoundingSphere();

        const plane5Geometry = new THREE.PlaneGeometry(poolWidth, poolHeight);
        const plane5Mesh = new THREE.Mesh(plane5Geometry, poolPlane5Material);
        plane5Mesh.receiveShadow = true;
        plane5Mesh.rotateX(- Math.PI / 2);
        plane5Mesh.translateZ(-poolDepth);
        plane5Mesh.geometry.computeBoundingBox();
        plane5Mesh.geometry.computeBoundingSphere();

        const borderSlab = new THREE.Mesh(new THREE.BoxGeometry(slabWidth, slabHeight, borderHeight), borderMaterial);
        const borderCutoutMesh = new THREE.Mesh(new THREE.BoxGeometry(poolWidth, poolHeight, borderHeight + 0.1));
        borderSlab.updateMatrix();
        borderCutoutMesh.updateMatrix();
        const borderMesh = CSG.subtract(borderSlab, borderCutoutMesh);

        borderMesh.translateY(borderHeight / 2);
        borderMesh.rotateX(Math.PI / 2);

        poolGroup.add(plane1Mesh);
        poolGroup.add(plane2Mesh);
        poolGroup.add(plane3Mesh);
        poolGroup.add(plane4Mesh);
        poolGroup.add(plane5Mesh);
        poolGroup.add(borderMesh);
        this.scene.add(poolGroup);

    }

}

export default Pool;