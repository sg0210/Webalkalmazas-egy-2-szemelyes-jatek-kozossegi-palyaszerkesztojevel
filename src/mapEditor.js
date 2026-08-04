import Phaser from "phaser";
import { calculateCordinateX, calculateCordinateY, sizes } from "./gameScene";

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
        this.follower
        this.focus
        this.selectedBlock
        this.tileset
        this.bgLayer
        this.blocklayer
        this.map
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
        this.nondestroyableblock = this.add.image(sizes.screenWidth/2-sizes.tileSize, 25, "tiles", 1)
        this.destroyableblock = this.add.image(sizes.screenWidth/2+sizes.tileSize, 25, "tiles", 2)


        //Alap pélya létrehozása
        const mapData = [
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

        this.mapData = mapData

        const map = this.make.tilemap({
            tileHeight: sizes.tileSize,
            tileWidth: sizes.tileSize,
            width: sizes.mapSize,
            height:sizes.mapSize
        })

        this.map = map

        const tileset = map.addTilesetImage('tiles', 'tiles')
        this.tileset = tileset

        const bgLayer = map.createBlankLayer('bg', tileset, 0, sizes.hudHeight)
        const blocklayer = map.createBlankLayer('block', tileset, 0, sizes.hudHeight)
        this.bgLayer = bgLayer
        this.blocklayer = blocklayer


        mapData.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 1) {blocklayer.putTileAt(tile, x, y)}
                else if (tile === 2) {blocklayer.putTileAt(tile, x, y)}
                else {bgLayer.putTileAt(0, x, y)}
            })
        })

        blocklayer.setCollision([1])

        this.focus = this.add.graphics()
        this.selectedBlock = null

        //Pálya mentése
        const saveButton = this.add.text(sizes.screenWidth - 150, 10, '💾 Save Map', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        saveButton.setInteractive({useHandCursor: true})
        saveButton.on('pointerdown', () => {
            saveButton.setStyle({backgroundColor: "#555555"})
            this.exportMap()
            this.time.delayedCall(150, () => {
                saveButton.setStyle({backgroundColor: "#333333"})
            })
        })

        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    }

    update() {
        const pointer = this.input.activePointer

        //console.log(calculateCordinateX(pointer.x),calculateCordinateSmallerY(pointer.y))

        if(pointer.isDown){
            this.focus.lineStyle(4, 0xff0000, 1)

            if(calculateCordinateX(this.nondestroyableblock.x) === calculateCordinateX(pointer.x) && calculateCordinateY(this.nondestroyableblock.y) === calculateCordinateY(pointer.y)) {
                this.selectedBlock = this.nondestroyableblock
                this.follower = this.nondestroyableblock.frame.name
                console.log(this.follower)
            }
            else if(calculateCordinateX(this.destroyableblock.x) === calculateCordinateX(pointer.x) && calculateCordinateY(this.destroyableblock.y) === calculateCordinateY(pointer.y)) {
                this.selectedBlock = this.destroyableblock
                this.follower = this.destroyableblock.frame.name
                console.log(this.follower)
            }
        }

        if (pointer.isDown && this.follower && this.cornerSpawn(pointer.x,pointer.y) === true && this.sideoftheMap(pointer.x,pointer.y) === true) {
            if(pointer.y > sizes.hudHeight) {
                this.mapData[calculateCordinateSmallerX(pointer.x), calculateCordinateSmallerY(pointer.y)] = this.follower
                this.blocklayer.putTileAt(this.follower, calculateCordinateSmallerX(pointer.x), calculateCordinateSmallerY(pointer.y))
            }
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

    
}