import Phaser from "phaser"
import { sizes } from "./gameScene"
import { getBrowserId, API_URL } from "./browserId"

//Pálya értékelő scene: 1-5 csillag, ranglista (ki nyert a legtöbbet), Play gomb
export class MapRatingScene extends Phaser.Scene {
    constructor() {
        super({key: 'MapRatingScene'})
    }

    init(data) {
        this.map = data.map
        this.myRating = null
        this.locked = true //amíg nem jön meg a szerver válasza, nem lehet kattintani
        this.stars = []
    }

    preload() {
        this.load.spritesheet("star", "assets/star.png", {frameWidth: 32, frameHeight: 32})
        this.load.image("rating_button", "assets/button.png")
        this.load.image("map_bg", "assets/maps_bg.png")
        this.load.image("map_header", "assets/maps_header.png")
    }

    create() {
        const centerX = sizes.screenWidth / 2
        this.browserId = getBrowserId()

        this.add.image(0, 0, "map_bg").setOrigin(0, 0)
        const header = this.add.image(0, 0, "map_header").setOrigin(0, 0)
        this.navigateButton(10 + 50, header.height / 2, 100, 38, 'Back', 16, () => this.scene.start('MapSelect'))
        this.add.text(centerX, header.height / 2, this.map.title, this.textStyle(20)).setOrigin(0.5)

        //Pálya előnézet
        if (this.map.picture && this.textures.exists(this.map.picture)) {
            this.add.rectangle(centerX, 135, 146, 146, 0x14202a).setStrokeStyle(2, 0xf7f4df, 0.4)
            this.add.image(centerX, 135, this.map.picture).setDisplaySize(140, 140)
        }

        //Átlag értékelés
        this.averageText = this.add.text(centerX, 225, 'Loading...', this.textStyle(16)).setOrigin(0.5)

        //Csillagok
        const spacing = 48
        for (let i = 0; i < 5; i++) {
            const star = this.add.image(centerX + (i - 2) * spacing, 263, "star", 0).setScale(1.25)
            star.setInteractive({useHandCursor: true})
            star.on('pointerover', () => this.highlightStars(i + 1, true))
            star.on('pointerout', () => this.highlightStars(this.myRating || 0))
            star.on('pointerdown', () => this.rate(i + 1))
            this.stars.push(star)
        }
        this.statusText = this.add.text(centerX, 298, '', this.textStyle(13)).setOrigin(0.5)

        //Ranglista
        this.leaderboard = this.add.container(0, 0)

        //Play gomb -> játékos választás ezzel a pályával
        this.navigateButton(centerX, 515, 180, 50, '▶  PLAY', 24, () => {
            this.scene.start('PlayerSelectScene', {mapData: this.map.map_json, mapId: this.map.id})
        })

        this.loadRating()
        this.loadLeaderboard()
    }

    textStyle(size) {
        return {fontFamily: '"Arial Black"', fill: '#f7f4df', fontSize: size + 'px', stroke: '#14202a', strokeThickness: 5}
    }

    //Csillagok kirajzolása: teli / hover / üres frame
    highlightStars(count, hover = false) {
        if (hover && this.locked) return
        this.stars.forEach((star, i) => {
            if (i < count) star.setFrame(hover ? 2 : 1)
            else star.setFrame(0)
        })
    }

    setAverage(average, count) {
        this.averageText.setText(count > 0 ? `Rating: ${Number(average).toFixed(1)} / 5  (${count} votes)` : 'No ratings yet')
    }

    setRated(rating) {
        this.myRating = rating
        this.locked = true
        this.stars.forEach(star => star.disableInteractive())
        this.highlightStars(rating)
        this.statusText.setText(`You rated this map: ${rating}/5`)
    }

    async loadRating() {
        try {
            const response = await fetch(`${API_URL}/maps/${this.map.id}/rating`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({browser_id: this.browserId})
            })
            const data = await response.json()
            if (!this.sys.isActive()) return

            this.setAverage(data.average, data.count)
            if (data.myRating) {
                this.setRated(data.myRating)
            } else {
                this.locked = false
                this.statusText.setText('Rate this map!')
            }
        } catch (err) {
            console.error('Error loading rating:', err)
            this.averageText.setText('Rating unavailable')
        }
    }

    async rate(value) {
        if (this.locked) return
        this.locked = true

        try {
            const response = await fetch(`${API_URL}/maps/${this.map.id}/rate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({browser_id: this.browserId, rating: value})
            })
            const data = await response.json()
            if (!this.sys.isActive()) return

            if (response.status === 409) {
                //Már értékelt (pl. másik fülön) -> frissítjük az állapotot
                this.loadRating()
                return
            }
            if (!response.ok) throw new Error(data.error)

            this.setAverage(data.average, data.count)
            this.setRated(data.myRating)
        } catch (err) {
            console.error('Error saving rating:', err)
            this.locked = false
            this.statusText.setText('Could not save rating, try again')
        }
    }

    async loadLeaderboard() {
        const x = 56, y = 322, width = sizes.screenWidth - 112, rowHeight = 22
        const panel = this.add.graphics()
        panel.fillStyle(0x14202a, 0.75).fillRoundedRect(x, y, width, 152, 8)
        panel.lineStyle(2, 0xf7f4df, 0.3).strokeRoundedRect(x, y, width, 152, 8)
        const title = this.add.text(x + width / 2, y + 16, 'MOST WINS', this.textStyle(15)).setOrigin(0.5)
        const headerStyle = {fontFamily: 'Arial', fontStyle: 'bold', fill: '#9fb3c4', fontSize: '13px'}
        const columns = [
            this.add.text(x + 20, y + 34, '#', headerStyle),
            this.add.text(x + 60, y + 34, 'Player', headerStyle),
            this.add.text(x + width - 20, y + 34, 'Wins', headerStyle).setOrigin(1, 0)
        ]
        this.leaderboard.add([panel, title, ...columns])

        try {
            const response = await fetch(`${API_URL}/maps/${this.map.id}/leaderboard`)
            const data = await response.json()
            if (!this.sys.isActive()) return

            const rows = data.leaderboard || []
            if (rows.length === 0) {
                this.leaderboard.add(this.add.text(x + width / 2, y + 92, 'No games played yet', {fontFamily: 'Arial', fill: '#f7f4df', fontSize: '14px'}).setOrigin(0.5))
                return
            }

            const medals = ['#ffd24a', '#d7dde3', '#d98a4a']
            rows.forEach((row, i) => {
                const rowY = y + 54 + i * rowHeight
                const style = {fontFamily: 'Arial', fontStyle: 'bold', fill: medals[i] || '#f7f4df', fontSize: '15px'}
                this.leaderboard.add([
                    this.add.text(x + 20, rowY, String(i + 1), style),
                    this.add.text(x + 60, rowY, row.winner, style),
                    this.add.text(x + width - 20, rowY, String(row.wins), style).setOrigin(1, 0)
                ])
            })
        } catch (err) {
            console.error('Error loading leaderboard:', err)
        }
    }

    navigateButton(x, y, width, height, text, fontSize, onClick) {
        const bg = this.add.nineslice(0, 0, "rating_button", null, width, height, 13, 13, 13, 13)
        const label = this.add.text(0, 0, text, this.textStyle(fontSize)).setOrigin(0.5).setShadow(2, 3, '#000000', 0, true, true)
        const button = this.add.container(x, y, [bg, label]).setSize(width, height).setDepth(10)

        button.setInteractive({useHandCursor: true})
        button.on('pointerover', () => {button.setScale(0.95)})
        button.on('pointerout', () => {button.setScale(1)})
        button.on('pointerdown', onClick)
        return button
    }
}
