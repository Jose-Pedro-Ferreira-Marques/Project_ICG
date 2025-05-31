// generateRoom.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPlatform, createGrapplePoint, createCoin, platforms ,requiredCoins} from './world.js';

const platformTexture = new THREE.TextureLoader().load('images/textures/granite_tile_diff_4k.jpg');
platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(4, 4);

const wallTexture = new THREE.TextureLoader().load('images/textures/painted_plaster_wall_disp_4k.png');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4);

export const basicRoomTemplates = [
    // Template 1: Simple platform layout
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Left platform
        platforms.push(createPlatform(
            new THREE.Vector3(room.x - room.width/3, 2, room.z),
            new THREE.Vector3(4, 0.5, 4),
            platformTexture
        ));
        
        // Right platform
        platforms.push(createPlatform(
            new THREE.Vector3(room.x + room.width/3, 4, room.z),
            new THREE.Vector3(4, 0.5, 4),
            platformTexture
        ));
        
        // Grapple point in center
       
        
        return platforms;
    },
    
    
    
    // Template 3: Central tower with surrounding platforms
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Central tower
        platforms.push(createPlatform(
            new THREE.Vector3(room.x, 4, room.z),
            new THREE.Vector3(3, 0.5, 3),
            platformTexture
        ));
        
        // Surrounding platforms
        const positions = [
            { x: -room.width/3, z: 0 },
            { x: room.width/3, z: 0 },
            { x: 0, z: -room.depth/3 },
            { x: 0, z: room.depth/3 }
        ];
        
        positions.forEach(pos => {
            platforms.push(createPlatform(
                new THREE.Vector3(room.x + pos.x, 2, room.z + pos.z),
                new THREE.Vector3(3, 0.5, 3),
                platformTexture
            ));
        });
        
        // Grapple points
        createGrapplePoint(new THREE.Vector3(room.x, 6, room.z));
        createGrapplePoint(new THREE.Vector3(room.x + room.width/3, 3, room.z));
        
        return platforms;
    },
    
    // Template 4: Platform maze
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create a grid of platforms
        const gridSize = 3;
        const spacing = room.width / (gridSize + 1);
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (Math.random() > 0.3) { // 70% chance to create a platform
                    const height = 1 + Math.floor(Math.random() * 3);
                    platforms.push(createPlatform(
                        new THREE.Vector3(
                            room.x - room.width/2 + (i + 1) * spacing,
                            height,
                            room.z - room.depth/2 + (j + 1) * spacing
                        ),
                        new THREE.Vector3(2, 0.5, 2),
                        platformTexture
                    ));
                }
            }
        }
        
        // Grapple points
        createGrapplePoint(new THREE.Vector3(
            room.x - room.width/3, 5, room.z - room.depth/3
        ));
        createGrapplePoint(new THREE.Vector3(
            room.x + room.width/3, 5, room.z + room.depth/3
        ));
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create 4 floating islands at different heights
        const positions = [
            { x: -room.width/3, z: -room.depth/3, y: 3 },
            { x: room.width/3, z: -room.depth/3, y: 5 },
            { x: -room.width/3, z: room.depth/3, y: 4 },
            { x: room.width/3, z: room.depth/3, y: 6 }
        ];
        
        positions.forEach(pos => {
            platforms.push(createPlatform(
                new THREE.Vector3(room.x + pos.x, pos.y, room.z + pos.z),
                new THREE.Vector3(3, 0.5, 3),
                platformTexture
            ));
        });
        
        // Grapple points between islands
        createGrapplePoint(new THREE.Vector3(room.x, 4, room.z));
        createGrapplePoint(new THREE.Vector3(room.x, 7, room.z));
        
        return platforms;
    },

    // New Template 2: Zig-Zag Path
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create a zig-zag path upwards
        const steps = 5;
        const stepHeight = 1.5;
        const stepLength = 3;
        
        for (let i = 0; i < steps; i++) {
            const xPos = i % 2 === 0 ? 
                room.x - room.width/4 : 
                room.x + room.width/4;
                
            platforms.push(createPlatform(
                new THREE.Vector3(
                    xPos,
                    1 + (i * stepHeight),
                    room.z - room.depth/4 + (i * stepLength)
                ),
                new THREE.Vector3(3, 0.5, 2),
                platformTexture
            ));
        }
        
        // Grapple point at end
       
        
        return platforms;
    },

    // New Template 3: Central Pillar with Bridges
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
     
        
        // Bridges to central pillar
        const bridgeDirections = [
            { x: 1, z: 0 },
            { x: -1, z: 0 },
            { x: 0, z: 1 },
            { x: 0, z: -1 }
        ];
        
        bridgeDirections.forEach(dir => {
            platforms.push(createPlatform(
                new THREE.Vector3(
                    room.x + (dir.x * room.width/4),
                    5,
                    room.z + (dir.z * room.depth/4)
                ),
                new THREE.Vector3(
                    dir.x !== 0 ? room.width/2 - 2 : 2,
                    0.5,
                    dir.z !== 0 ? room.depth/2 - 2 : 2
                ),
                platformTexture
            ));
        });
        
  
        
        return platforms;
    },

    // New Template 4: Spiral Tower
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create spiral platforms
        const levels = 6;
        const radius = room.width/3;
        
        for (let i = 0; i < levels; i++) {
            const angle = (i / levels) * Math.PI * 2;
            const xPos = room.x + Math.cos(angle) * radius;
            const zPos = room.z + Math.sin(angle) * radius;
            
            platforms.push(createPlatform(
                new THREE.Vector3(xPos, 1 + i * 1.5, zPos),
                new THREE.Vector3(2.5, 0.5, 2.5),
                platformTexture
            ));
        }
        
        // Grapple point at top
        createGrapplePoint(new THREE.Vector3(
            room.x,
            1 + (levels * 1.5) + 2,
            room.z
        ));
        
        return platforms;
    },

    // New Template 5: Platform Grid with Gaps
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create a grid of platforms with gaps
        const gridSize = 4;
        const cellSize = room.width / (gridSize + 1);
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Skip some platforms to create gaps
                if (Math.random() > 0.4 || (i === 0 && j === 0)) {
                    const height = 1 + Math.random() * 3;
                    platforms.push(createPlatform(
                        new THREE.Vector3(
                            room.x - room.width/2 + (i + 0.5) * cellSize,
                            height,
                            room.z - room.depth/2 + (j + 0.5) * cellSize
                        ),
                        new THREE.Vector3(cellSize * 0.8, 0.5, cellSize * 0.8),
                        platformTexture
                    ));
                }
            }
        }
        
        // Grapple points to help cross gaps
        createGrapplePoint(new THREE.Vector3(
            room.x - room.width/4, 5, room.z
        ));
        createGrapplePoint(new THREE.Vector3(
            room.x + room.width/4, 5, room.z
        ));
        
        return platforms;
    },

    // New Template 6: High Platforms with Ramps
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // High platforms
        const highPlatforms = [
            { x: -room.width/3, z: 0, y: 4 },
            { x: room.width/3, z: 0, y: 6 }
        ];
        
        highPlatforms.forEach(plat => {
            platforms.push(createPlatform(
                new THREE.Vector3(room.x + plat.x, plat.y, room.z + plat.z),
                new THREE.Vector3(4, 0.5, 4),
                platformTexture
            ));
        });
        
        // Ramps connecting platforms
        platforms.push(createPlatform(
            new THREE.Vector3(room.x, 2, room.z),
            new THREE.Vector3(room.width/2, 0.5, 1),
            platformTexture
        ));
        
        platforms.push(createPlatform(
            new THREE.Vector3(room.x, 5, room.z),
            new THREE.Vector3(room.width/2, 0.5, 1),
            platformTexture
        ));
        
        // Grapple points
        createGrapplePoint(new THREE.Vector3(
            room.x - room.width/3, 7, room.z
        ));
        createGrapplePoint(new THREE.Vector3(
            room.x + room.width/3, 7, room.z
        ));
        
        return platforms;
    },

    // New Template 7: Vertical Challenge
    (room) => {
        const platforms = [];
        
        // Main floor
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        // Create a series of small platforms going upwards
        const steps = 8;
        for (let i = 0; i < steps; i++) {
            const offsetX = (i % 2 === 0) ? -room.width/4 : room.width/4;
            const offsetZ = (i % 3 === 0) ? -room.depth/4 : room.depth/4;
            
            platforms.push(createPlatform(
                new THREE.Vector3(
                    room.x + offsetX,
                    1 + i * 1.2,
                    room.z + offsetZ
                ),
                new THREE.Vector3(2, 0.5, 2),
                platformTexture
            ));
        }
        
        // Grapple points at key positions
        createGrapplePoint(new THREE.Vector3(
            room.x, 5, room.z
        ));
        createGrapplePoint(new THREE.Vector3(
            room.x, 9, room.z
        ));
        
        return platforms;
    },

    // Add this to your basicRoomTemplates array
(room) => {
    const platforms = [];
    
    // Main floor
    platforms.push(createPlatform(
        new THREE.Vector3(2, 0, 2),
        new THREE.Vector3(2, 0.5, 2),
        platformTexture
    ));
    
    // Central obstacle tower (hollow)
    const towerHeight = 8;
    const towerWidth = 6;
    const towerDepth = 6;
    const wallThickness = 1;
    
    // Create four walls around the center
    platforms.push(createPlatform(
        new THREE.Vector3(room.x, towerHeight/2, room.z - towerDepth/2),
        new THREE.Vector3(towerWidth, towerHeight, wallThickness),
        wallTexture
    ));
    platforms.push(createPlatform(
        new THREE.Vector3(room.x, towerHeight/2, room.z + towerDepth/2),
        new THREE.Vector3(towerWidth, towerHeight, wallThickness),
        wallTexture
    ));
    platforms.push(createPlatform(
        new THREE.Vector3(room.x - towerWidth/2, towerHeight/2, room.z),
        new THREE.Vector3(wallThickness, towerHeight, towerDepth),
        wallTexture
    ));
    platforms.push(createPlatform(
        new THREE.Vector3(room.x + towerWidth/2, towerHeight/2, room.z),
        new THREE.Vector3(wallThickness, towerHeight, towerDepth),
        wallTexture
    ));
    
    // Grapple points - one visible when entering, others hidden
    createGrapplePoint(new THREE.Vector3(
        room.x, 
        towerHeight + 2, 
        room.z + room.depth/3  // Visible from entrance
    ));
    
    // Hidden grapple points (behind walls)
    createGrapplePoint(new THREE.Vector3(
        room.x - room.width/3,
        towerHeight + 1,
        room.z
    ));
    
    createGrapplePoint(new THREE.Vector3(
        room.x,
        towerHeight - 2,
        room.z - room.depth/3
    ));
    
    createGrapplePoint(new THREE.Vector3(
        room.x + room.width/3,
        towerHeight + 3,
        room.z
    ));
    
   
    
    return platforms;
}
    
];

export function generateBasicRoom(room) {
    // Choose a random template
    const template = basicRoomTemplates[Math.floor(Math.random() * basicRoomTemplates.length)];
    const roomPlatforms = template(room);
    
    // Add walls and doors based on connections
    addWallsAndDoors(room);
    
    return roomPlatforms;
}
function addWallsAndDoors(room) {
    // Increased wall height from 8 to 15
    const wallHeight = room.isFinalRoom ? room.height : 15;  // Changed from 8 to 15
    const wallThickness = 1;
    const openingWidth = 4;

    room.connections.forEach(connectedRoom => {
        const dx = connectedRoom.x - room.x;
        const dz = connectedRoom.z - room.z;
        
        if (Math.abs(dx) > Math.abs(dz)) {
            if (dx > 0) {
                // East wall with opening
                const wallDepth = (room.depth - openingWidth) / 2;
                createPlatform(
                    new THREE.Vector3(room.x + room.width/2, wallHeight/2, room.z - room.depth/4 - 0.5),
                    new THREE.Vector3(wallThickness, wallHeight, wallDepth),
                    wallTexture
                );
                createPlatform(
                    new THREE.Vector3(room.x + room.width/2, wallHeight/2, room.z + room.depth/4 + 0.5),
                    new THREE.Vector3(wallThickness, wallHeight, wallDepth),
                    wallTexture
                );
            } else {
                // West wall with opening
                const wallDepth = (room.depth - openingWidth) / 2;
                createPlatform(
                    new THREE.Vector3(room.x - room.width/2, wallHeight/2, room.z - room.depth/4 - 0.5),
                    new THREE.Vector3(wallThickness, wallHeight, wallDepth),
                    wallTexture
                );
                createPlatform(
                    new THREE.Vector3(room.x - room.width/2, wallHeight/2, room.z + room.depth/4 + 0.5),
                    new THREE.Vector3(wallThickness, wallHeight, wallDepth),
                    wallTexture
                );
            }
        } else {
            if (dz > 0) {
                // North wall with opening
                const wallWidth = (room.width - openingWidth) / 2;
                createPlatform(
                    new THREE.Vector3(room.x - room.width/4 - 0.5, wallHeight/2, room.z + room.depth/2),
                    new THREE.Vector3(wallWidth, wallHeight, wallThickness),
                    wallTexture
                );
                createPlatform(
                    new THREE.Vector3(room.x + room.width/4 + 0.5, wallHeight/2, room.z + room.depth/2),
                    new THREE.Vector3(wallWidth, wallHeight, wallThickness),
                    wallTexture
                );
            } else {
                // South wall with opening
                const wallWidth = (room.width - openingWidth) / 2;
                createPlatform(
                    new THREE.Vector3(room.x - room.width/4 - 0.5, wallHeight/2, room.z - room.depth/2),
                    new THREE.Vector3(wallWidth, wallHeight, wallThickness),
                    wallTexture
                );
                createPlatform(
                    new THREE.Vector3(room.x + room.width/4 + 0.5, wallHeight/2, room.z - room.depth/2),
                    new THREE.Vector3(wallWidth, wallHeight, wallThickness),
                    wallTexture
                );
            }
        }
    });

    // Add walls where there are no connections
    const hasNorthOpening = room.connections.some(r => r.z > room.z);
    const hasSouthOpening = room.connections.some(r => r.z < room.z);
    const hasEastOpening = room.connections.some(r => r.x > room.x);
    const hasWestOpening = room.connections.some(r => r.x < room.x);

    if (!hasNorthOpening) {
        createPlatform(
            new THREE.Vector3(room.x, wallHeight/2, room.z + room.depth/2),
            new THREE.Vector3(room.width, wallHeight, wallThickness),
            wallTexture
        );
    }
    
    if (!hasSouthOpening) {
        createPlatform(
            new THREE.Vector3(room.x, wallHeight/2, room.z - room.depth/2),
            new THREE.Vector3(room.width, wallHeight, wallThickness),
            wallTexture
        );
    }
    
    if (!hasEastOpening) {
        createPlatform(
            new THREE.Vector3(room.x + room.width/2, wallHeight/2, room.z),
            new THREE.Vector3(wallThickness, wallHeight, room.depth),
            wallTexture
        );
    }
    
    if (!hasWestOpening) {
        createPlatform(
            new THREE.Vector3(room.x - room.width/2, wallHeight/2, room.z),
            new THREE.Vector3(wallThickness, wallHeight, room.depth),
            wallTexture
        );
    }
}
export function addCoinToRoom(room, roomPlatforms) {
    const suitablePlatforms = roomPlatforms.filter(platform => 
        platform.size.x >= 3 && 
        platform.size.z >= 3 &&
        platform.mesh.position.y < 5 &&  // Not too high
        !platform.mesh.userData.hasCoin &&
        !platform.mesh.userData.isStart
    );
    
    if (suitablePlatforms.length > 0) {
        const platform = suitablePlatforms[Math.floor(Math.random() * suitablePlatforms.length)];
        createCoin(
            new THREE.Vector3(
                platform.mesh.position.x,
                platform.mesh.position.y + platform.size.y/2 + 0.5,
                platform.mesh.position.z
            )
        );
        platform.mesh.userData.hasCoin = true;
        room.hasCoin = true;
        return true;
    }


    if (suitablePlatforms.length === 0) {
        const coinPlatform = createPlatform(
            new THREE.Vector3(room.x, 2, room.z),
            new THREE.Vector3(3, 0.5, 3),
            platformTexture
        );
        createCoin(
            new THREE.Vector3(
                room.x,
                2 + 0.5 + 0.5,
                room.z
            )
        );
        coinPlatform.mesh.userData.hasCoin = true;
        room.hasCoin = true;
        return true;
    }


    return false;
}