import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { world, playerBody, setupPhysics } from './physics.js';
import { generateBasicRoom,addCoinToRoom} from './generateRoom.js';
import { showWinMenu } from './menu.js';
import {setupCollectibles} from './collectibles.js'
import { player, camera, renderer } from './main.js';

import {playCoinPickupSound} from'./sounds.js'
// Scene setup
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
export const collectibles = [];
// Load textures
const textureLoader = new THREE.TextureLoader();
const platformTexture = textureLoader.load('public/images/textures/granite_tile_diff_4k.jpg');
platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(4, 4);

const goaltexture = textureLoader.load('public/images/textures/granite_tile_diff_4k.jpg')
goaltexture.wrapS = goaltexture.wrapT = THREE.RepeatWrapping;
goaltexture.repeat.set(4,4);
const flagTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/uv_grid_opengl.jpg'); // example texture

const wallTexture = textureLoader.load('public/images/textures/painted_plaster_wall_disp_4k.png');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4);

const doorTexture = textureLoader.load('public/images/textures/wooden_gate_diff_4k.jpg');
doorTexture.wrapS = doorTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4);

const coinTexture = textureLoader.load('https://threejs.org/examples/textures/gold_texture.jpg');

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 30, 7).normalize();
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.bias = -0.001;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Game objects
export const movingPlatforms = [];
export const grapplePoints = [];
export const coins = [];
export let platforms = [];
export let rooms = [];
let requiredCoins = 0;
let collectedCoins = 0;
let startPlatform = null;

// UI Elements
export let coinCountElement;
let gameMessageElement;

class Room {
    constructor(x, z, width, depth, height, isStartRoom = false) {
        this.x = x;
        this.z = z;
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.connections = [];
        this.platforms = [];
        this.doors = [];
        this.type = '';
        this.isStartRoom = isStartRoom;
        this.hasCoin = false;
        this.isFinalRoom = false;
    }
}

export function wouldIntersect(newPos, newSize, existingPlatforms, buffer = 0.5) {
    const newBox = {
        minX: newPos.x - newSize.x/2 - buffer,
        maxX: newPos.x + newSize.x/2 + buffer,
        minY: newPos.y - newSize.y/2 - buffer,
        maxY: newPos.y + newSize.y/2 + buffer,
        minZ: newPos.z - newSize.z/2 - buffer,
        maxZ: newPos.z + newSize.z/2 + buffer
    };

    for (const platform of existingPlatforms) {
        const existingBox = {
            minX: platform.mesh.position.x - platform.size.x/2,
            maxX: platform.mesh.position.x + platform.size.x/2,
            minY: platform.mesh.position.y - platform.size.y/2,
            maxY: platform.mesh.position.y + platform.size.y/2,
            minZ: platform.mesh.position.z - platform.size.z/2,
            maxZ: platform.mesh.position.z + platform.size.z/2
        };

        if (newBox.minX < existingBox.maxX && 
            newBox.maxX > existingBox.minX && 
            newBox.minY < existingBox.maxY && 
            newBox.maxY > existingBox.minY && 
            newBox.minZ < existingBox.maxZ && 
            newBox.maxZ > existingBox.minZ) {
            return true;
        }
    }
    return false;
}

export function createPlatform(position, size, texture, isGrapplePoint = false, isMoving = false, moveDistance = 0, moveSpeed = 0) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.8,
        metalness: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isPlatform = true;
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2)),
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    world.addBody(body);

    const platform = { 
        mesh, 
        body, 
        size: size.clone(),
        isMoving,
        originalPosition: position.clone(),
        moveDistance,
        moveSpeed,
        moveDirection: new THREE.Vector3(1, 0, 0),
        moveProgress: 0
    };
    
    platforms.push(platform);
    
    if (isMoving) {
        movingPlatforms.push(platform);
        platform.moveDirection = new THREE.Vector3(
            Math.random() > 0.5 ? 1 : -1,
            0,
            0
        ).normalize();
    }
    
    if (isGrapplePoint) {
        createGrapplePoint(
            new THREE.Vector3(
                position.x,
                position.y + size.y/2 + 0.5,
                position.z
            )
        );
    }

    return platform;
}

export function createGrapplePoint(position) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Sphere(0.5),
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    world.addBody(body);

    grapplePoints.push({ mesh, body });
}

export function createCoin(position) {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const material = new THREE.MeshStandardMaterial({ 
        map: coinTexture,
        roughness: 0.3,
        metalness: 0.9,
        emissive: 0xFFD700,
        emissiveIntensity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Cylinder(0.5, 0.5, 0.2, 32),
        position: new CANNON.Vec3(position.x, position.y, position.z),
        isCoin: true
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    world.addBody(body);

    body.addEventListener('collide', (event) => {
        if (event.body.isPlayer) {
            body.shouldRemove = true;
        }
    });

    mesh.userData.isCoin = true;
    const coin = { mesh, body };
    coins.push(coin);
    return coin;
}

function updateCoinCounter() {
    if (coinCountElement) {
        coinCountElement.textContent = `Coins: ${collectedCoins}/${requiredCoins}`;
    }
}

function showGameMessage(message, duration = 3000) {
    if (!gameMessageElement) {
        gameMessageElement = document.createElement('div');
        gameMessageElement.style.position = 'absolute';
        gameMessageElement.style.top = '50%';
        gameMessageElement.style.left = '50%';
        gameMessageElement.style.transform = 'translate(-50%, -50%)';
        gameMessageElement.style.color = 'white';
        gameMessageElement.style.fontFamily = 'Arial';
        gameMessageElement.style.fontSize = '32px';
        gameMessageElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        gameMessageElement.style.padding = '20px';
        gameMessageElement.style.borderRadius = '10px';
        gameMessageElement.style.textAlign = 'center';
        gameMessageElement.style.zIndex = '100';
        document.body.appendChild(gameMessageElement);
    }

    gameMessageElement.textContent = message;
    gameMessageElement.style.display = 'block';

    if (duration > 0) {
        setTimeout(() => {
            gameMessageElement.style.display = 'none';
        }, duration);
    }
}

export function checkCoinCollision(playerBody) {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if ((coin.body && coin.body.shouldRemove) || 
            (coin.body && playerBody && coin.body.position.distanceTo(playerBody.position) < 1.5)) {
            
            scene.remove(coin.mesh);
            world.removeBody(coin.body);
            coins.splice(i, 1);
            
            collectedCoins++;
            playCoinPickupSound(); 
            showGameMessage(`Coin collected! (${collectedCoins}/${requiredCoins})`, 1500);
            updateCoinCounter();
            
            if (collectedCoins >= requiredCoins) {
                unlockDoors();
                showGameMessage('All coins collected! Final door is now open!', 3000);
            }
        }
    }

    // Check for win condition
    platforms.forEach(platform => {
        if (platform.mesh.userData.isGoal) {
            const distance = playerBody.position.distanceTo(
                new CANNON.Vec3(
                    platform.mesh.position.x,
                    platform.mesh.position.y,
                    platform.mesh.position.z
                )
            );
            
            if (distance < 5) { 
                showWinMenu(camera,renderer);
            }
        }
    });
}

function createDoor(room, direction, width = 4, height = 5) {
    let position, size, wallAbovePosition, wallAboveSize;
    const wallThickness = 1;
    const doorHeight = height;
    const wallHeight = room.isFinalRoom ? room.height : 8;
    const wallAboveHeight = wallHeight - doorHeight;
    
    const doorWidth = width + 0.2;
    
    switch(direction) {
        case 'north':
            position = new THREE.Vector3(room.x, doorHeight/2, room.z + room.depth/2);
            size = new THREE.Vector3(doorWidth, doorHeight, 0.1);
            wallAbovePosition = new THREE.Vector3(room.x, doorHeight + wallAboveHeight/2, room.z + room.depth/2);
            wallAboveSize = new THREE.Vector3(doorWidth, wallAboveHeight, wallThickness);
            break;
        case 'south':
            position = new THREE.Vector3(room.x, doorHeight/2, room.z - room.depth/2);
            size = new THREE.Vector3(doorWidth, doorHeight, 0.1);
            wallAbovePosition = new THREE.Vector3(room.x, doorHeight + wallAboveHeight/2, room.z - room.depth/2);
            wallAboveSize = new THREE.Vector3(doorWidth, wallAboveHeight, wallThickness);
            break;
        case 'east':
            position = new THREE.Vector3(room.x + room.width/2, doorHeight/2, room.z);
            size = new THREE.Vector3(0.1, doorHeight, doorWidth);
            wallAbovePosition = new THREE.Vector3(room.x + room.width/2, doorHeight + wallAboveHeight/2, room.z);
            wallAboveSize = new THREE.Vector3(wallThickness, wallAboveHeight, doorWidth);
            break;
        case 'west':
            position = new THREE.Vector3(room.x - room.width/2, doorHeight/2, room.z);
            size = new THREE.Vector3(0.1, doorHeight, doorWidth);
            wallAbovePosition = new THREE.Vector3(room.x - room.width/2, doorHeight + wallAboveHeight/2, room.z);
            wallAboveSize = new THREE.Vector3(wallThickness, wallAboveHeight, doorWidth);
            break;
    }
    
    const door = createPlatform(position, size, doorTexture);
    door.mesh.userData.isDoor = true;
    door.mesh.userData.direction = direction;
    door.mesh.userData.isLocked = true;
    
    createPlatform(wallAbovePosition, wallAboveSize, wallTexture);
    
    room.doors.push({ door, direction });
    return door;
}

function unlockDoors() {
    rooms.forEach(room => {
        if (room.isFinalRoom) {
            room.doors.forEach(doorData => {
                if (doorData.door.mesh.userData.isLocked) {
                    scene.remove(doorData.door.mesh);
                    world.removeBody(doorData.door.body);
                    platforms = platforms.filter(p => p !== doorData.door);
                }
            });
            room.doors = [];
        }
    });
}

function createBasicRoom(room) {
    room.type = 'basic';
    
    room.platforms = generateBasicRoom(room);
    
    if (room.isStartRoom) {
        startPlatform = room.platforms[0];
        startPlatform.mesh.userData.isStart = true;
        room.platforms.forEach(p => p.mesh.userData.isStart = true);
        return;
    }
    
    if (room.isFinalRoom) {
        room.connections.forEach(connectedRoom => {
            const dx = connectedRoom.x - room.x;
            const dz = connectedRoom.z - room.z;
            
            if (Math.abs(dx) > Math.abs(dz)) {
                if (dx > 0) {
                    const door = createDoor(room, 'east');
                    door.mesh.userData.isLocked = true;
                    door.mesh.userData.requiredCoins = requiredCoins;
                } else {
                    const door = createDoor(room, 'west');
                    door.mesh.userData.isLocked = true;
                    door.mesh.userData.requiredCoins = requiredCoins;
                }
            } else {
                if (dz > 0) {
                    const door = createDoor(room, 'north');
                    door.mesh.userData.isLocked = true;
                    door.mesh.userData.requiredCoins = requiredCoins;
                } else {
                    const door = createDoor(room, 'south');
                    door.mesh.userData.isLocked = true;
                    door.mesh.userData.requiredCoins = requiredCoins;
                }
            }
        });
        
        createFinalRoomPlatforms(room);
    }
    
    
    if (room.connections.length === 1 && !room.isStartRoom && !room.isFinalRoom) {
        if (addCoinToRoom(room, room.platforms)) {
            requiredCoins++;
            updateCoinCounter();
        }
    }
}

function createFinalRoomPlatforms(room) {
    const platformCount = 8;
    const heightStep = room.height / platformCount;
    const platformSize = new THREE.Vector3(5, 0.5, 5);
    
    for (let i = 1; i < platformCount; i++) {
        const height = i * heightStep;
        const offsetX = (i % 2 === 0) ? room.width/4 : -room.width/4;
        const offsetZ = (i % 3 === 0) ? room.depth/4 : -room.depth/4;
        
        createPlatform(
            new THREE.Vector3(
                room.x + offsetX,
                height,
                room.z + offsetZ
            ),
            platformSize.clone(),
            platformTexture
        );
    }
    
    const goalPlatform = createPlatform(
        new THREE.Vector3(
            room.x,
            room.height - 2,
            room.z
        ),
        new THREE.Vector3(8, 1, 8),
        goaltexture
    );
    goalPlatform.mesh.userData.isGoal = true;
    createFlag(new THREE.Vector3(room.x, room.height - 1.5, room.z));
    createGrapplePoint(new THREE.Vector3(
        room.x,
        room.height / 2,
        room.z
    ));
}

function addGrapplePointsToRoom(room) {
    const pointsToAdd = 1 + Math.floor(Math.random() * 2);
    const wallHeight = room.isFinalRoom ? room.height : 8;
    
    for (let i = 0; i < pointsToAdd; i++) {
        if (Math.random() > 0.5) {
            const wall = Math.floor(Math.random() * 4);
            let position;
            
            switch(wall) {
                case 0:
                    position = new THREE.Vector3(
                        room.x + (Math.random() - 0.5) * room.width * 0.8,
                        wallHeight - 1,
                        room.z + room.depth/2 - 0.5
                    );
                    break;
                case 1:
                    position = new THREE.Vector3(
                        room.x + (Math.random() - 0.5) * room.width * 0.8,
                        wallHeight - 1,
                        room.z - room.depth/2 + 0.5
                    );
                    break;
                case 2:
                    position = new THREE.Vector3(
                        room.x + room.width/2 - 0.5,
                        wallHeight - 1,
                        room.z + (Math.random() - 0.5) * room.depth * 0.8
                    );
                    break;
                case 3:
                    position = new THREE.Vector3(
                        room.x - room.width/2 + 0.5,
                        wallHeight - 1,
                        room.z + (Math.random() - 0.5) * room.depth * 0.8
                    );
                    break;
            }
            
            createGrapplePoint(position);
        } else {
            createGrapplePoint(new THREE.Vector3(
                room.x + (Math.random() - 0.5) * room.width/2,
                3 + Math.random() * (wallHeight - 3),
                room.z + (Math.random() - 0.5) * room.depth/2
            ));
        }
    }
}
function createHallway(room1, room2) {
    const hallwayWidth = 4;
    const wallThickness = 0.5;
    const platformSize = 2;
    const platformThickness = 0.5;
    const height = room1.isFinalRoom ? room1.height : 
                  room2.isFinalRoom ? room2.height : 20;  

    const dx = room2.x - room1.x;
    const dz = room2.z - room1.z;
    const horizontal = Math.abs(dx) > Math.abs(dz);

    const axis = horizontal ? 'x' : 'z';
    const perpAxis = horizontal ? 'z' : 'x';

    const start = horizontal
        ? room1.x + Math.sign(dx) * room1.width / 2
        : room1.z + Math.sign(dz) * room1.depth / 2;

    const end = horizontal
        ? room2.x - Math.sign(dx) * room2.width / 2
        : room2.z - Math.sign(dz) * room2.depth / 2;

    const center = (start + end) / 2;
    const length = Math.abs(end - start);

    const fixedCoord = horizontal ? (room1.z + room2.z) / 2 : (room1.x + room2.x) / 2;

    const floorPosition = horizontal
        ? new THREE.Vector3(center, 0, fixedCoord)
        : new THREE.Vector3(fixedCoord, 0, center);

    const floorSize = horizontal
        ? new THREE.Vector3(length, platformThickness, hallwayWidth)
        : new THREE.Vector3(hallwayWidth, platformThickness, length);

    createPlatform(floorPosition, floorSize, platformTexture);

    const wallOffset = hallwayWidth / 2;

    const wall1Position = horizontal
        ? new THREE.Vector3(center, height / 2, fixedCoord + wallOffset)
        : new THREE.Vector3(fixedCoord + wallOffset, height / 2, center);

    const wall2Position = horizontal
        ? new THREE.Vector3(center, height / 2, fixedCoord - wallOffset)
        : new THREE.Vector3(fixedCoord - wallOffset, height / 2, center);

    const wallSize = horizontal
        ? new THREE.Vector3(length, height, wallThickness)
        : new THREE.Vector3(wallThickness, height, length);

    createPlatform(wall1Position, wallSize, wallTexture);
    createPlatform(wall2Position, wallSize, wallTexture);

    const platformCount = Math.floor(length / 6);
    const heightOptions = [2, 3, 4];
    for (let i = 0; i < platformCount; i++) {
        const posAlong = start + (i + 0.5) * (length / platformCount);
        const platformHeight = heightOptions[Math.floor(Math.random() * heightOptions.length)];

        const platformPosition = horizontal
            ? new THREE.Vector3(posAlong, platformHeight, fixedCoord)
            : new THREE.Vector3(fixedCoord, platformHeight, posAlong);

        createPlatform(
            platformPosition,
            new THREE.Vector3(platformSize, platformThickness, platformSize),
            platformTexture
        );
    }
}

export function generateRoomMap() {

 
    platforms.forEach(p => {
        scene.remove(p.mesh);
        world.removeBody(p.body);
    });
    grapplePoints.forEach(gp => {
        scene.remove(gp.mesh);
        world.removeBody(gp.body);
    });
    coins.forEach(coin => {
        scene.remove(coin.mesh);
        world.removeBody(coin.body);
    });
    
    platforms = [];
    grapplePoints.length = 0;
    movingPlatforms.length = 0;
    coins.length = 0;
    rooms = [];
    requiredCoins = 0;
    collectedCoins = 0;
    startPlatform = null;

    const roomSize = 20;
    const roomHeight = 8;
    const finalRoomHeight = 24;
    const roomCount = 8 + Math.floor(Math.random() * 4);
    const minDistanceBetweenRooms = 5;
    playerBody.canDoubleJump = false
    const startRoom = new Room(
        0, 0, 
        roomSize,
        roomSize,
        roomHeight,
        true  
    );
    rooms.push(startRoom);
    
    if (roomCount > 1) {
        let firstRoom;
        let attempts = 0;
        const maxAttempts = 100;
        let validPosition = false;
        
        do {
            const direction = Math.floor(Math.random() * 4);
            let dx, dz;
            
            switch(direction) {
                case 0: dx = 0; dz = 1; break;
                case 1: dx = 0; dz = -1; break;
                case 2: dx = 1; dz = 0; break;
                case 3: dx = -1; dz = 0; break;
            }
            
            const distance = roomSize + minDistanceBetweenRooms;
            const x = startRoom.x + dx * distance;
            const z = startRoom.z + dz * distance;
            
            firstRoom = new Room(
                x, z,
                roomSize,
                roomSize,
                roomHeight
            );
            
            let overlaps = false;
            for (const existingRoom of rooms) {
                const roomDx = Math.abs(firstRoom.x - existingRoom.x);
                const roomDz = Math.abs(firstRoom.z - existingRoom.z);
                
                const minSeparation = roomSize + minDistanceBetweenRooms;
                
                if (roomDx < minSeparation && roomDz < minSeparation) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                startRoom.connections.push(firstRoom);
                firstRoom.connections.push(startRoom);
                rooms.push(firstRoom);
                validPosition = true;
            }
            
            attempts++;
        } while (!validPosition && attempts < maxAttempts);
    }
    
    for (let i = rooms.length; i < roomCount; i++) {
        let newRoom;
        let attempts = 0;
        const maxAttempts = 100;
        let validPosition = false;
        
        do {
            const baseRoom = rooms[Math.floor(Math.random() * rooms.length)];
            if (baseRoom.isStartRoom) continue;
            
            const direction = Math.floor(Math.random() * 4);
            let dx, dz;
            
            switch(direction) {
                case 0: dx = 0; dz = 1; break;
                case 1: dx = 0; dz = -1; break;
                case 2: dx = 1; dz = 0; break;
                case 3: dx = -1; dz = 0; break;
            }
            
            const distance = roomSize + minDistanceBetweenRooms;
            const x = baseRoom.x + dx * distance;
            const z = baseRoom.z + dz * distance;
            
            newRoom = new Room(
                x, z,
                roomSize,
                roomSize,
                roomHeight
            );
            
            let overlaps = false;
            for (const existingRoom of rooms) {
                const roomDx = Math.abs(newRoom.x - existingRoom.x);
                const roomDz = Math.abs(newRoom.z - existingRoom.z);
                
                const minSeparation = roomSize + minDistanceBetweenRooms;
                
                if (roomDx < minSeparation && roomDz < minSeparation) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                newRoom.connections.push(baseRoom);
                baseRoom.connections.push(newRoom);
                rooms.push(newRoom);
                validPosition = true;
            }
            
            attempts++;
        } while (!validPosition && attempts < maxAttempts);
    }
    
    const potentialFinalRooms = rooms.filter(room => 
        room.connections.length === 1 && !room.isStartRoom
    );
    
    if (potentialFinalRooms.length > 0) {
        const finalRoom = potentialFinalRooms[
            Math.floor(Math.random() * potentialFinalRooms.length)
        ];
        finalRoom.isFinalRoom = true;
        finalRoom.height = finalRoomHeight;
    }
    
    for (const room of rooms) {
        createBasicRoom(room);
    }
    
    for (const room of rooms) {
        room.connections.forEach(connectedRoom => {
            if (rooms.indexOf(room) < rooms.indexOf(connectedRoom)) {
                createHallway(room, connectedRoom);
            }
        });
    }
    
   
    
    updateCoinCounter();
}

export function setupWorld() {
    setupPhysics(scene);
  
    coinCountElement = document.createElement('div');
    coinCountElement.style.position = 'absolute';
    coinCountElement.style.top = '20px';
    coinCountElement.style.left = '20px';
    coinCountElement.style.color = 'white';
    coinCountElement.style.fontFamily = 'Arial';
    coinCountElement.style.fontSize = '24px';
    coinCountElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    coinCountElement.style.padding = '10px';
    coinCountElement.style.borderRadius = '5px';
    document.body.appendChild(coinCountElement);
    
    if (startPlatform) {
        playerBody.position.set(
            startPlatform.mesh.position.x,
            startPlatform.mesh.position.y + 1.5,
            startPlatform.mesh.position.z
        );
        playerBody.velocity.set(0, 0, 0);
        playerBody.angularVelocity.set(0, 0, 0);
        playerBody.canDoubleJump = false;
    }

   
 
    updateCoinCounter();
    showGameMessage('Collect all coins to unlock the final door!', 3000);
}

export function checkPlayerFell() {
    if (playerBody.position.y < -10) {
        return true;
    }
    return false;
}

export function resetPlayer() {
    coins.forEach(coin => {
        scene.remove(coin.mesh);
        world.removeBody(coin.body);
    });
    coins.length = 0;
    
    collectibles.forEach(collectible => {
        scene.remove(collectible.mesh);
        world.removeBody(collectible.body);
    });
    collectibles.length = 0;
    
    collectedCoins = 0;
    updateCoinCounter();
    
    rooms.forEach(room => {
        if (room.connections.length === 1 && !room.isStartRoom && !room.isFinalRoom) {
            addCoinToRoom(room, room.platforms);
        }
    });
    player.canDoubleJump = false;
    player.hasDoubleJumped = false;
    setupCollectibles(scene);
    
    if (startPlatform) {
        playerBody.position.set(
            startPlatform.mesh.position.x,
            startPlatform.mesh.position.y + 1.5,
            startPlatform.mesh.position.z
        );
        playerBody.velocity.set(0, 0, 0);
        playerBody.angularVelocity.set(0, 0, 0);
    }
    
 
    
    showGameMessage('Player reset - coins and abilities reset!', 2000);
}
generateRoomMap();

export function regenerateMap() {
    generateRoomMap();
    showGameMessage('New level generated!', 2000);
    resetPlayer(playerBody)
}


function createFlag(position) {
    const poleHeight = 6;
    const poleRadius = 0.1;
    const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
    poleMesh.position.copy(position);
    poleMesh.position.y += poleHeight / 2;
    poleMesh.castShadow = true;
    poleMesh.receiveShadow = true;
    scene.add(poleMesh);

    const flagWidth = 2;
    const flagHeight = 1.5;
    const widthSegments = 10;
    const heightSegments = 5;
    const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight, widthSegments, heightSegments);

    flagGeometry.translate(flagWidth / 2, 0, 0);

    const flagMaterial = new THREE.MeshStandardMaterial({
        map: flagTexture,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5,
    });

    const flagMesh = new THREE.Mesh(flagGeometry, flagMaterial);

    flagMesh.position.set(
        position.x + poleRadius,               
        position.y + poleHeight - flagHeight / 2,
        position.z
    );

    flagMesh.castShadow = true;
    flagMesh.receiveShadow = true;

    flagMesh.rotation.y = Math.PI / 6;

    scene.add(flagMesh);

    const clock = new THREE.Clock();

    function animateFlag() {
        const time = clock.getElapsedTime();
        const positionAttr = flagGeometry.attributes.position;

        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i);
            const y = positionAttr.getY(i);

       
            const wave = 0.1 * Math.sin(5 * x + time * 3) * (1 - y / flagHeight);
            positionAttr.setZ(i, wave);
        }

        positionAttr.needsUpdate = true;
        requestAnimationFrame(animateFlag);
    }

    animateFlag();
}


export { world, requiredCoins, collectedCoins };