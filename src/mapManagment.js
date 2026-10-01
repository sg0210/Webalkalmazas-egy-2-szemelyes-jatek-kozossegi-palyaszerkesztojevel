import Phaser from "phaser"
import { LandScene } from "./landScene"

export class MapManagment extends Phaser.Scene {
    constructor(){
         super({key: 'MapManagment'})
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

        const backButton = this.add.text(10, 10, "Back", {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })

        backButton.setInteractive({useHandCrusor: true})
        backButton.on('pointerdown', () => {
            this.scene.switch('LandScene')
        })


        maps.forEach((map, index) => {
            this.cardDesign(map, index, 100, 135)
        })

    }    

    update(){

    }

    cardDesign(map, i, widht, height){
        let row = 0
        let column = 0
        const gap = 15
        
        if (i % 4 === 0){
            row = i / 4
        }else { 
            row = parseInt(i / 4)
        }

        column = (i % 4)

        const xseperator = (widht + gap) * column
        const yseperator = (height + gap) * row

        const card = this.add.container(10 + xseperator, 50 + yseperator)
        const bg = this.add.rectangle(10, 50 , widht, height, 0x2c3e50).setOrigin(0, 0)
        const picture = this.add.image(15, 55 , map.picture).setDisplaySize(90, 90).setOrigin(0, 0)
        const title = this.add.text(15, 145 , map.title).setOrigin(0, 0)
        const editButton = this.buttonDesign(15, 155)
        editButton.setInteractive(new Phaser.Geom.Rectangle(25, 10, 50, 20), Phaser.Geom.Rectangle.Contains)
        editButton.on('pointerdown', () => this.onEdit(map.id))

        card.add([bg, picture, title, editButton])
        card.setSize(widht, height)
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