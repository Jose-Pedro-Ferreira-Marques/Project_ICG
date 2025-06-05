import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { scene, world, rooms, collectibles } from './world.js';
import { playCollectibleSound } from './sounds.js';
const textureLoader = new THREE.TextureLoader();
const doubleJumpTexture = textureLoader.load('path/to/your/double_jump_texture.jpg');

export function setupCollectibles(scene) {

    collectibles.forEach(collectible => {
        scene.remove(collectible.mesh);
        if (collectible.body && world.has(collectible.body)) {
            world.removeBody(collectible.body);
        }
    });
    collectibles.length = 0;

    const startRoom = rooms.find(room => room.isStartRoom);
    if (!startRoom) return collectibles;

    const connectedRooms = startRoom.connections.filter(room => room !== startRoom && !room.isStartRoom);

    if (connectedRooms.length === 0) {
        console.warn('No valid connected rooms found (excluding start room)');
        return collectibles;
    }

    const connectedRoom = connectedRooms[Math.floor(Math.random() * connectedRooms.length)];

    connectedRoom.platforms.forEach(platform => {
        platform.mesh.userData.hasCollectible = false;
    });

    const suitablePlatforms = connectedRoom.platforms.filter(platform =>
        platform.size.x >= 2 &&
        platform.size.z >= 2 &&
        platform.mesh.position.y < 5 &&
        !platform.mesh.userData.hasCollectible
    );

    let platform;
    let position;

    if (suitablePlatforms.length > 0) {
        platform = suitablePlatforms[Math.floor(Math.random() * suitablePlatforms.length)];
        position = new THREE.Vector3(
            platform.mesh.position.x,
            platform.mesh.position.y + platform.size.y / 2 + 0.5,
            platform.mesh.position.z
        );
    } else {
        const platformPosition = new THREE.Vector3(
            connectedRoom.x,
            2,
            connectedRoom.z
        );
        const platformSize = new THREE.Vector3(3, 0.5, 3);
        platform = createPlatform(platformPosition, platformSize, platformTexture);
        connectedRoom.platforms.push(platform);

        position = new THREE.Vector3(
            platformPosition.x,
            platformPosition.y + platformSize.y / 2 + 0.5,
            platformPosition.z
        );
    }

    const collectible = createDoubleJumpCollectible(position);
    collectibles.push(collectible);
    platform.mesh.userData.hasCollectible = true;

    return collectibles;
}



function createDoubleJumpCollectible(position) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
        map: doubleJumpTexture,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isDoubleJumpCollectible = true;
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Sphere(0.5),
        position: new CANNON.Vec3(position.x, position.y, position.z),
        isCollectible: true
    });
    world.addBody(body);

    return { mesh, body };
}

export function updateCollectibles(player, collectibles) {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        
        if (collectible.body.position.distanceTo(player.body.position) < 1.5) {
            player.canDoubleJump = true;
            
            scene.remove(collectible.mesh);
            world.removeBody(collectible.body);
            collectibles.splice(i, 1);
            
            playCollectibleSound(); 
            
            console.log("Double jump acquired at position:", player.body.position);
        }
    }
}