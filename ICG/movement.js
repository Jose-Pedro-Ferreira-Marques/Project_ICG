import { playerBody } from './physics.js';
import * as THREE from 'three';
import { createRope, removeRope, updateClimbing } from './rope.js';

const keys = {}; 

window.addEventListener("keydown", (event) => keys[event.code] = true);
window.addEventListener("keyup", (event) => keys[event.code] = false);
let ropePoint = new THREE.Vector3(10, 5, -10); // Adjust the rope point position for better visibility
let ropeActive = false;  // Declare ropeActive here
const speed = 5;
const jumpForce = 5;
let canJump = false;
let hasDoubleJumped = false;
console.log("Rope point position: ", ropePoint);

export function setupMovement(player) {
    window.addEventListener("keydown", (event) => {
        // Check for spacebar key press for jump, or trigger double jump
        if (event.key === " " && canJump) {
            playerBody.velocity.y = player.jumpForce;  // Perform a normal jump
            canJump = false;  // Prevent further jumping until the player is on the ground
            console.log("Jump triggered");
        } else if (event.key === " " && !canJump && !hasDoubleJumped && player.canDoubleJump) {
            // Allow double jump if the player isn't on the ground and hasn't double jumped yet
            hasDoubleJumped = true;
            playerBody.velocity.y = player.jumpForce;  // Perform double jump
            console.log("Double jump triggered");
        }else if (event.key === "E" && !ropeActive) {
            console.log("Creating rope..."); // Log when 'E' is pressed
            createRope(player, { position: ropePoint }, world, scene);
            ropeActive = true;
        } else if (event.key === "E" && ropeActive) {
            console.log("Removing rope..."); // Log when 'E' is pressed again
            removeRope(world, scene);
            ropeActive = false;
        }
    });
}

export function checkIfOnGround(groundMesh, player) {
    const playerPosition = playerBody.position;
    const raycaster = new THREE.Raycaster(
        new THREE.Vector3(playerPosition.x, playerPosition.y + 1, playerPosition.z),
        new THREE.Vector3(0, -1, 0).normalize(),
        0,
        2
    );

    const intersects = raycaster.intersectObjects([groundMesh]);

    if (intersects.length > 0) {
        canJump = true;
        hasDoubleJumped = false;
    } else {
        canJump = false;
    }
}

export function updateMovement(camera, player) {
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

    // Set only the horizontal velocity (x and z), and don't modify y-axis unless jumping
    if (player.body) {
        player.body.velocity.set(moveDirection.x, player.body.velocity.y, moveDirection.z);
    }

    if (ropeActive) {
        // If the rope is active, allow the player to climb
        updateClimbing(player, keys);
    }
}
