let THREE = undefined;
let textureLoader = undefined;

const KINDS = {
    COL: 'COL',
    AO: 'AO',
    DISP: 'DISP',
    NRM: 'NRM',
    ROUGH: 'ROUGH',
    REFL: 'REFL',
    BUMP: 'BUMP',
    METALNESS: 'METALNESS',
}

async function loadTexture(url, textureWidth, textureHeight, geometryWidth, geometryHeight) {
    return new Promise((resolve) => {
        textureLoader.load(url, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(geometryWidth / textureWidth, geometryHeight / textureHeight);
            resolve(texture);
        })
    });
}

function getTextureUrls(prefix) {
    const base = './assets/textures/';
    const suffix = '_3K.jpg';
    return {
        COL: base + prefix + '_' + KINDS.COL + suffix,
        AO: base + prefix + '_' + KINDS.AO + suffix,
        DISP: base + prefix + '_' + KINDS.DISP + suffix,
        NRM: base + prefix + '_' + KINDS.NRM + suffix,
        ROUGH: base + prefix + '_' + KINDS.ROUGH + suffix,
        REFL: base + prefix + '_' + KINDS.REFL + suffix,
        BUMP: base + prefix + '_' + KINDS.BUMP + suffix,
        METALNESS: base + prefix + '_' + KINDS.METALNESS + suffix,
    };
}

async function loadTextures(prefix, kinds, textureWidth, textureHeight, geometryWidth, geometryHeight) {
    if (THREE == undefined) {
        THREE = await import(/*webpackChunkName: "three"*/ 'three');
        textureLoader = new THREE.TextureLoader();
    }
    const urls = getTextureUrls(prefix);
    let rv = {};
    for (let i = 0; i < kinds.length; i++) {
        rv[kinds[i]] = await loadTexture(urls[kinds[i]], textureWidth, textureHeight, geometryWidth, geometryHeight);
    }
    return rv;
}

export { KINDS, loadTextures };