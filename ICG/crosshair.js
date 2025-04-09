import * as THREE from 'three';

let crosshairElement;

export function setupCrosshair() {
    crosshairElement = document.querySelector('.crosshair');
}

export function updateCrosshair(camera, scene) {
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.set(0, 0, -1).applyQuaternion(camera.quaternion);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        crosshairElement.style.borderColor = 'red';
    } else {
        crosshairElement.style.borderColor = 'white';
    }
}
