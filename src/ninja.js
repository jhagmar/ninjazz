let THREE;
let GLTFLoader;
let SkeletonUtils;

let model = undefined;
let animations = undefined;

const nAnimations = 6;

async function init() {
    return new Promise(async (resolve, reject) => {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }

        if (GLTFLoader == undefined) {
            GLTFLoader = (await import(/*webpackChunkName: "gltfloader"*/ 'three/examples/jsm/loaders/GLTFLoader')).GLTFLoader;
        }

        if (SkeletonUtils == undefined) {
            SkeletonUtils = await import(/*webpackChunkName: "skeletonutils"*/ 'three/examples/jsm/utils/SkeletonUtils');
        }

        const loader = new GLTFLoader();
        loader.load('./assets/models/ninja.glb', function (gltf) {
            model = gltf.scene;

            model.traverse(function (object) {

                if (object.isMesh) object.castShadow = true;

            });

            animations = gltf.animations;
            resolve();
        })
    })

}

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );
    action.play();

}

class Ninja {

    constructor(scene) {
        this.model = SkeletonUtils.clone(model);
        this.mixer = new THREE.AnimationMixer(this.model);
        this.actions = [];
        for (let i = 0; i < nAnimations; i++) {
            const action = this.mixer.clipAction(animations[i]);
            this.actions.push(action);
            setWeight(action, 0);
        }
        this.startAction = this.actions[Math.floor(Math.random() * nAnimations)];
        setWeight(this.startAction, 1);
        this.nextTransition = 5 + Math.random() * 5;
        this.t = 0;
        scene.add(this.model);
    }

    getModel() {
        return this.model;
    }

    update(dT) {
        this.t += dT;
        if (this.t > this.nextTransition) {
            let endAction = this.startAction;
            while (endAction == this.startAction) {
                endAction = this.actions[Math.floor(Math.random() * nAnimations)];
            }
            setWeight(endAction, 1);
            endAction.time = 0;
            this.startAction.crossFadeTo(endAction, 1, true);
            this.startAction = endAction;
            this.nextTransition += 5 + Math.random() * 5;
        }
        this.mixer.update(dT);
    }
}

export default Ninja;
export { init };

/*
function activateAllActions() {

    setWeight(idleAction, settings['modify idle weight']);
    setWeight(walkAction, settings['modify walk weight']);
    setWeight(runAction, settings['modify run weight']);

    actions.forEach(function (action) {

        action.play();

    });

}

function executeCrossFade(startAction, endAction, duration) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    setWeight(endAction, 1);
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo(endAction, duration, true);

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight(action, weight) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);

}*/
