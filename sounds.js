import * as THREE from 'three';

const audioLoader = new THREE.AudioLoader();
let listener, jumpSound, footstepSound, landingSound;
let isWalking = false;
let coinPickupSound;
let footstepInterval;
let lastFootstepTime = 0;
const footstepDelay = 400; 
let grappleSound, collectibleSound;
export function setupSounds(camera) {
    listener = new THREE.AudioListener();
    camera.add(listener);

    jumpSound = new THREE.Audio(listener);
    audioLoader.load('sound/poppop.ai - jumping sound.mp3', (buffer) => {
        jumpSound.setBuffer(buffer);
        jumpSound.setVolume(0.5);
        jumpSound.setLoop(false);
    });

    footstepSound = new THREE.Audio(listener);
    audioLoader.load('sound/walking.mp3', (buffer) => {
        footstepSound.setBuffer(buffer);
        footstepSound.setVolume(0.3);
        footstepSound.setLoop(false);
    });

    landingSound = new THREE.Audio(listener);
    audioLoader.load('sounds/walking.mp3', (buffer) => {
        landingSound.setBuffer(buffer);
        landingSound.setVolume(0.4);
        landingSound.setLoop(false);
    });

    coinPickupSound = new THREE.Audio(listener);
    audioLoader.load('sound/coin.mp3', (buffer) => { 
        coinPickupSound.setBuffer(buffer);
        coinPickupSound.setVolume(0.7);
        coinPickupSound.setLoop(false);
    });

    grappleSound = new THREE.Audio(listener);
    audioLoader.load('sound/grappling-hook-14680.mp3', (buffer) => {
        grappleSound.setBuffer(buffer);
        grappleSound.setVolume(0.6);
        grappleSound.setLoop(false);
    });

    collectibleSound = new THREE.Audio(listener);
    audioLoader.load('sound/item-pick-up-38258.mp3', (buffer) => {
        collectibleSound.setBuffer(buffer);
        collectibleSound.setVolume(0.7);
        collectibleSound.setLoop(false);
    });
}



export function playJumpSound() {
    if (!jumpSound || !jumpSound.buffer) return;
    
    if (jumpSound.isPlaying) {
        jumpSound.stop();
    }
    
    jumpSound.play();
}

export function playLandingSound() {
    if (!landingSound || !landingSound.buffer) return;
    
    if (landingSound.isPlaying) {
        landingSound.stop();
    }
    
    landingSound.play();
}

export function playFootstep() {
    const now = Date.now();
    if (now - lastFootstepTime < footstepDelay) return;
    lastFootstepTime = now;
    
    if (!footstepSound || !footstepSound.buffer) return;
    
    if (footstepSound.isPlaying) {
        footstepSound.stop();
    }
    
    footstepSound.play();
}

export function startFootsteps() {
    if (isWalking) return;
    isWalking = true;
    
    playFootstep();
    
    footstepInterval = setInterval(() => {
        playFootstep();
    }, footstepDelay);
}

export function stopFootsteps() {
    if (!isWalking) return;
    isWalking = false;
    clearInterval(footstepInterval);
}

export function playCoinPickupSound() {
    if (!coinPickupSound || !coinPickupSound.buffer) return;
    
    if (coinPickupSound.isPlaying) {
        coinPickupSound.stop();
    }
    
    coinPickupSound.play();
}

export function playGrappleSound() {
    if (!grappleSound || !grappleSound.buffer) return;
    
    if (grappleSound.isPlaying) {
        grappleSound.stop();
    }
    
    grappleSound.play();
}

export function playCollectibleSound() {
    if (!collectibleSound || !collectibleSound.buffer) return;
    
    if (collectibleSound.isPlaying) {
        collectibleSound.stop();
    }
    
    collectibleSound.play();
}

export function areSoundsLoaded() {
    return jumpSound?.buffer && footstepSound?.buffer && 
           landingSound?.buffer && coinPickupSound?.buffer &&
           grappleSound?.buffer && collectibleSound?.buffer;
}