import Phaser from "phaser";
import { sizes } from "./gameScene";
import { LandScene } from "./landScene";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'MenuScene'})
    }

    preload() {
        
    }

    create() {
        this.menuBG = this.add.rectangle(sizes.screenWidth/2, sizes.screenHeight/2, 250, 200, 0x30303b, 1)
        this.buttonExit = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 + 15 , 'Exit','GameScene', false, false, 'LandScene')
        this.buttonResume = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 - 55, 'Resume', 'MenuScene', false, 'GameScene', false)
    }

    update() {
        console.log(this.scene.key())
    }

    navigateButton(x, y, text, stopScene, startScene, resumeScene, switchScene) {
        const bg = this.add.rectangle(0, 0, 200, 50, 0x929191, 1)
        const label = this.add.text(0, 0, text, {fill: '#0f0', fontSize: '24px'}).setOrigin(0.5)
        const button = this.add.container(x, y, [bg, label])
        
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)

        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', () => {if (stopScene != false){this.scene.stop(stopScene)}
                                        if (startScene != false){this.scene.start(startScene)}
                                        if (resumeScene != false){this.scene.run(resumeScene)}
                                        if (switchScene != false) {this.scene.switch(switchScene)}})
    }
}