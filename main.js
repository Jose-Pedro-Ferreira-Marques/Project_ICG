import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es';

import { scene, world, grapplePoints } from './world.js'; // Import world setup
import { setupControls } from './controls.js';
import { setupPhysics, playerBody, groundMesh } from './physics.js';
import { setupMovement, updateMovement, checkIfOnGround } from './movement.js';
import { setupGrappling, updateGrappling } from './grappling.js';
import { setupCollectibles, updateCollectibles } from './collectibles.js';
import { setupCrosshair, updateCrosshair } from './crosshair.js';
import { createGun } from './gun.js';

// Renderer & Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player Object
let player = {
    body: playerBody,
    canDoubleJump: false,
    hasDoubleJumped: false,
    jumpForce: 4
};

// Setup Functions
setupPhysics(scene);
setupControls(camera, playerBody);
setupMovement(player);
setupGrappling(scene, camera, playerBody, world, grapplePoints); // Pass grapple points
const collectibles = setupCollectibles(scene);
setupCrosshair();
createGun(scene, camera);

// Update Loop
function update() {
    world.step(1 / 60);
    camera.position.copy(player.body.position);

    updateMovement(camera, player);
    checkIfOnGround(groundMesh);
    updateCollectibles(player, collectibles);
    updateCrosshair(camera, scene);
    updateGrappling(); // Update grappling mechanics
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate();
