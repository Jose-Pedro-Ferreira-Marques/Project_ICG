import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es';
import { setupCollectibles, updateCollectibles } from './collectibles.js';
import { scene, world, grapplePoints, setupWorld, checkCoinCollision, checkPlayerFell } from './world.js';
import { setupControls } from './controls.js';
import { setupPhysics, playerBody, updateGroundEffect } from './physics.js';
import { setupMovement, updateMovement, checkIfOnGround, setGroundMesh } from './movement.js';
import { setupGrappling, updateGrappling } from './grappling.js';
import { setupCrosshair, updateCrosshair } from './crosshair.js';
import { createGun } from './gun.js';
import { setupMenu, toggleMenu, getIsPaused, deathMenu } from './menu.js';
import { setupSounds } from './sounds.js';
// Renderer & Camera
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const groundMesh = setupPhysics(scene);

// Initialize world first
setupWorld();
let lastTime = performance.now();

// Player Object
export let player = {
    body: playerBody,
    canDoubleJump: false,
    hasDoubleJumped: false,
    jumpForce: 10
};

// Setup Functions
setupPhysics(scene, camera, renderer);
setupControls(camera, playerBody);
setupMovement(player, camera, renderer);
const collectibles = setupCollectibles(scene);
setGroundMesh(groundMesh);
setupGrappling(scene, camera, playerBody, world, grapplePoints);
setupCrosshair();
createGun(scene, camera);
setupMenu(camera, renderer);
setupSounds(camera); 

// Update Loop
function update() {
    if (getIsPaused()) return;
    
    world.step(1 / 60);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    updateGroundEffect(deltaTime);
    
    if (checkPlayerFell()) {
        deathMenu(camera, renderer);
        resetPlayer();
        return;
    }
    
    camera.position.copy(player.body.position);
    camera.position.y += 1.6;
    
    updateMovement(camera, player, renderer);
    checkIfOnGround(player);
    updateCollectibles(player, collectibles);
    checkCoinCollision(player.body);
    updateCrosshair(camera, grapplePoints);
    updateGrappling(player.body);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();