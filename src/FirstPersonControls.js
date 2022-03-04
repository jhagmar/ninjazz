import {
    MathUtils,
    Spherical,
    Vector3
} from 'three';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();

class FirstPersonControls {

    constructor(object, domElement) {

        if (domElement === undefined) {

            console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.');
            domElement = document;

        }

        this.object = object;
        this.domElement = domElement;

        // API

        this.enabled = true;

        this.movementSpeed = 1.0;
        this.lookSpeed = 0.005;

        this.mouseDragOn = false;

        // internals

        this.mouseX = 0;
        this.mouseY = 0;

        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.strafeLeft = false;
        this.strafeRight = false;

        this.viewHalfX = 0;
        this.viewHalfY = 0;

        // private variables

        let lat = 0;
        let lon = 0;

        //

        this.handleResize = function () {

            if (this.domElement === document) {

                this.viewHalfX = window.innerWidth / 2;
                this.viewHalfY = window.innerHeight / 2;

            } else {

                this.viewHalfX = this.domElement.offsetWidth / 2;
                this.viewHalfY = this.domElement.offsetHeight / 2;

            }

        };

        this.onMouseDown = function (event) {

            if (this.domElement !== document) {

                this.domElement.focus();

            }

            this.mouseDragOn = true;

        };

        this.onMouseUp = function (event) {

            this.mouseDragOn = false;

        };

        this.onMouseMove = function (event) {

            if (this.domElement === document) {

                this.mouseX = event.pageX - this.viewHalfX;
                this.mouseY = event.pageY - this.viewHalfY;

            } else {

                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

            }

        };

        this.onKeyDown = function (event) {

            switch (event.code) {

                case 'ArrowUp':
                case 'KeyW': this.moveForward = true; break;

                case 'ArrowLeft':
                case 'KeyA': {
                    if (event.shiftKey) {
                        this.strafeLeft = true;
                    } else {
                        this.rotateLeft = true;
                    }
                    break;
                }

                case 'ArrowDown':
                case 'KeyS': this.moveBackward = true; break;

                case 'ArrowRight':
                case 'KeyD': {
                    if (event.shiftKey) {
                        this.strafeRight = true;
                    } else {
                        this.rotateRight = true;
                    }
                    break;
                }

				case 'KeyR': this.moveUp = true; break;
                case 'KeyF': this.moveDown = true; break;

            }

        };

        this.onKeyUp = function (event) {

            switch (event.code) {

                case 'ArrowUp':
                case 'KeyW': this.moveForward = false; break;

                case 'ArrowLeft':
                case 'KeyA': this.strafeLeft = this.rotateLeft = false; break;

                case 'ArrowDown':
                case 'KeyS': this.moveBackward = false; break;

                case 'ArrowRight':
                case 'KeyD': this.strafeRight = this.rotateRight = false; break;

                case 'KeyR': this.moveUp = false; break;
                case 'KeyF': this.moveDown = false; break;

            }

        };

        this.lookAt = function (x, y, z) {

            if (x.isVector3) {

                _target.copy(x);

            } else {

                _target.set(x, y, z);

            }

            this.object.lookAt(_target);

            setOrientation(this);

            return this;

        };

        this.update = function () {

            const targetPosition = new Vector3();

            return function update(delta) {

                if (this.enabled === false) return;

                const actualMoveSpeed = delta * this.movementSpeed;
                let actualLookSpeed = delta * this.lookSpeed;

                if (this.moveForward) this.object.translateZ(- actualMoveSpeed);
                if (this.moveBackward) this.object.translateZ(actualMoveSpeed);

                if (this.strafeLeft) this.object.translateX(- actualMoveSpeed);
                if (this.strafeRight) this.object.translateX(actualMoveSpeed);

                if (this.rotateLeft) this.object.rotateY(actualLookSpeed);
                if (this.rotateRight) this.object.rotateY(-actualLookSpeed);

                if (this.moveUp) this.object.translateY(actualMoveSpeed);
                if (this.moveDown) this.object.translateY(- actualMoveSpeed);

            };

        }();

        this.dispose = function () {

            this.domElement.removeEventListener('contextmenu', contextmenu);
            this.domElement.removeEventListener('mousedown', _onMouseDown);
            this.domElement.removeEventListener('mousemove', _onMouseMove);
            this.domElement.removeEventListener('mouseup', _onMouseUp);

            window.removeEventListener('keydown', _onKeyDown);
            window.removeEventListener('keyup', _onKeyUp);

        };

        const _onMouseMove = this.onMouseMove.bind(this);
        const _onMouseDown = this.onMouseDown.bind(this);
        const _onMouseUp = this.onMouseUp.bind(this);
        const _onKeyDown = this.onKeyDown.bind(this);
        const _onKeyUp = this.onKeyUp.bind(this);

        this.domElement.addEventListener('contextmenu', contextmenu);
        this.domElement.addEventListener('mousemove', _onMouseMove);
        this.domElement.addEventListener('mousedown', _onMouseDown);
        this.domElement.addEventListener('mouseup', _onMouseUp);

        window.addEventListener('keydown', _onKeyDown);
        window.addEventListener('keyup', _onKeyUp);

        function setOrientation(controls) {

            const quaternion = controls.object.quaternion;

            _lookDirection.set(0, 0, - 1).applyQuaternion(quaternion);
            _spherical.setFromVector3(_lookDirection);

            lat = 90 - MathUtils.radToDeg(_spherical.phi);
            lon = MathUtils.radToDeg(_spherical.theta);

        }

        this.handleResize();

        setOrientation(this);

    }

}

function contextmenu(event) {

    event.preventDefault();

}

export { FirstPersonControls };
