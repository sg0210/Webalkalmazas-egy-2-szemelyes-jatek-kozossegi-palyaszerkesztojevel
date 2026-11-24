import { API_URL } from "./browserId"
import Phaser from "phaser"
import { sizes } from "./gameScene"

export class MapSelect extends Phaser.Scene {
    constructor(){
         super({key: 'MapSelect'})
         this.cardHeight = 205
         this.gap = 15
         this.columnNumber = 3
    }

    preload(){
        this.load.image("card", "assets/card.png")
        this.load.image("card_plus", "assets/card_plus.png")
        this.load.image("back", "assets/button.png")
        this.load.image("counter", "assets/map_counter_bg.png")
        this.load.image("map_bg", "assets/maps_bg.png")
        this.load.image("map_header", "assets/maps_header.png")
        
    }

    async create(){

        const response = await fetch(`${API_URL}/maps/published`, {
            method: 'GET'
        })

        const data = await response.json()

        const maps = data.maps

        const hud = this.add.layer().setDepth(10)
        this.header = this.add.image(0, 0, "map_header").setOrigin(0, 0)
        this.bg = this.add.image(0, 0, "map_bg").setOrigin(0, 0)
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

        this.load.once('complete', () => {
            maps.forEach((map, i) => {
                const card = this.createCard(map, i, this.cardHeight)
                this.list.add(card)
            })
        })
        this.load.start()
       

        //scrolling
        
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const minY = ((this.cardHeight + this.gap) * Math.ceil(maps.length / 4) + this.gap - this.scale.height + 50)
            if ((this.cardHeight + this.gap) * Math.ceil(maps.length / 4) + this.gap < this.scale.height - 50) return
            this.list.y = Phaser.Math.Clamp(this.list.y - deltaY * 0.3, -minY, 0)
        });

        console.log(this.list)
    }    

    update(){}

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
        const yseperator = (height + this.gap * 2) * row

        const card = this.add.container(this.gap + xseperator, (this.gap + this.header.height) + yseperator).setSize(this.cardWidth, height)
        const bg = this.add.image(0, 0, "card", 0).setOrigin(0, 0)
        const picture = this.add.image((bg.width - 100) / 2, 31, map.picture).setDisplaySize(100, 100).setOrigin(0, 0)
        const title = this.add.text(bg.width / 2, picture.y + 123, map.title).setOrigin(0.5, 0)
        const id = this.add.text(21, 25, map.id).setOrigin(0.5, 0.5)
        const playButton = this.buttonDesign(((bg.width - (bg.width - 40)) / 2), title.y + title.height + 13, bg.width - 40)
        playButton.on('pointerover', () => {playButton.setScale(0.95)})
        playButton.on('pointerout', () => {playButton.setScale(1)})
        playButton.on('pointerdown', () => this.onPlay(map))

        card.add([picture, bg, title, id, playButton])
        return card
    }

    buttonDesign(x, y, btWidht){
        const btHeigth = 20
        const buttonContainer = this.add.container(x + btWidht / 2, y + btHeigth / 2)
        const bg = this.add.rectangle(0, 0, btWidht, 20, 0x3498db).setRounded(2.5)
        const buttonText = this.add.text(0, 0, 'Play', {
            fontSize: '16px',
            fill: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add([bg, buttonText])
        buttonContainer.setSize(btWidht, 20)
        buttonContainer.setInteractive({useHandCrusor: true})
        return buttonContainer
    }

    async onPlay(map){
        this.scene.start('MapRatingScene', {map})
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