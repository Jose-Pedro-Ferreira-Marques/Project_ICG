import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, playerBody) {
    const controls = new PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());
}
