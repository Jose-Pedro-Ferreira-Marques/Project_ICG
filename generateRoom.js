import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPlatform, createGrapplePoint, createCoin, platforms ,requiredCoins} from './world.js';

const platformTexture = new THREE.TextureLoader().load('public/images/granite_tile_diff_4k.jpg');
platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
platformTexture.repeat.set(4, 4);

const wallTexture = new THREE.TextureLoader().load('public/images/painted_plaster_wall_disp_4k.png');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(4, 4);

export const basicRoomTemplates = [
    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        platforms.push(createPlatform(
            new THREE.Vector3(room.x - room.width/3, 2, room.z),
            new THREE.Vector3(4, 0.5, 4),
            platformTexture
        ));
        
        platforms.push(createPlatform(
            new THREE.Vector3(room.x + room.width/3, 4, room.z),
            new THREE.Vector3(4, 0.5, 4),
            platformTexture
        ));
        
       
        
        return platforms;
    },
    
    
    
    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        platforms.push(createPlatform(
            new THREE.Vector3(room.x, 4, room.z),
            new THREE.Vector3(3, 0.5, 3),
            platformTexture
        ));
        
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
        
      
        
        return platforms;
    },
    
    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        const gridSize = 3;
        const spacing = room.width / (gridSize + 1);
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (Math.random() > 0.3) { 
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
        
        
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
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
        
        createGrapplePoint(new THREE.Vector3(room.x, 4, room.z));
        createGrapplePoint(new THREE.Vector3(room.x, 7, room.z));
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
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
        
       
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
     
        
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

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
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
        
        createGrapplePoint(new THREE.Vector3(
            room.x,
            1 + (levels * 1.5) + 2,
            room.z
        ));
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
        const gridSize = 4;
        const cellSize = room.width / (gridSize + 1);
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
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
        
       
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
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
        
     
        
        return platforms;
    },

    (room) => {
        const platforms = [];
        
        platforms.push(createPlatform(
            new THREE.Vector3(2, 0, 2),
            new THREE.Vector3(2, 0.5, 2),
            platformTexture
        ));
        
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
        
       
        return platforms;
    },

(room) => {
    const platforms = [];
    
    platforms.push(createPlatform(
        new THREE.Vector3(2, 0, 2),
        new THREE.Vector3(2, 0.5, 2),
        platformTexture
    ));
    
    const towerHeight = 8;
    const towerWidth = 6;
    const towerDepth = 6;
    const wallThickness = 1;
    
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
    
    createGrapplePoint(new THREE.Vector3(
        room.x, 
        towerHeight + 2, 
        room.z + room.depth/3  
    ));
    
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
    const template = basicRoomTemplates[Math.floor(Math.random() * basicRoomTemplates.length)];
    const roomPlatforms = template(room);
    
    addWallsAndDoors(room);
    
    return roomPlatforms;
}
function addWallsAndDoors(room) {
    const wallHeight = room.isFinalRoom ? room.height : 20;  
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
        platform.mesh.position.y < 5 &&  
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