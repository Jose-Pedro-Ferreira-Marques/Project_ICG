import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

export const playerBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(1),
    isPlayer: true,
    position: new CANNON.Vec3(0, 10, 0)
});
world.addBody(playerBody);
let time = 0;
let groundTexture;
let groundMesh;
let startPlatformPosition = new THREE.Vector3(0, 3, 0);

const textureLoader = new THREE.TextureLoader();
groundTexture = textureLoader.load('./images/lazer.jpg');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(100, 100);
groundTexture.offset.set(0, 0); // Needed for scrolling

export function setupPhysics(scene) {
    // Create visual ground mesh
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        emissive: new THREE.Color(0xff0000),
        emissiveIntensity: 0.4
    });
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI/2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    groundMesh.userData.isGround = true;
    scene.add(groundMesh);

    // Create physical ground body
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape,
        position: new CANNON.Vec3(0, 0, 0)
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.userData = { isGround: true };
    world.addBody(groundBody);

    return groundMesh;
}

export function resetPlayer() {
    playerBody.position.copy(new CANNON.Vec3(
        startPlatformPosition.x,
        startPlatformPosition.y,
        startPlatformPosition.z
    ));
    playerBody.velocity.set(0, 0, 0);
    playerBody.angularVelocity.set(0, 0, 0);
}

export function getGroundMesh() {
    return groundMesh;
}

export function updateGroundEffect(deltaTime) {
    time += deltaTime;
    groundTexture.offset.x = (time * 0.2) % 1; 
}
