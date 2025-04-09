import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

export const playerBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(1)
});
playerBody.position.set(0, 2, 0);
world.addBody(playerBody);

const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('images/gound2.jpg');

export const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ map: groundTexture })  
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = 0;  

export function setupPhysics(scene) {
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);
    scene.add(groundMesh);

   
    const holeCount = 20;  
    const holeRadius = 2;  
    const groundSize = 100;

    for (let i = 0; i < holeCount; i++) {
        const holeX = Math.random() * groundSize - groundSize / 2; 
        const holeZ = Math.random() * groundSize - groundSize / 2;  

    
        const holeGeometry = new THREE.CylinderGeometry(holeRadius, holeRadius, 5, 32);  
        const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });  
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.rotation.x = Math.PI / 2;  
        hole.position.set(holeX, -2.5, holeZ);  

        scene.add(hole);

       
        const holeShape = new CANNON.Cylinder(holeRadius, holeRadius, 5, 32);
        const holeBody = new CANNON.Body({
            mass: 0,  
            position: new CANNON.Vec3(holeX, -2.5, holeZ),
            shape: holeShape
        });

        world.addBody(holeBody); 
    }
}
