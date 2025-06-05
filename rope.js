import * as THREE from 'three';
import { scene } from './world.js'; 

let ropePointMesh = null;  
let ropeObject = null;   

export function createRope(player, ropeData, world, scene) {
    const { position } = ropeData;
    
    console.log("Creating rope point at: ", position); 

  
    if (!ropePointMesh) {
        const ropePointGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const ropePointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        ropePointMesh = new THREE.Mesh(ropePointGeometry, ropePointMaterial);
        ropePointMesh.position.set(position.x, position.y, position.z);
        scene.add(ropePointMesh); 
        console.log("Rope point created at position: ", ropePointMesh.position);
    }

    if (!ropeObject) {
        const ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
        const ropeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        ropeObject = new THREE.Mesh(ropeGeometry, ropeMaterial);

        const distance = player.body.position.distanceTo(position);
        ropeObject.position.set((player.body.position.x + position.x) / 2, (player.body.position.y + position.y) / 2, (player.body.position.z + position.z) / 2);
        ropeObject.lookAt(position); 
        scene.add(ropeObject);
        console.log("Rope created between player and rope point");
    }
}



export function removeRope(world, scene) {
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
        player.body.position.y += 0.1; 
    }
    if (keys["KeyS"]) {
        player.body.position.y -= 0.1; 
    }
}
