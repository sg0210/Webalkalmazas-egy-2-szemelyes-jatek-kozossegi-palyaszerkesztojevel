import Phaser from "phaser";
import { sizes } from "./gameScene";
import { LandScene } from "./landScene";

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'MenuScene'})
    }

    init(data){
        this.mapData = data.mapData
    }

    preload() {
        this.load.image("button_bg", "assets/button.png")
        this.load.image("menu_bg", "assets/map_counter_bg.png")
        
    }

    create() {
        const previousScene = this.registry.get('previousScene')
        const w = 220, h = 190, butH = 50, defaultY = -(h / 2) + butH / 2
        
        this.menu = this.add.container(sizes.screenWidth/2, sizes.screenHeight/2)

        this.menuBG = this.add.nineslice(0, 0, "menu_bg", null, 220, 220, 13, 13, 13, 13)
        this.buttonResume = this.navigateButton(0, defaultY + 10, butH, 'Resume', () => {
            this.scene.stop()
            this.scene.run(previousScene)
        })
        this.buttonExit = this.navigateButton(0, defaultY + h - butH - 10, butH, 'Exit', () => this.exit(previousScene))
        this.menu.setSize(this.menuBG.width, this.menuBG.height)
        this.menu.add([this.menuBG, this.buttonResume, this.buttonExit])
        
    
        if (previousScene === 'GameScene'){
            this.buttonRestart = this.navigateButton(0, this.buttonResume.y + this.buttonResume.height + 10, butH, 'Restart', () => {
                this.scene.start('GameScene')
            })
            this.menu.add([this.buttonRestart])
        }
        if (previousScene === 'MapEditor'){
            this.buttonTest = this.navigateButton(0, this.buttonResume.y + this.buttonResume.height + 10, butH, 'Test', () => this.testMap())
            this.menu.add([this.buttonTest])
        }
        console.log(this.registry.get('previousScene'))
    }

    update() {
    }

    navigateButton(x, y, height, text, onClick) {
        const bg = this.add.nineslice(0, 0, "button_bg", null, 180, height, 13, 13, 13, 13)
        const label = this.add.text(0, 0, text, {fontFamily: '"Arial Black"', fill: '#f7f4df', fontSize: '20px', stroke: '#14202a',
        strokeThickness: 5}).setOrigin(0.5)
        const button = this.add.container(x, y, [bg, label]).setSize(bg.width, bg.height)
        
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, 180, height), Phaser.Geom.Rectangle.Contains)

        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', onClick)

        return button
    }

    testMap() {
        const editor = this.scene.get('MapEditor')
        const editorTest = {
            map: structuredClone(editor.mapData),
            allData: editor.allData
        }
        this.scene.stop('MapEditor')
        this.scene.start('GameScene', {
            numberOfPlayers: 1,
            mapData: JSON.stringify(editorTest.map),
            editorTest: editorTest
        })
    }

    exit(previousScene) {
        const editorTest = previousScene === 'GameScene' ? this.scene.get('GameScene').editorTest : null
        this.scene.stop(previousScene)
        if (editorTest) {
            //Teszt játékból vissza a szerkesztőbe ugyanazzal a pályával
            this.scene.start('MapEditor', { testMap: editorTest.map, mapData: editorTest.allData })
        } else {
            this.scene.start('LandScene')
        }
    }
}
