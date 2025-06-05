import { playerBody } from './physics.js';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createRope, removeRope, updateClimbing } from './rope.js';
import { scene } from './world.js';
import { world } from './physics.js';
import { getIsPaused, toggleMenu, deathMenu } from './menu.js';
import { playJumpSound, playLandingSound, startFootsteps, stopFootsteps } from './sounds.js';

export const keys = {};
let wasPaused = false;
let groundMesh;
let canJump = false;
let hasDoubleJumped = false;
let lastGroundTouchTime = 0;
const groundTouchCooldown = 1000;

export function setGroundMesh(mesh) {
    groundMesh = mesh;
}

window.addEventListener("keydown", (event) => {
    if (getIsPaused()) return;
    keys[event.code] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

let ropePoint = new THREE.Vector3(10, 5, -10);
let ropeActive = false;

const speed = 5;
const jumpForce = 5;

export function setupMovement(player, camera, renderer) {
    window.addEventListener("keydown", (event) => {
        if (getIsPaused()) return;
        
        if (event.code === "Space" && canJump) {
            playerBody.velocity.y = player.jumpForce;
            canJump = false;
            playJumpSound();
        } else if (event.code === "Space" && !canJump && !hasDoubleJumped && player.canDoubleJump) {
            hasDoubleJumped = true;
            playerBody.velocity.y = player.jumpForce;
            playJumpSound();
        } else if (event.code === "KeyE") {
            if (!ropeActive) {
                createRope(player, { position: ropePoint }, world, scene);
            } else {
                removeRope(world, scene);
            }
            ropeActive = !ropeActive;
        }
    });

    playerBody.addEventListener('collide', (event) => {
        const hitBody = event.body;
        if (hitBody.userData?.isGround) {
            const currentTime = Date.now();
            if (currentTime - lastGroundTouchTime > groundTouchCooldown) {
                lastGroundTouchTime = currentTime;
                toggleMenu(camera, renderer);
                deathMenu(camera, renderer);
            }
        }
    });
}

export function checkIfOnGround(player) {
    const origin = new THREE.Vector3(
        playerBody.position.x,
        playerBody.position.y + 1,
        playerBody.position.z
    );

    const raycaster = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0), 0, 2.5);

    const meshes = [];
    scene.traverse(obj => {
        if (obj.isMesh && obj !== player.mesh && obj.userData.isPlatform) {
            meshes.push(obj);
        }
    });

    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
        if (!canJump) {
            playLandingSound();
        }
        canJump = true;
        hasDoubleJumped = false;
        player.isOnGround = true; 
    } else {
        canJump = false;
        player.isOnGround = false; 
    }
}

export function updateMovement(camera, player, renderer) {
    const isPaused = getIsPaused();
    
    if (isPaused || wasPaused) {
        if (player.body) {
            player.body.velocity.set(0, player.body.velocity.y, 0);
        }
        wasPaused = isPaused;
        stopFootsteps();
        if (isPaused) return;
    }

    let moveX = 0, moveZ = 0;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    right.copy(forward).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    if (keys["KeyW"]) moveZ += speed;
    if (keys["KeyS"]) moveZ -= speed;
    if (keys["KeyA"]) moveX += speed;
    if (keys["KeyD"]) moveX -= speed;

    const moveDirection = forward.multiplyScalar(moveZ).add(right.multiplyScalar(moveX));

    if (player.body) {
        if (moveX !== 0 || moveZ !== 0) {
            player.body.velocity.x = moveDirection.x;
            player.body.velocity.z = moveDirection.z;
            
            if (player.isOnGround) {
                startFootsteps();
            } else {
                stopFootsteps();
            }
        } else {
            player.body.velocity.x = 0;
            player.body.velocity.z = 0;
            stopFootsteps();
        }
    }

    if (ropeActive) {
        updateClimbing(player, keys);
    }
}