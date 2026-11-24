import { getBrowserId, API_URL } from "./browserId"
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
        this.allData = undefined
        if (data.testMap) {
            this.mapData = data.testMap
            this.allData = data.mapData
        }else if (data.mapData === undefined || data.mapData === null ){
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

        //HUD és gombok
        this.load.image("editor_hud_bg", "assets/map_counter_bg.png")
        this.load.image("editor_button", "assets/button.png")
    }

    create() {

        //HUD háttér
        this.add.nineslice(0, 0, "editor_hud_bg", null, sizes.screenWidth, 50, 13, 13, 13, 13).setOrigin(0, 0)

        //Választható blockok (bal oldalon)
        const tileMargin = 10, tileGap = 10, tileY = 25
        const tileX = (i) => tileMargin + sizes.tileSize / 2 + i * (sizes.tileSize + tileGap)

        this.groundblock = this.createTileButton(tileX(0), tileY, 0)
        this.nondestroyableblock = this.createTileButton(tileX(1), tileY, 1)
        this.destroyableblock = this.createTileButton(tileX(2), tileY, 2)

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

        //Gombok (jobb oldalon)
        const buttonHeight = 38, buttonY = 25, margin = 10
        const saveWidth = 80, publishWidth = 100, deleteWidth = 90

        const saveX = sizes.screenWidth - margin - saveWidth / 2
        const publishX = saveX - saveWidth / 2 - margin - publishWidth / 2
        const deleteX = publishX - publishWidth / 2 - margin - deleteWidth / 2

        this.createButton(deleteX, buttonY, deleteWidth, buttonHeight, 'Delete', () => {
            this.onDelete(this.allData[0].id)
            this.scene.start('MapManagment')
        })

        this.createButton(publishX, buttonY, publishWidth, buttonHeight, 'Publish', () => {
            this.onSave(this.mapData, 1)
            this.scene.switch('MapManagment')
        })

        this.createButton(saveX, buttonY, saveWidth, buttonHeight, 'Save', () => {
            this.onSave(this.mapData, 0)
        })
        
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        this.keyV = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V)
    }

    update() {
        const pointer = this.input.activePointer

        if (Phaser.Input.Keyboard.JustDown(this.keyV)){
        }

        //console.log(calculateCordinateX(pointer.x),calculateCordinateSmallerY(pointer.y))

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
            this.scene.launch('MenuScene', this.data.mapData)
            this.registry.set('previousScene', 'MapEditor')
        }
    }

    createTileButton(x, y, frame) {
        const tile = this.add.sprite(x, y, "tiles", frame)
        tile.setInteractive({useHandCursor: true})

        tile.on('pointerover', () => tile.setScale(0.95))
        tile.on('pointerout', () => tile.setScale(1))
        tile.on('pointerdown', () => {
            this.selectedBlock = tile
            this.follower = frame
        })

        return tile
    }

    createButton(x, y, width, height, text, onClick) {
        const bg = this.add.nineslice(0, 0, "editor_button", null, width, height, 13, 13, 13, 13)
        const label = this.add.text(0, 0, text, {
            fontFamily: '"Arial Black"',
            fontSize: '16px',
            fill: '#f7f4df',
            stroke: '#14202a',
            strokeThickness: 4
        }).setOrigin(0.5)

        const button = this.add.container(x, y, [bg, label]).setSize(width, height)
        button.setInteractive({useHandCursor: true})

        button.on('pointerover', () => button.setScale(0.95))
        button.on('pointerout', () => button.setScale(1))
        button.on('pointerdown', onClick)

        return button
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
        if (this.cornerSpawn(pointer.x, pointer.y) === false) {
            this.showNotification("You can't place blocks in the corners!", 2000)
            return false
        }
        if (this.sideoftheMap(pointer.x, pointer.y) === false) {
            this.showNotification("You can't place blocks on the edges!", 2000)
            return false
        }
        if (this.isSameTileType(pointer.x, pointer.y, type) === false) {
            this.showNotification("You can't place blocks of the same type!", 2000)
            return false
        }
        if (type === 1) {
            if (this.reachAllWalkableTiles(pointer, type) !== true) {
                this.showNotification("You can't place blocks that would close off the map!", 2000)
                return false
            }
        }
            return true
    }

    
    onSave(mapData, publish){
        this.game.renderer.snapshotArea(0, 50, 512, 512, (image) => {
            const mapString = JSON.stringify(mapData)
            const browser_id = getBrowserId()

            if (this.allData[0] == undefined){
                fetch(`${API_URL}/maps/insert`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ browser_id: browser_id, map_json: mapString, published: publish, modified_date: new Date(), title: "teszt", picture: image.src })
                })
                .then(res => res.json())
                .then(data => console.log('Map Inserted', data), 
                this.time.delayedCall(1000, () => this.scene.start('MapManagment')))
                .catch(err => console.error('Error:', err))
            }else{
                fetch(`${API_URL}/maps/update`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: this.allData[0].id, browser_id: browser_id, map_json: mapString, published: publish, modified_date: new Date(), title: "teszt", picture: image.src })
                })
                .then(res => res.json())
                .then(data => console.log('Map Updated', data), this.scene.start('MapManagment'))
                .catch(err => console.error('Error:', err))
                }
            })
    }

    async onDelete(id){
        try{ 
            const response = await fetch(`${API_URL}/maps/${id}`, {
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