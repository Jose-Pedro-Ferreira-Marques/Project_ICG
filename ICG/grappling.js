import * as THREE from 'three';
import * as CANNON from 'cannon-es';

let grappling = false;
let ropeConstraint = null;
let grapplePoint = new CANNON.Vec3();

export function setupGrappling(scene, camera, playerBody, world, grapplePoints) {
    window.addEventListener('keydown', (event) => {
        if (event.code === "KeyG") {
            if (grappling) {
                if (ropeConstraint) world.removeConstraint(ropeConstraint);
                grappling = false;
            } else {
                const raycaster = new THREE.Raycaster();
                raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));

                const intersects = raycaster.intersectObjects(grapplePoints.map(point => point.mesh), true);
                if (intersects.length > 0) {
                    grapplePoint.copy(intersects[0].point); // Set the grapple point
                    grappling = true;

                    ropeConstraint = new CANNON.PointToPointConstraint(
                        playerBody, new CANNON.Vec3(0, 0, 0),
                        new CANNON.Body({ mass: 0 }), grapplePoint
                    );
                    world.addConstraint(ropeConstraint);
                }
            }
        }
    });
}

export function updateGrappling() {
    // Optional: Add any additional logic for grappling update
}


