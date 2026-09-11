import Phaser from 'phaser';
import { sizes } from './gameScene';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameOverScene'})
    }

    preload() {}

    create() {
        this.add.rectangle(0, 0, sizes.screenWidth, sizes.screenHeight, 0x160d08, 1).setOrigin(0)
        this.add.text(sizes.screenWidth/2, sizes.screenHeight/2 - 100, 'Game Over', {fill: '#0f0', fontSize: '48px'}).setOrigin(0.5)
        this.navigateButton(sizes.screenWidth/2 - 75, sizes.screenHeight/2, 'Exit', 'LandScene')
        this.navigateButton(sizes.screenWidth/2 + 75, sizes.screenHeight/2, 'Restart', 'GameScene')
    }

    update() {}

    navigateButton(x, y, text, scene) {
            const bg = this.add.rectangle(0, 0, 100, 50, 0x929191, 1)
            const label = this.add.text(0, 0, text, {fill: '#0f0', fontSize: '20px'}).setOrigin(0.5)
            const button = this.add.container(x, y, [bg, label])
            
            button.setInteractive(new Phaser.Geom.Rectangle(-50, -25, 100, 50), Phaser.Geom.Rectangle.Contains)
    
            button.on('pointerover', () => {button.setScale(0.95)})
            button.on('pointerout', () => {button.setScale(1)})
            button.on('pointerdown', () => {if (scene === 'GameScene') {
                this.scene.switch(scene)
            } else {
                this.scene.switch(scene)
                this.scene.stop('GameScene')
            }})
        }
}