import * as THREE from 'three';
import { scene } from './world.js'; // Import the scene if needed

let ropePointMesh = null;  // This will be the visual representation of the rope point
let ropeObject = null;     // The actual rope between the player and the rope point

export function createRope(player, ropeData, world, scene) {
    const { position } = ropeData; // The position of the rope point (e.g., { x: 10, y: 10, z: -10 })
    
    console.log("Creating rope point at: ", position); // Debugging the position

    // Create a visual representation of the rope point (a small sphere in this case)
    if (!ropePointMesh) {
        const ropePointGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const ropePointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        ropePointMesh = new THREE.Mesh(ropePointGeometry, ropePointMaterial);
        ropePointMesh.position.set(position.x, position.y, position.z);
        scene.add(ropePointMesh); // Add the rope point to the scene
        console.log("Rope point created at position: ", ropePointMesh.position); // Debugging the creation
    }

    // Optionally, you can create a rope object (e.g., line) that visually connects the player and the rope point
    if (!ropeObject) {
        const ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
        const ropeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        ropeObject = new THREE.Mesh(ropeGeometry, ropeMaterial);

        // Adjust the rope's position to be between the player and the rope point
        const distance = player.body.position.distanceTo(position);
        ropeObject.position.set((player.body.position.x + position.x) / 2, (player.body.position.y + position.y) / 2, (player.body.position.z + position.z) / 2);
        ropeObject.lookAt(position); // Make the rope point toward the rope point

        scene.add(ropeObject); // Add the rope object to the scene
        console.log("Rope created between player and rope point");
    }
}



export function removeRope(world, scene) {
    // Remove the rope point and rope from the scene
    if (ropePointMesh) {
        scene.remove(ropePointMesh);
        ropePointMesh = null;
    }

    if (ropeObject) {
        scene.remove(ropeObject);
        ropeObject = null;
    }
}

export function updateClimbing(player, keys) {
    if (keys["KeyW"]) {
        // Move the player up the rope
        player.body.position.y += 0.1; // You can adjust the speed of climbing here
    }
    if (keys["KeyS"]) {
        // Move the player down the rope
        player.body.position.y -= 0.1; // You can adjust the speed of descending here
    }
}
