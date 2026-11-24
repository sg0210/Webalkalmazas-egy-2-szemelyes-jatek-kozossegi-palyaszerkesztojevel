import Phaser from 'phaser';
import { sizes } from './gameScene';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameOverScene'})
    }

    preload() {
        this.load.image("game_over_bg", "assets/maps_bg.png")
        this.load.image("game_over_button", "assets/button.png")
    }

    create() {
        this.add.image(0, 0, "game_over_bg").setOrigin(0, 0)
        this.add.text(sizes.screenWidth/2, sizes.screenHeight/2 - 100, 'Game Over', {
            fontFamily: '"Arial Black"',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5)
        this.navigateButton(sizes.screenWidth/2 - 75, sizes.screenHeight/2, 'Exit', 'LandScene')
        this.navigateButton(sizes.screenWidth/2 + 75, sizes.screenHeight/2, 'Restart', 'GameScene')
    }

    update() {}

    navigateButton(x, y, text, scene) {
            const width = 120, height = 45
            const bg = this.add.nineslice(0, 0, "game_over_button", null, width, height, 13, 13, 13, 13)
            const label = this.add.text(0, 0, text, {
                fontFamily: '"Arial Black"',
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5)
            const button = this.add.container(x, y, [bg, label]).setSize(width, height)
            
            button.setInteractive({useHandCursor: true})
    
            button.on('pointerover', () => {button.setScale(0.95)})
            button.on('pointerout', () => {button.setScale(1)})
            button.on('pointerdown', () => {
                const editorTest = this.scene.get('GameScene').editorTest
                if (scene === 'GameScene') {
                    this.scene.start(scene)
                } else if (editorTest) {
                    //Teszt játékból vissza a szerkesztőbe ugyanazzal a pályával
                    this.scene.stop('GameScene')
                    this.scene.start('MapEditor', { testMap: editorTest.map, mapData: editorTest.allData })
                } else {
                    this.scene.start(scene)
                    this.scene.stop('GameScene')
                }
            })
        }
}