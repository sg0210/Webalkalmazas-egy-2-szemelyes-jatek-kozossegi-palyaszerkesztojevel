import Phaser from "phaser"
import { LandScene } from "./landScene"

export class MapManagment extends Phaser.Scene {
    constructor(){
         super({key: 'MapManagment'})
         this.cardHeight = 135
         this.cardWidth = 100
         this.gap = 15
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

        const header = this.add.rectangle(0, 0, this.scale.width, 50, 0x2c3e50).setOrigin(0, 0)
        header.setDepth(10)

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
            const card = this.createCard(map, i, this.cardWidth, this.cardHeight)
            this.list.add(card)
        })


        this.load.once('complete', () => {
            maps.forEach((map, i) => {
                const card = this.createCard(map, i, this.cardWidth, this.cardHeight)
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

    }    

    update(){

    }

    createCard(map, i, width, height){
        let row = 0
        let column = 0
        const gap = this.gap
        
        if (i % 4 === 0){
            row = i / 4
        }else { 
            row = parseInt(i / 4)
        }

        column = (i % 4)

        const xseperator = (width + gap) * column
        const yseperator = (height + gap) * row

        const card = this.add.container(10 + xseperator, 15 +yseperator)
        const bg = this.add.rectangle(10, 50 , width, height, 0x2c3e50).setOrigin(0, 0)
        const picture = this.add.image(15, 55 , map.picture).setDisplaySize(90, 90).setOrigin(0, 0)
        const title = this.add.text(15, 145 , map.title).setOrigin(0, 0)
        const id = this.add.text(title.width + 35, 145 , map.id).setOrigin(0, 0)
        const editButton = this.buttonDesign(15, 155)
        editButton.setInteractive(new Phaser.Geom.Rectangle(25, 10, 50, 20), Phaser.Geom.Rectangle.Contains)
        editButton.on('pointerdown', () => this.onEdit(map.id))

        card.add([bg, picture, title, id, editButton])
        card.setSize(width, height)
        return card
    }

    buttonDesign(x, y){
        const buttonContainer = this.add.container(x, y + 5)
        const bg = this.add.rectangle(0, 0, 50, 20, 0x3498db).setOrigin(0, 0)
        const buttonText = this.add.text(0, 0, 'Edit', {
            fontSize: '16px',
            fill: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0, 0).setPadding(5, 2, 5, 2);
        buttonContainer.setSize(50, 20)

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