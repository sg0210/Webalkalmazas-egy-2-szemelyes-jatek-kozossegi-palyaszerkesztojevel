import Phaser from "phaser"
import { LandScene } from "./landScene"
import { sizes } from "./gameScene"

export class MapManagment extends Phaser.Scene {
    constructor(){
         super({key: 'MapManagment'})
         this.cardHeight = 150
         this.cardWidth
         this.gap = 15
         this.columnNumber = 3
    }

    preload(){
        
        
    }

    async create(){

        const browser_id = localStorage.getItem('browser_id')
        const response = await fetch('https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/maps/get', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ browser_id: browser_id})
        })

        const data = await response.json()

        const maps = data.maps
        console.log(maps)

        this.header = this.add.rectangle(0, 0, this.scale.width, 50, 0x2c3e50).setOrigin(0, 0)
        this.header.setDepth(10)

        const backButton = this.add.text(10, 10, "Back", {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        backButton.setDepth(11)
        backButton.setInteractive({useHandCrusor: true})
        backButton.on('pointerdown', () => {
            this.scene.switch('LandScene')
        })

        if (this.list) {
            this.list.destroy()
        }

        this.list = this.add.container(0, 0)
        this.list.setDepth(1)

        const v = Date.now()

        maps.forEach(map => {
            if (!map.picture) return
            if (this.textures.exists(map.picture)) this.textures.remove(map.picture)
                this.load.image(map.picture, 'src/pictures/' + map.picture + '?v=' + v)
                console.log('Loading image:', map.picture)
        })

        maps.forEach((map, i) => {
            const card = this.createCard(map, i, this.cardHeight)
            this.list.add(card)
        })

        const newCard = this.createCardNew(this.cardHeight)
        this.list.add(newCard)

        //scrolling
        
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const minY = ((this.cardHeight + this.gap) * Math.ceil(maps.length / this.columnNumber) + this.gap - this.scale.height + 50)
            if ((this.cardHeight + this.gap) * Math.ceil(maps.length / this.columnNumber) + this.gap < this.scale.height - 50) return
            this.list.y = Phaser.Math.Clamp(this.list.y - deltaY * 0.3, -minY, 0)
        });

    }    

    update(){
    }

    createCardNew(height){
        let orderNumber = this.list.length
        let column = orderNumber % this.columnNumber
        let row = 0

        if (orderNumber % this.columnNumber === 0){
            row = orderNumber / this.columnNumber
        }else { 
            row = parseInt(orderNumber / this.columnNumber)
        }

        const xseperator = (this.cardWidth + this.gap) * column
        const yseperator = (height + this.gap) * row

        const card = this.add.container(this.gap + xseperator, (this.gap + this.header.height) + yseperator).setSize(this.cardWidth, height)
        const bg = this.add.rectangle(0, 0, this.cardWidth, height, 0x2c3e50).setOrigin(0, 0)
        const plus = this.add.text(bg.width / 2, bg.height / 2, "+").setOrigin(0.5, 0.5)
        const title = this.add.text(bg.width / 2, bg.height / 2 + 10, "New Map").setOrigin(0.5, 0.5)
        card.add([bg, plus, title])
        card.setInteractive({useHandCursor: true})
        .on('pointerdown', () => this.scene.start('MapEditor'))
        return card
    }

    createCard(map, i, height){
        this.cardWidth = (sizes.screenWidth - ((this.columnNumber + 1) * this.gap)) / this.columnNumber
        let row = 0
        let column = 0
        
        if (i % this.columnNumber === 0){
            row = i / this.columnNumber
        }else { 
            row = parseInt(i / this.columnNumber)
        }

        column = (i % this.columnNumber)

        const xseperator = (this.cardWidth + this.gap) * column
        const yseperator = (height + this.gap) * row

        const card = this.add.container(this.gap + xseperator, (this.gap + this.header.height) + yseperator).setSize(this.cardWidth, height)
        const bg = this.add.rectangle(0, 0, this.cardWidth, height, 0x2c3e50).setOrigin(0, 0)
        const picture = this.add.image((bg.width - 90) / 2, 10, map.picture).setDisplaySize(90, 90).setOrigin(0, 0).setDepth(5)
        const title = this.add.text(bg.width / 2, picture.y + 90 + 3, map.title).setOrigin(0.5, 0).setDepth(10)
        const id = this.add.text(0, 0, map.id)
        const editButton = this.buttonDesign(10, title.y + title.height + 6, bg.width)
        editButton.setInteractive(new Phaser.Geom.Rectangle(25, 10, 50, 20), Phaser.Geom.Rectangle.Contains)
        editButton.on('pointerdown', () => this.onEdit(map.id))

        card.add([bg, picture, title, id, editButton])
        return card
    }

    buttonDesign(x, y, width){
        const btWidht = width - 20
        const buttonContainer = this.add.container(x, y)
        const bg = this.add.rectangle(0, 0, btWidht, 20, 0x3498db).setOrigin(0, 0).setRounded(2.5)
        const buttonText = this.add.text(bg.width / 2, bg.height / 2, 'Edit', {
            fontSize: '16px',
            fill: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0.5).setPadding(5, 2, 5, 2);
        buttonContainer.setSize(btWidht, 20)

        buttonContainer.add([bg, buttonText])
        return buttonContainer
    }

    async onEdit(mapID){

        const response = await fetch('https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/map/get', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ map_id: mapID})
        })
        
        const data = await response.json()

        console.log(JSON.parse(data.maps[0].map_json))
        const mapData = data.maps

        this.scene.start('MapEditor', { mapData })
    }

}