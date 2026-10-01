import Phaser from "phaser";
import { calculateCordinateX, calculateCordinateY, sizes } from "./gameScene";
import { LandScene } from "./landScene";

export function calculateCordinateSmallerX(x) {
    return Math.floor(x / sizes.tileSize)
}

export function calculateCordinateSmallerY(y) {
    return Math.floor((y - sizes.hudHeight) / sizes.tileSize)
}

export class MapEditor extends Phaser.Scene {
    constructor() {
        super ("MapEditor")
        this.nondestroyableblock
        this.destroyableblock
        this.groundblock
        this.follower
        this.focus
        this.selectedBlock
        this.tileset
        this.map
        this.crusorDown = false
        this.mapData
        this.allData = undefined
    }

    init(data){
        //Alap pálya létrehozása vagy betöltése
        if (data.mapData === undefined || data.mapData === null ){
            this.mapData = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ]
        }else{
            this.mapData = JSON.parse(data.mapData[0].map_json)
            this.allData = data.mapData
        }

    }

    preload() {
        //Pálya elemek
        this.load.spritesheet('tiles', 'assets/bomberman_tiles.png', {
            frameWidth: sizes.tileSize,
            frameHeight: sizes.tileSize
        })
    
    }

    create() {

        //Választható blockok
        this.nondestroyableblock = this.add.sprite(sizes.screenWidth/2-sizes.tileSize, 25, "tiles", 1)
        this.nondestroyableblock.setInteractive()

        this.destroyableblock = this.add.sprite(sizes.screenWidth/2+sizes.tileSize, 25, "tiles", 2)
        this.destroyableblock.setInteractive()

        this.groundblock = this.add.sprite(this.nondestroyableblock.x - (2 * sizes.tileSize), 25, "tiles", 0)
        this.groundblock.setInteractive()

        const map = this.make.tilemap({
            tileHeight: sizes.tileSize,
            tileWidth: sizes.tileSize,
            width: sizes.mapSize,
            height:sizes.mapSize
        })

        this.map = map

        const tileset = map.addTilesetImage('tiles', 'tiles')

        const layer = map.createBlankLayer('grounds', tileset, 0, sizes.hudHeight)
        this.layer = layer

        this.mapData.forEach((row, y) => {
            row.forEach((tile, x) => {
                layer.putTileAt(tile, x, y)
            })
        })

        this.focus = this.add.graphics()
        this.selectedBlock = null

        //Pálya mentése
        const saveButton = this.add.text(sizes.screenWidth - 75, 10, 'Save', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        const publishButton = this.add.text(sizes.screenWidth - 175, 10, 'Publish', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        const deleteButton = this.add.text(15, 10, 'Delete', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        deleteButton.setInteractive({useHandCursor: true}).on('pointerdown', ()=> {
            this.onDelete(this.allData[0].id)
            this.scene.start('MapManagment')
        })

        saveButton.setInteractive({useHandCursor: true})
        saveButton.on('pointerdown', () => {
            saveButton.setStyle({backgroundColor: "#555555"})
            this.onSave(this.mapData, 0)
            this.scene.start('MapManagment')
        })

        publishButton.setInteractive({useHandCursor: true})
        publishButton.on('pointerdown', () => {
            publishButton.setStyle({backgroundColor: "#555555"})
            this.onSave(this.mapData, 1)
            this.scene.switch('MapManagment')
        })
        
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        this.keyV = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V)
    }

    update() {
        const pointer = this.input.activePointer

        if (Phaser.Input.Keyboard.JustDown(this.keyV)){
            console.log(this.mapData)
        }

        //console.log(calculateCordinateX(pointer.x),calculateCordinateSmallerY(pointer.y))

        this.nondestroyableblock.on('pointerdown', () => {
            this.selectedBlock = this.nondestroyableblock
            this.follower = this.nondestroyableblock.frame.name
        })

        this.destroyableblock.on('pointerdown', () => {
            this.selectedBlock = this.destroyableblock
            this.follower = this.destroyableblock.frame.name
        })

        this.groundblock.on('pointerdown', () => {
            this.selectedBlock = this.groundblock
            this.follower = this.groundblock.frame.name
        })

        if (this.crusorDown == true && !pointer.isDown) {
            this.crusorDown = false
        }

        if (this.crusorDown == false && pointer.isDown && pointer.y > sizes.hudHeight && this.follower != null && this.canPlaceTile(pointer, this.follower) === true) {
            this.mapData[calculateCordinateSmallerY(pointer.y)][calculateCordinateSmallerX(pointer.x)] = this.follower
            this.layer.putTileAt(this.follower, calculateCordinateSmallerX(pointer.x), calculateCordinateSmallerY(pointer.y))
        }

        this.focus.clear()

        if (this.selectedBlock) {
        this.focus.lineStyle(4, 0xff0000, 1);
        this.focus.strokeRect(
            this.selectedBlock.x - this.selectedBlock.displayWidth / 2,
            this.selectedBlock.y - this.selectedBlock.displayHeight / 2,
            this.selectedBlock.displayWidth,
            this.selectedBlock.displayHeight
            );
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.pause('MapEditor')
            this.scene.launch('MenuScene')
            this.registry.set('previousScene', 'MapEditor')
        }
    }

    exportMap() {
        const mapString = JSON.stringify(this.mapData)
        const blob = new Blob([mapString], {type: "text/plain"})
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "custom_map.txt"

        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        console.log("Map saved")
    }

    showNotification(text, duration) {
        const notification = this.add.text(sizes.screenWidth / 2, 
            20, 
            text,
        {
            font: '20px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        }
        ).setOrigin(0.5, 0).setDepth(1000).setAlpha(1)

        this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 500,
            delay: duration - 500,
            onComplete: () => {
                notification.destroy()
            }
        })

        this.time.delayedCall(duration, () => {
            notification.destroy()
        })
    }

    cornerSpawn(x,y) {
        if ([1,2,13,14].includes(calculateCordinateSmallerX(x)) && [1,2,13,14].includes(calculateCordinateSmallerY(y))){
            return false
        }else {return true}
    }

    sideoftheMap(x,y) {
        if ([0,15].includes(calculateCordinateSmallerX(x)) || [0,15].includes(calculateCordinateSmallerY(y))){
            return false
        }else {return true}
    }

    isSameTileType(x, y, type) {
        if (this.mapData[calculateCordinateSmallerY(y)][calculateCordinateSmallerX(x)] == type) {
            return false
        }
        else {return true}
    }

    reachAllWalkableTiles(pointer, follower) {
        this.crusorDown = true

        const result = this.getWalkableTiles(pointer.x, pointer.y, follower)
        const walkableTiles = result.walkable
        const mapData = result.mapData

        if (walkableTiles.length === 0) {
            return false
        }

        const reachable = this.floodFill(mapData)

        console.log("Reachable: " + reachable.size + ", Walkable: " + walkableTiles.length)
        return reachable.size === walkableTiles.length
    }

    getWalkableTiles(x, y, type) {
        const walkable = []
        const mapData = structuredClone(this.mapData)
        mapData[calculateCordinateSmallerY(y)][calculateCordinateSmallerX(x)] = type
        mapData.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile !== 1) {
                    walkable.push({ x, y })
                }
            })
        })
        return { walkable: walkable,
                 mapData: mapData
                }
    }

    floodFill(mapData) {
        const visited = new Set()
        const stack = [{ x: 1, y: 1 }]
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ]

        while (stack.length > 0) {
            const { x, y } = stack.shift()
            const key = `${x},${y}`

            if (visited.has(key)) continue
            if (x < 0 || x >= sizes.mapSize || y < 0 || y >= sizes.mapSize) continue
            if (mapData[y][x] === 1) continue

            visited.add(key)

            for (const dir of directions) {
                const newX = x + dir.x
                const newY = y + dir.y
                const newKey = `${newX},${newY}`

                if (visited.has(newKey)) continue
                if (newX < 0 || newX >= sizes.mapSize || newY < 0 || newY >= sizes.mapSize) continue
                if (mapData[newY][newX] === 1) continue
                stack.push({ x: newX, y: newY })
            }
        }
        
        return visited
    }

    canPlaceTile(pointer, type) {
        this.crusorDown = true
        if (this.cornerSpawn(pointer.x, pointer.y) === false) return false, this.showNotification("You can't place blocks in the corners!", 2000) 
        if (this.sideoftheMap(pointer.x, pointer.y) === false) return false, this.showNotification("You can't place blocks on the edges!", 2000)
        if (this.isSameTileType(pointer.x, pointer.y, type) === false) return false, this.showNotification("You can't place blocks of the same type!", 2000)
        if (type === 1) {
            if (this.reachAllWalkableTiles(pointer, type) !== true) return false, this.showNotification("You can't place blocks that would close off the map!", 2000)
        }
            return true
    }

    getORcreatedID() {
            let id = localStorage.getItem('browser_id')
    
            if (!id) {
                const fingerprint = navigator.userAgent + navigator.language + screen.width
                id = btoa(fingerprint).slice(0, 24)
                localStorage.setItem('browser_id', id) 
            }
            return id;
        }
    
    onSave(mapData, publish){
        this.game.renderer.snapshotArea(0, 50, 512, 512, (image) => {
            const mapString = JSON.stringify(mapData)
            const browser_id = this.getORcreatedID()

            if (this.allData[0] == undefined){
                fetch('https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/maps/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ browser_id: browser_id, map_json: mapString, published: publish, modified_date: new Date(), title: "teszt", picture: image.src })
                })
                .then(res => res.json())
                .then(data => console.log('Map Saved', data))
                .catch(err => console.error('Error:', err))
            }else{
                fetch('https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/maps', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: this.allData[0].id, browser_id: browser_id, map_json: mapString, published: publish, modified_date: new Date(), title: "teszt", picture: image.src })
                })
                .then(res => res.json())
                .then(data => console.log('Map Saved', data))
                .catch(err => console.error('Error:', err))
            }
        })
    }

    async onDelete(id){
        try{ 
            const response = await fetch(`https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/maps/${id}`, {
                    method: 'DELETE',
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')},
                    //body: JSON.stringify({ id: this.allData[0].id })
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = response.status === 204 ? {success: true} : await response.json()
                return data
        } catch (err) {
            console.error('Error:', err)
        }
    }

}