import Phaser from "phaser"
import { sizes } from "./gameScene"

export class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super({key: 'PlayerSelectScene'})
    }

    init(data){
        this.mapData = data.mapData
        this.mapId = data.mapId ?? null
    }

    preload(){
        this.load.image("player_select_bg", "assets/maps_bg.png")
        this.load.image("player_select_but", "assets/button.png")
    }

    create() {
        this.add.image(0, 0, "player_select_bg").setOrigin(0, 0)
        this.buttonPlayer1 = this.buttonBox(0 + 25, sizes.screenHeight / 2, '1 Player', 200, 200,  'GameScene', 1)
        this.buttonPlayer2 = this.buttonBox(sizes.screenWidth - 200 - 25, sizes.screenHeight / 2, '2 Players', 200, 200,  'GameScene', 2)

    }

    update() {

    }

    buttonBox(x, y, text, width, height, scene, numberOfPlayers) {
                const button = this.add.container(x, y - height / 2)
                const bg = this.add.nineslice(0, 0, "player_select_but", 0, width, height, 13, 13, 13, 13).setOrigin(0, 0)
                const label = this.add.text(0 + width / 2, 0 + height / 2, text, {fontFamily: '"Arial Black"', fill: '#f7f4df', fontSize: '32px', stroke: '#14202a',
        strokeThickness: 5}).setOrigin(0.5, 0.5)
                button.add([bg, label])
                
                button.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
        
                button.on('pointerover', () => {button.setScale(0.90)})
                button.on('pointerout', () => {button.setScale(1)})
                button.on('pointerdown', () => {this.scene.stop(this.scene.key)
                                                this.scene.start(scene, { numberOfPlayers: numberOfPlayers, mapData: this.mapData, mapId: this.mapId })})
                
                return button
    }
}
