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
        this.playButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2, 'Start', 'PlayerSelectScene')
        this.editorButton = this.navigateButton(sizes.screenWidth/2, sizes.screenHeight/2 + 75, 'Editor', 'MapManagment')

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

    navigateButton(x, y, text, scene) {
        const bg = this.add.rectangle(0, 0, 200, 50, 0x929191, 1)
        const label = this.add.text(0, 0, text, {fill: '#0f0', fontSize: '24px'}).setOrigin(0.5)
        const button = this.add.container(x, y, [bg, label])
        
        button.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)

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