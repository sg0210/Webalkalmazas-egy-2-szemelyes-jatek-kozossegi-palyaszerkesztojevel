import Phaser from "phaser";
import { sizes } from "./gameScene";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'MenuScene'})
    }

    preload() {
        this.load.image('bg', 'assets/Mainmenu_background.png')
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0).setScale(0.515, 0.525)
        this.playButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2, 'Start', 'GameScene')
        this.editorButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 + 75, 'Editor', 'MapEditor')
    }

    update() {
    }

    navigateButton(x, y, text, scene) {
        const bg = this.add.rectangle(0, 0, 200, 50, 0x929191, 1)
        const label = this.add.text(0, 0, text, {fill: '#0f0', fontSize: '24px'}).setOrigin(0.5)
        const button = this.add.container(x, y, [bg, label])
        
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)

        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', () => {this.scene.start(scene)})
    }
}