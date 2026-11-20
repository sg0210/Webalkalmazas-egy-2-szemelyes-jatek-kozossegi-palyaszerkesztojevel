import Phaser from "phaser"
import { LandScene } from "./landScene"
import { sizes } from "./gameScene"

export class MapManagment extends Phaser.Scene {
    constructor(){
         super({key: 'MapManagment'})
         this.cardHeight = 205
         this.cardWidth
         this.gap = 15
         this.columnNumber = 3
    }

    preload(){
        this.load.image("card", "assets/card.png")
        this.load.image("card_plus", "assets/card_plus.png")
        this.load.image("back", "assets/button.png")
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

        const hud = this.add.layer().setDepth(10)
        this.header = this.add.rectangle(0, 0, this.scale.width, 50, 0x2c3e50).setOrigin(0, 0)
        this.backButton = this.mainButtonDesign(10, (this.header.height - 38) / 2, 100, 38, "Back", "LandScene")
        hud.add([this.header, this.backButton])

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
        console.log(parseInt((sizes.screenWidth - ((4 + 1) * this.gap)) / 4))
        console.log(parseInt((sizes.screenWidth - ((3 + 1) * this.gap)) / 3))
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

        const card = this.add.image(this.gap + xseperator + this.cardWidth / 2, (this.gap + this.header.height) + yseperator + height / 2 + 7, "card_plus", 0)
        card.setInteractive({useHandCursor: true})
        card.on('pointerover', () => {card.setScale(0.95)})
        card.on('pointerout', () => {card.setScale(1)})
        card.on('pointerdown', () => this.scene.start('MapEditor'))
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
        const bg = this.add.image(0, 0, "card", 0).setOrigin(0, 0)
        const picture = this.add.image((bg.width - 100) / 2, 31, map.picture).setDisplaySize(100, 100).setOrigin(0, 0)
        const title = this.add.text(bg.width / 2, picture.y + 123, map.title).setOrigin(0.5, 0)
        const id = this.add.text(21, 25, map.id).setOrigin(0.5, 0.5)
        const editButton = this.buttonDesign(((bg.width - (bg.width - 40)) / 2), title.y + title.height + 13, bg.width - 40)
        editButton.on('pointerover', () => {editButton.setScale(0.95)})
        editButton.on('pointerout', () => {editButton.setScale(1)})
        editButton.on('pointerdown', () => this.onEdit(map.id))

        card.add([picture, bg, title, id, editButton])
        return card
    }

    buttonDesign(x, y, btWidht){
        const btHeigth = 20
        const buttonContainer = this.add.container(x + btWidht / 2, y + btHeigth / 2)
        const bg = this.add.rectangle(0, 0, btWidht, 20, 0x3498db).setRounded(2.5)
        const buttonText = this.add.text(0, 0, 'Edit', {
            fontSize: '16px',
            fill: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add([bg, buttonText])
        buttonContainer.setSize(btWidht, 20)
        buttonContainer.setInteractive({useHandCrusor: true})
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

    mainButtonDesign(x, y, width, heigth, text, scene) {
        const button = this.add.container(x + width / 2, y + heigth / 2)
        const bg = this.add.image(0, 0, "back")
        const label = this.add.text(0, 0, text, {fontFamily: '"Arial Black"', fill: '#f7f4df', fontSize: '14px', stroke: '#14202a',
        strokeThickness: 5}).setOrigin(0.5).setShadow(2, 3, 'x000000', 0, true, true)
        button.add([bg, label]).setSize(width, heigth)
        
        button.setInteractive({useHandCursor: true})

        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', () => {this.scene.start(scene)})

        return button
    }

}