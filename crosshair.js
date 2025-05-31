import * as THREE from 'three';

let crosshairElement;

export function setupCrosshair() {
    crosshairElement = document.querySelector('.crosshair');
}

export function updateCrosshair(camera, grapplePoints) {
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.set(0, 0, -1).applyQuaternion(camera.quaternion);

    // Intersect only with grappling point meshes
    const intersects = raycaster.intersectObjects(grapplePoints.map(p => p.mesh), true);

    if (intersects.length > 0) {
        crosshairElement.style.borderColor = 'red';
    } else {
        crosshairElement.style.borderColor = 'white';
    }
}
