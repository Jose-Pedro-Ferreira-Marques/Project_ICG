import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { getIsPaused } from './menu.js';

export function setupControls(camera, playerBody) {
    const controls = new PointerLockControls(camera, document.body);
    
    document.addEventListener('click', () => {
        if (!getIsPaused()) {
            controls.lock();
        }
    });
    
    return controls;
}