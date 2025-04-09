import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { world } from './physics.js'; // ✅ Correctly importing world

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7).normalize();
scene.add(light);

// Array to store grapple points (optional, remove if you don't need them)
export const grapplePoints = [];

// Function to create a grapple point (optional, remove if you don't need them)
function createGrapplePoint(position) {
    const grappleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green
    const grappleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), grappleMaterial);
    grappleMesh.position.copy(position);
    scene.add(grappleMesh);

    const grappleBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Sphere(0.3),
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    world.addBody(grappleBody);

    grapplePoints.push({ mesh: grappleMesh, body: grappleBody });
}

// Add multiple grapple points (optional, remove if you don't need them)
createGrapplePoint(new THREE.Vector3(1, 1, -5));
createGrapplePoint(new THREE.Vector3(-3, 8, 2));
createGrapplePoint(new THREE.Vector3(10, 12, -10));

// Function to create the four walls enclosing the environment
function createWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown walls

    // Create 4 walls (front, back, left, and right)
    const wallWidth = 40; // Reduced width to make the walls closer
    const wallHeight = 10;
    const wallDepth = 1; // Thickness of the walls

    // Wall 1: Front
    const frontGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const frontMesh = new THREE.Mesh(frontGeometry, wallMaterial);
    frontMesh.position.set(0, wallHeight / 2, -20);  // Positioned at the back (closer distance)
    scene.add(frontMesh);

    // Wall 2: Back
    const backGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const backMesh = new THREE.Mesh(backGeometry, wallMaterial);
    backMesh.position.set(0, wallHeight / 2, 20);  // Positioned at the front (closer distance)
    scene.add(backMesh);

    // Wall 3: Left
    const leftGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth);
    const leftMesh = new THREE.Mesh(leftGeometry, wallMaterial);
    leftMesh.position.set(-20, wallHeight / 2, 0);  // Positioned on the left side (closer distance)
    scene.add(leftMesh);

    // Wall 4: Right
    const rightGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth);
    const rightMesh = new THREE.Mesh(rightGeometry, wallMaterial);
    rightMesh.position.set(20, wallHeight / 2, 0);  // Positioned on the right side (closer distance)
    scene.add(rightMesh);

    // Physics for the walls (static, non-moving)
    const wallShape = new CANNON.Box(new CANNON.Vec3(wallWidth / 2, wallHeight / 2, wallDepth / 2));  // Half dimensions

    // Front Wall
    const frontWallBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, wallHeight / 2, -20)  // Positioned at the back (closer distance)
    });
    frontWallBody.addShape(wallShape);
    world.addBody(frontWallBody);

    // Back Wall
    const backWallBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, wallHeight / 2, 20)  // Positioned at the front (closer distance)
    });
    backWallBody.addShape(wallShape);
    world.addBody(backWallBody);

    // Left Wall
    const leftWallBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(-20, wallHeight / 2, 0)  // Positioned on the left side (closer distance)
    });
    leftWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallDepth / 2, wallHeight / 2, wallWidth / 2))); // For left and right walls
    world.addBody(leftWallBody);

    // Right Wall
    const rightWallBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(20, wallHeight / 2, 0)  // Positioned on the right side (closer distance)
    });
    rightWallBody.addShape(new CANNON.Box(new CANNON.Vec3(wallDepth / 2, wallHeight / 2, wallWidth / 2)));
    world.addBody(rightWallBody);
}

// Call the function to create the walls
createWalls();

export function setupWorld() {
    scene.add(light);
}

export { world };
