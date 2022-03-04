let THREE = undefined;

const nBins = 13;
const spectrumWidth = 8.0;
const spectrumHeight = 3.0;
const amplitudeBins = 8;
const widthSpacingWeight = 0.2;
const heightSpacingWeight = 0.4;
const dAmplitude = 256 / amplitudeBins;
const standBorderWidth = 0.3;
const standBorderHeight = 0.3;
const standDepth = 0.3;
const lightColor = 0xc44dff;
const darkColor = 0x7a00b8;
const cutoutDepth = 0.2;
const z = -5.1;

class Spectrum {

    constructor(scene) {
        this.scene = scene;
    }

    async initialize() {
        if (THREE == undefined) {
            THREE = await import(/*webpackChunkName: "three"*/ 'three');
        }

        const standWidth = 2 * standBorderWidth + spectrumWidth;
        const standHeight = 2 * standBorderHeight + spectrumHeight;

        const group = new THREE.Group();

        const totalWidthWeight = nBins + (nBins + 1)*widthSpacingWeight;
        const lightWidth = spectrumWidth/totalWidthWeight;
        const spacingWidth = widthSpacingWeight*spectrumWidth/totalWidthWeight;

        const totalHeightWeight = amplitudeBins + (amplitudeBins + 1)*heightSpacingWeight;
        const lightHeight = spectrumHeight/totalHeightWeight;
        const spacingHeight = heightSpacingWeight*spectrumHeight/totalHeightWeight;

        this.areaLight = new THREE.RectAreaLight(lightColor, 5.0, standWidth, standHeight);
        this.areaLight.position.set(0, standHeight/2, );
        this.areaLight.lookAt(0, standHeight/2, 1);
        group.add(this.areaLight);

        this.rectLights = [];
        this.cutOuts = [];

        for (let xi = 0; xi < nBins; xi++) {
            const x = -spectrumWidth/2 + spacingWidth + lightWidth/2 + xi*(lightWidth + spacingWidth);

            const bin = [];

            for (let yi = 0; yi < amplitudeBins; yi++) {
                const y = standBorderHeight + spacingHeight + lightHeight/2 + yi*(lightHeight + spacingHeight);

                const rectGeometry = new THREE.PlaneGeometry(lightWidth, lightHeight);
                const cutOut = new THREE.Mesh(new THREE.BoxGeometry(lightWidth, lightHeight, cutoutDepth * 2));
                const rectMaterial = new THREE.MeshStandardMaterial({color: darkColor});
                const rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
                rectMesh.position.set(x,y,0);
                cutOut.position.set(x,y,0);
                cutOut.updateMatrix();
                
                group.add(rectMesh);
                bin.push(rectMesh);
                this.cutOuts.push(cutOut);
            }

            this.rectLights.push(bin);

        }

        group.translateZ(z);
        this.scene.add(group);
    }

    update(frequencyData) {
        let amplitudeSum = 0;
        for (let xi = 0; xi < nBins; xi++) {
            const amplitude = frequencyData[xi];
            amplitudeSum += amplitude;

            for (let yi = 0; yi < amplitudeBins; yi++) {
                const amplitudeThreshold = dAmplitude * yi;
                const light = this.rectLights[xi][yi];
                if (amplitude > amplitudeThreshold) {
                    light.material.emissive.setHex(lightColor);
                } else {
                    light.material.emissive.setHex(0x000000);
                }
            }
        }
        const relativeAmplitude = amplitudeSum / (nBins * 255);
        this.areaLight.intensity = 5.0 * relativeAmplitude;
    }

    getCutouts() {
        return this.cutOuts;
    }

}

export default Spectrum;