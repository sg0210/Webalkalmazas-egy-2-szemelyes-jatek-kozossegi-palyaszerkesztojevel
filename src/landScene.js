import Phaser from "phaser";
import { sizes } from "./gameScene";



export class LandScene extends Phaser.Scene {
    constructor() {
        super({key: 'LandScene'})
    }

    preload() {
        this.load.image('bg', 'assets/Mainmenu_background.png')
    }

    create() {
        this.add.image(0, 0, 'bg').setOrigin(0).setDisplaySize(sizes.screenWidth, sizes.screenHeight)
        this.playButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 - 45, 175, 50, '▶  START', 'MapSelect', '0x15C936', '0x087C22')
        this.editorButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 + 25, 175, 50, '⚒  EDITOR', 'MapManagment', '0x079EE5', '0x05689C')

        fetch('https://refactored-spoon-g4x794pgg4pvfprp-3000.app.github.dev/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ browser_id: this.getORcreatedID() })
        })
        .then(res => res.json())
        .then(data => console.log('Player Saved:', data))
        .catch(err => console.error('Error:', err))

    }

    update() {
    }

    navigateButton(x, y, width, heigth, text, scene, mainColor, darkColor) {
        const button = this.add.container(x, y)
        const bg = this.add.graphics()
        bg.clear()
        bg.fillStyle(0x071018).fillRoundedRect(
            -width / 2 - 4,
            -heigth / 2 + 3,
            width + 8,
            heigth + 6,
            8
        )

        bg.fillStyle(0x263746).fillRoundedRect(
            -width / 2 - 3,
            -heigth / 2 - 3,
            width + 6,
            heigth + 6,
            7
        )
        
        bg.fillGradientStyle(mainColor, mainColor, darkColor, darkColor).fillRoundedRect(
            -width / 2,
            -heigth / 2,
            width,
            heigth,
            6
        )
        
        bg.lineStyle(2, 0xffffff, 0.25).strokeRoundedRect(
            -width / 2,
            -heigth / 2,
            width,
            heigth,
            4
        )

        const label = this.add.text(0, 0, text, {fontFamily: '"Arial Black"', fill: '#f7f4df', fontSize: '24px', stroke: '#14202a',
        strokeThickness: 5}).setOrigin(0.5).setShadow(2, 3, 'x000000', 0, true, true)
        button.add([bg, label]).setSize(width, heigth)
        
        button.setInteractive({useHandCursor: true})

        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', () => {this.scene.start(scene)})
    }

    getORcreatedID() {
        let id = localStorage.getItem('browser_id')

        if (!id) {
            const fingerprint = navigator.userAgent + navigator.language + screen.width
            id = btoa(fingerprint).slice(0, 24)
            localStorage.setItem('browser_id', id) 
        }
        return id;
    }

}