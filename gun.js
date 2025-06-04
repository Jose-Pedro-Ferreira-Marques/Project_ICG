import * as THREE from 'three';

export function createGun(scene, camera) {
    const textureLoader = new THREE.TextureLoader();
    const gunTexture = textureLoader.load('images/textures/corrugated_iron_03_diff_4k.jpg');
    const handletexture = textureLoader.load('images/textures/wooden_gate_diff_4k.jpg');
    
    const gunMaterial = new THREE.MeshStandardMaterial({ 
        map: gunTexture, 
        metalness: 0.4, 
        roughness: 1.0 
    });
    const hanleMaterial = new THREE.MeshStandardMaterial({ 
        map: handletexture, 
        metalness: 0.8, 
        roughness: 0.4 
    });


    // Gun Barrel
    const barrelGeometry = new THREE.BoxGeometry(0.3, 0.2, 1);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.position.set(0.3, -0.3, -1.5);

    // Gun Handle
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const handle = new THREE.Mesh(handleGeometry, hanleMaterial);
    handle.position.set(0.3, -0.5, -1.3);
    handle.rotation.x = Math.PI / 8;

    // Trigger Guard
    const triggerGuardGeometry = new THREE.TorusGeometry(0.08, 0.02, 16, 32);
    const triggerGuard = new THREE.Mesh(triggerGuardGeometry, gunMaterial);
    triggerGuard.position.set(0.3, -0.45, -1.2);
    triggerGuard.rotation.y = Math.PI / 2;

    // Trigger
    const triggerGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.02);
    const trigger = new THREE.Mesh(triggerGeometry, gunMaterial);
    trigger.position.set(0.3, -0.42, -1.18);

    // Gun Sight
    const sightGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.2);
    const sight = new THREE.Mesh(sightGeometry, gunMaterial);
    sight.position.set(0.3, -0.15, -1.8);

    // Group the gun
    const gun = new THREE.Group();
    gun.add(barrel, handle, triggerGuard, trigger, sight);
    camera.add(gun);
    scene.add(camera);

    // Hand Material
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffcba4 });

    // Palm
    const palmGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.2);
    const palm = new THREE.Mesh(palmGeometry, handMaterial);
    palm.position.set(0.3, -0.55, -1.3);

    // Fingers
    const fingers = [];
    for (let i = 0; i < 4; i++) {
        const fingerGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 10);
        const finger = new THREE.Mesh(fingerGeometry, handMaterial);
        finger.position.set(0.25 + i * 0.03, -0.6, -1.3);
        finger.rotation.z = Math.PI / 2;
        fingers.push(finger);
    }

    // Thumb
    const thumbGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 10);
    const thumb = new THREE.Mesh(thumbGeometry, handMaterial);
    thumb.position.set(0.2, -0.5, -1.25);
    thumb.rotation.y = Math.PI / 4;

    // Group Hand Parts
    const hand = new THREE.Group();
    hand.add(palm, thumb, ...fingers);
    gun.add(hand);

    // Forearm
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcba4 });
    const forearmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
    const forearm = new THREE.Mesh(forearmGeometry, armMaterial);
    forearm.position.set(0.4, -0.8, -1.2);
    forearm.rotation.x = Math.PI / 2;

    // Group the full arm
    const arm = new THREE.Group();
    arm.add(forearm, hand);
    gun.add(arm);
}