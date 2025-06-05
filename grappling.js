import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {playGrappleSound} from './sounds.js'
let grappling = false;
let ropeConstraint = null;
let grapplePoint = new CANNON.Vec3();
let ropeMesh = null;
let ropeGeometry = null;

export function setupGrappling(scene, camera, playerBody, world, grapplePoints) {
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

        if (event.code === "KeyF" && grappling) {
            releaseGrapple(world);
            attemptGrapple(scene, camera, playerBody, world, grapplePoints);
        }

        if (event.code === "Space" && grappling) {
            const jumpForce = 15;
            const direction = new CANNON.Vec3();
            direction.copy(grapplePoint);
            direction.vsub(playerBody.position, direction);
            direction.normalize();
            direction.scale(-jumpForce, direction);
            direction.y += jumpForce * 0.5; 
            
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
        playGrappleSound(); 

        const staticBody = new CANNON.Body({ mass: 0 });
        staticBody.position.copy(grapplePoint);
        world.addBody(staticBody);

        ropeConstraint = new CANNON.PointToPointConstraint(
            playerBody, 
            new CANNON.Vec3(0, 0, 0), 
            staticBody, 
            new CANNON.Vec3(0, 0, 0) 
        );
        world.addConstraint(ropeConstraint);

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
        const playerPos = playerBody.position;
        const grapplePos = grapplePoint;
        
        const distance = playerPos.distanceTo(grapplePos);
        
        ropeMesh.position.x = (playerPos.x + grapplePos.x) / 2;
        ropeMesh.position.y = (playerPos.y + grapplePos.y) / 2;
        ropeMesh.position.z = (playerPos.z + grapplePos.z) / 2;
        
        ropeMesh.scale.y = distance;
        
        ropeMesh.lookAt(grapplePos.x, grapplePos.y, grapplePos.z);
        ropeMesh.rotation.x += Math.PI / 2; 
    }
}

