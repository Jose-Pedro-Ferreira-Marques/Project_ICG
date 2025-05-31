import * as THREE from 'three';
import * as CANNON from 'cannon-es';

let grappling = false;
let ropeConstraint = null;
let grapplePoint = new CANNON.Vec3();
let ropeMesh = null;
let ropeGeometry = null;

export function setupGrappling(scene, camera, playerBody, world, grapplePoints) {
    // Create rope material
    const ropeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    ropeMesh = new THREE.Mesh(ropeGeometry, ropeMaterial);
    ropeMesh.visible = false;
    scene.add(ropeMesh);

    window.addEventListener('keydown', (event) => {
        if (event.code === "KeyG") {
            if (grappling) {
                releaseGrapple(world);
            } else {
                attemptGrapple(scene, camera, playerBody, world, grapplePoints);
            }
        }

        // Regrapple with F key
        if (event.code === "KeyF" && grappling) {
            releaseGrapple(world);
            attemptGrapple(scene, camera, playerBody, world, grapplePoints);
        }

        // Jump while grappling
        if (event.code === "Space" && grappling) {
            const jumpForce = 15;
            const direction = new CANNON.Vec3();
            direction.copy(grapplePoint);
            direction.vsub(playerBody.position, direction);
            direction.normalize();
            direction.scale(-jumpForce, direction);
            direction.y += jumpForce * 0.5; // Add some upward force
            
            playerBody.velocity.x += direction.x;
            playerBody.velocity.y += direction.y;
            playerBody.velocity.z += direction.z;
            
            releaseGrapple(world);
        }
    });
}

function attemptGrapple(scene, camera, playerBody, world, grapplePoints) {
    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));

    const intersects = raycaster.intersectObjects(grapplePoints.map(point => point.mesh), true);
    if (intersects.length > 0) {
        grapplePoint.copy(intersects[0].point);
        grappling = true;

        // Create a static body at the grapple point
        const staticBody = new CANNON.Body({ mass: 0 });
        staticBody.position.copy(grapplePoint);
        world.addBody(staticBody);

        ropeConstraint = new CANNON.PointToPointConstraint(
            playerBody, 
            new CANNON.Vec3(0, 0, 0), // Local offset in player body
            staticBody, 
            new CANNON.Vec3(0, 0, 0) // Local offset in static body
        );
        world.addConstraint(ropeConstraint);

        // Show rope
        ropeMesh.visible = true;
    }
}

function releaseGrapple(world) {
    if (ropeConstraint) {
        world.removeConstraint(ropeConstraint);
        if (ropeConstraint.bodyB) {
            world.removeBody(ropeConstraint.bodyB);
        }
        ropeConstraint = null;
    }
    grappling = false;
    ropeMesh.visible = false;
}

export function updateGrappling(playerBody) {
    if (grappling && ropeConstraint && ropeMesh) {
        // Update rope visual
        const playerPos = playerBody.position;
        const grapplePos = grapplePoint;
        
        // Calculate distance between player and grapple point
        const distance = playerPos.distanceTo(grapplePos);
        
        // Position the rope mesh in the middle
        ropeMesh.position.x = (playerPos.x + grapplePos.x) / 2;
        ropeMesh.position.y = (playerPos.y + grapplePos.y) / 2;
        ropeMesh.position.z = (playerPos.z + grapplePos.z) / 2;
        
        // Scale the rope to match the distance
        ropeMesh.scale.y = distance;
        
        // Rotate the rope to point from player to grapple point
        ropeMesh.lookAt(grapplePos.x, grapplePos.y, grapplePos.z);
        ropeMesh.rotation.x += Math.PI / 2; // Cylinder is vertical by default
    }
}

