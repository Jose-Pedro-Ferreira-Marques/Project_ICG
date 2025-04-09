import * as THREE from 'three';

let collectibleMesh, collectibleBody;

export function setupCollectibles(scene) {
    const collectible = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    collectible.position.set(2, 1, -3);
    scene.add(collectible);

    return [collectible];
}

export function updateCollectibles(player, collectibles) {
    collectibles.forEach(collectible => {
        let distance = player.body.position.distanceTo(collectible.position);
        if (distance < 1) {  // If the player is close enough to the collectible
            collectible.visible = false;  // Hide the collectible when picked up
            player.canDoubleJump = true;  // Grant the double jump ability
        }
    });
}
