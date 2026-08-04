import Phaser from "phaser"
import { sizes } from "./gameScene"

export class PlayerSelectScene extends Phaser.Scene {
    constructor() {
        super({key: 'PlayerSelectScene'})
    }

    preload(){}

    create() {
        this.add.rectangle(0, 0, sizes.screenWidth, sizes.screenHeight, 0x30303b, 1).setOrigin(0)
        this.buttonPlayer1 = this.buttonBox(sizes.screenWidth/2-110, sizes.screenHeight/2, '1 Player', 'GameScene', 1)
        this.buttonPlayer2 = this.buttonBox(sizes.screenWidth/2+110, sizes.screenHeight/2, '2 Players', 'GameScene', 2)

    }

    update() {

    }

    buttonBox(x, y, text, scene, numberOfPlayers) {
        const bg = this.add.rectangle(0, 0, 200, 200, 0x929191, 1)
                const label = this.add.text(0, 0, text, {fill: 'rgb(0, 110, 255)', fontSize: '24px'}).setOrigin(0.5)
                const button = this.add.container(x, y, [bg, label])
                
                button.setInteractive(new Phaser.Geom.Rectangle(-100, -100, 200, 200), Phaser.Geom.Rectangle.Contains)
        
                button.on('pointerover', () => {button.setScale(0.90)})
                button.on('pointerout', () => {button.setScale(1)})
                button.on('pointerdown', () => {this.registry.set('numberOfPlayers', numberOfPlayers)
                                                this.scene.stop(this.scene.key)
                                                this.scene.start(scene)})
    }
}
