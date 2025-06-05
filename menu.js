import { regenerateMap, resetPlayer } from './world.js';
import { requiredCoins } from './world.js';

let isPaused = false;
let isDead = false;
let menuVisible = false;
let pauseMenuContainer;
let deathMenuContainer;
let winMenuContainer;
let resumeCallback = null;

export function setupMenu(camera, renderer) {
    // Create pause menu container
    pauseMenuContainer = document.createElement('div');
    pauseMenuContainer.style.position = 'absolute';
    pauseMenuContainer.style.top = '0';
    pauseMenuContainer.style.left = '0';
    pauseMenuContainer.style.width = '100%';
    pauseMenuContainer.style.height = '100%';
    pauseMenuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    pauseMenuContainer.style.display = 'none';
    pauseMenuContainer.style.flexDirection = 'column';
    pauseMenuContainer.style.justifyContent = 'center';
    pauseMenuContainer.style.alignItems = 'center';
    pauseMenuContainer.style.zIndex = '1000';
    document.body.appendChild(pauseMenuContainer);

    // Pause menu title
    const pauseTitle = document.createElement('h1');
    pauseTitle.textContent = 'PAUSED';
    pauseTitle.style.color = 'white';
    pauseTitle.style.fontFamily = 'Arial';
    pauseTitle.style.fontSize = '48px';
    pauseTitle.style.marginBottom = '40px';
    pauseMenuContainer.appendChild(pauseTitle);

    // Continue button
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continue';
    continueButton.style.padding = '15px 30px';
    continueButton.style.fontSize = '24px';
    continueButton.style.margin = '10px';
    continueButton.style.cursor = 'pointer';
    continueButton.addEventListener('click', () => toggleMenu(camera, renderer));
    pauseMenuContainer.appendChild(continueButton);

    // Restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.style.padding = '15px 30px';
    restartButton.style.fontSize = '24px';
    restartButton.style.margin = '10px';
    restartButton.style.cursor = 'pointer';
    restartButton.addEventListener('click', () => {
        isDead = false;
        resetPlayer();
        closeMenu(camera, renderer);
    });
    pauseMenuContainer.appendChild(restartButton);

    // Exit button
    const exitButton = document.createElement('button');
    exitButton.textContent = 'Exit';
    exitButton.style.padding = '15px 30px';
    exitButton.style.fontSize = '24px';
    exitButton.style.margin = '10px';
    exitButton.style.cursor = 'pointer';
    exitButton.addEventListener('click', () => {
        window.location.href = 'about:blank';
    });
    pauseMenuContainer.appendChild(exitButton);

    // Create death menu container
    deathMenuContainer = document.createElement('div');
    deathMenuContainer.style.position = 'absolute';
    deathMenuContainer.style.top = '0';
    deathMenuContainer.style.left = '0';
    deathMenuContainer.style.width = '100%';
    deathMenuContainer.style.height = '100%';
    deathMenuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    deathMenuContainer.style.display = 'none';
    deathMenuContainer.style.flexDirection = 'column';
    deathMenuContainer.style.justifyContent = 'center';
    deathMenuContainer.style.alignItems = 'center';
    deathMenuContainer.style.zIndex = '1000';
    document.body.appendChild(deathMenuContainer);

    // Death menu title
    const deathTitle = document.createElement('h1');
    deathTitle.textContent = 'You Died';
    deathTitle.style.color = 'white';
    deathTitle.style.fontFamily = 'Arial';
    deathTitle.style.fontSize = '48px';
    deathTitle.style.marginBottom = '40px';
    deathMenuContainer.appendChild(deathTitle);

    // New Game button for death menu
    const newGameButton = document.createElement('button');
    newGameButton.textContent = 'New Game';
    newGameButton.style.padding = '15px 30px';
    newGameButton.style.fontSize = '24px';
    newGameButton.style.margin = '10px';
    newGameButton.style.cursor = 'pointer';
    newGameButton.addEventListener('click', () => {
        isDead = false;
        regenerateMap();
        closeMenu(camera, renderer);
    });
    deathMenuContainer.appendChild(newGameButton);

    // Restart button for death menu
    const deathRestartButton = document.createElement('button');
    deathRestartButton.textContent = 'Restart';
    deathRestartButton.style.padding = '15px 30px';
    deathRestartButton.style.fontSize = '24px';
    deathRestartButton.style.margin = '10px';
    deathRestartButton.style.cursor = 'pointer';
    deathRestartButton.addEventListener('click', () => {
        isDead = false;
        resetPlayer();
        closeMenu(camera, renderer);
    });
    deathMenuContainer.appendChild(deathRestartButton);

    // Exit button for death menu
    const deathExitButton = document.createElement('button');
    deathExitButton.textContent = 'Exit';
    deathExitButton.style.padding = '15px 30px';
    deathExitButton.style.fontSize = '24px';
    deathExitButton.style.margin = '10px';
    deathExitButton.style.cursor = 'pointer';
    deathExitButton.addEventListener('click', () => {
        window.location.href = 'about:blank';
    });
    deathMenuContainer.appendChild(deathExitButton);

    // Create win menu container
    winMenuContainer = document.createElement('div');
    winMenuContainer.style.position = 'absolute';
    winMenuContainer.style.top = '0';
    winMenuContainer.style.left = '0';
    winMenuContainer.style.width = '100%';
    winMenuContainer.style.height = '100%';
    winMenuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    winMenuContainer.style.display = 'none';
    winMenuContainer.style.flexDirection = 'column';
    winMenuContainer.style.justifyContent = 'center';
    winMenuContainer.style.alignItems = 'center';
    winMenuContainer.style.zIndex = '1000';
    document.body.appendChild(winMenuContainer);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !isDead) {
            toggleMenu(camera, renderer);
        }
    });
}

export function toggleMenu(camera, renderer) {
    if (isDead) return; 

    isPaused = !isPaused;
    menuVisible = !menuVisible;

    if (menuVisible) {
        pauseMenuContainer.style.display = 'flex';
        deathMenuContainer.style.display = 'none';
        winMenuContainer.style.display = 'none';
        document.exitPointerLock();
    } else {
        closeMenu(camera, renderer);
    }
}

export function deathMenu(camera, renderer) {
    isDead = true;
    isPaused = true;
    
    deathMenuContainer.style.display = 'flex';
    pauseMenuContainer.style.display = 'none';
    winMenuContainer.style.display = 'none';
    document.exitPointerLock();
}

export function showWinMenu(camera, renderer, coinsCollected, totalCoins) {
    isPaused = true;
    
    winMenuContainer.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'You Win!';
    title.style.color = 'gold';
    title.style.fontFamily = 'Arial';
    title.style.fontSize = '48px';
    title.style.marginBottom = '40px';
    title.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.7)';
    winMenuContainer.appendChild(title);

    const message = document.createElement('p');
    message.textContent = `Congratulations!`;
    message.style.color = 'white';
    message.style.fontFamily = 'Arial';
    message.style.fontSize = '24px';
    message.style.marginBottom = '30px';
    winMenuContainer.appendChild(message);

    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continue';
    continueButton.style.padding = '15px 30px';
    continueButton.style.fontSize = '24px';
    continueButton.style.margin = '10px';
    continueButton.style.cursor = 'pointer';
    continueButton.style.backgroundColor = 'gold';
    continueButton.style.color = 'black';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.addEventListener('click', () => {
        regenerateMap();
        closeMenu(camera, renderer);
    });
    winMenuContainer.appendChild(continueButton);

    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.style.padding = '15px 30px';
    restartButton.style.fontSize = '24px';
    restartButton.style.margin = '10px';
    restartButton.style.cursor = 'pointer';
    restartButton.addEventListener('click', () => {
        resetPlayer();
        closeMenu(camera, renderer);
    });
    winMenuContainer.appendChild(restartButton);

    const newGameButton = document.createElement('button');
    newGameButton.textContent = 'New Game';
    newGameButton.style.padding = '15px 30px';
    newGameButton.style.fontSize = '24px';
    newGameButton.style.margin = '10px';
    newGameButton.style.cursor = 'pointer';
    newGameButton.addEventListener('click', () => {
        regenerateMap();
        closeMenu(camera, renderer);
    });
    winMenuContainer.appendChild(newGameButton);

    winMenuContainer.style.display = 'flex';
    pauseMenuContainer.style.display = 'none';
    deathMenuContainer.style.display = 'none';
    document.exitPointerLock();
}

export function getIsPaused() {
    return isPaused;
}

export function getIsDead() {
    return isDead;
}

function closeMenu(camera, renderer) {
    pauseMenuContainer.style.display = 'none';
    deathMenuContainer.style.display = 'none';
    winMenuContainer.style.display = 'none';
    renderer.domElement.requestPointerLock();
    isPaused = false;
    menuVisible = false;

    for (const key in keys) keys[key] = false;

    if (resumeCallback) resumeCallback();
}