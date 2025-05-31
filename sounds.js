import * as THREE from 'three';

const audioLoader = new THREE.AudioLoader();
let listener, jumpSound, footstepSound, landingSound;
let isWalking = false;
let footstepInterval;
let lastFootstepTime = 0;
const footstepDelay = 400; // Time between footsteps in ms

export function setupSounds(camera) {
    // Create audio listener
    listener = new THREE.AudioListener();
    camera.add(listener);

    // Jump sound
    jumpSound = new THREE.Audio(listener);
    audioLoader.load('sound/poppop.ai - jumping sound.mp3', (buffer) => {
        jumpSound.setBuffer(buffer);
        jumpSound.setVolume(0.5);
        jumpSound.setLoop(false);
    });

    // Footstep sound
    footstepSound = new THREE.Audio(listener);
    audioLoader.load('sound/walking.mp3', (buffer) => {
        footstepSound.setBuffer(buffer);
        footstepSound.setVolume(0.3);
        footstepSound.setLoop(false);
    });

    // Landing sound
    landingSound = new THREE.Audio(listener);
    audioLoader.load('sounds/walking.mp3', (buffer) => {
        landingSound.setBuffer(buffer);
        landingSound.setVolume(0.4);
        landingSound.setLoop(false);
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
    
    // Play first footstep immediately
    playFootstep();
    
    // Set up interval for continuous footsteps
    footstepInterval = setInterval(() => {
        playFootstep();
    }, footstepDelay);
}

export function stopFootsteps() {
    if (!isWalking) return;
    isWalking = false;
    clearInterval(footstepInterval);
}

export function areSoundsLoaded() {
    return jumpSound?.buffer && footstepSound?.buffer && landingSound?.buffer;
}