import './style.css'
import Phaser, { Physics } from 'phaser'



const sizes = {
  screenWidth:512,
  screenHeight:512,
  tileSize:32
}

const speedDown = 150;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
    this.bomb 
  }

  preload() {
    // Tile map
    this.load.spritesheet('tiles', 'assets/bomberman_tiles.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    })

    // Bomb sprite
    this.load.spritesheet('bomb', 'assets/bomb.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    })

    // Player sprite
    this.load.image('player', 'assets/player.png') 
  }
  create() {

    const mapData = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 2, 0, 1, 2, 2, 0, 2, 1, 0, 2, 0, 0, 1],
      [1, 0, 1, 0, 2, 0, 0, 2, 1, 0, 0, 2, 0, 1, 0, 1],
      [1, 2, 0, 2, 1, 2, 0, 1, 0, 2, 1, 2, 0, 2, 2, 1],
      [1, 0, 2, 1, 0, 0, 2, 0, 2, 0, 0, 1, 2, 0, 1, 1],
      [1, 1, 0, 2, 2, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 1],
      [1, 2, 0, 1, 0, 0, 2, 2, 2, 0, 2, 0, 1, 0, 2, 1],
      [1, 0, 2, 0, 2, 1, 0, 1, 0, 1, 2, 0, 0, 2, 0, 1],
      [1, 2, 1, 2, 0, 0, 2, 0, 2, 0, 0, 1, 0, 1, 2, 1],
      [1, 0, 0, 0, 1, 2, 0, 1, 0, 1, 2, 2, 2, 0, 0, 1],
      [1, 1, 2, 1, 0, 2, 2, 0, 2, 0, 0, 1, 0, 2, 1, 1],
      [1, 2, 0, 2, 1, 0, 1, 0, 1, 0, 1, 2, 2, 0, 2, 1],
      [1, 0, 2, 0, 0, 2, 0, 2, 0, 2, 0, 0, 1, 2, 0, 1],
      [1, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 0, 1, 0, 1],
      [1, 0, 0, 2, 0, 2, 0, 2, 1, 2, 0, 2, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]

    // Tile empty map
    const map = this.make.tilemap({
      tileWidth: sizes.tileSize,
      tileHeight: sizes.tileSize,
      width: 16,
      height: 16
    })

    const tileset = map.addTilesetImage('tiles', 'tiles')

    const bgLayer = map.createBlankLayer('bg', tileset)
    const blocklayer = map.createBlankLayer('block', tileset)

    mapData.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile !== 0) { blocklayer.putTileAt(tile, x, y) }
        else { bgLayer.putTileAt(0, x, y) }
      })
    })
    
    blocklayer.setCollision([1, 2])

    //player kezdő pozíciójának üres tile-ra helyezése
    const playerStartCorner = Math.floor(Math.random() * 4)
    let playerStartX
    let playerStartY

    switch (playerStartCorner) {
      case 0: // top-left
        playerStartX = 1 * sizes.tileSize
        playerStartY = 1 * sizes.tileSize
        break
      case 1: // top-right
        playerStartX = 14 * sizes.tileSize
        playerStartY = 1 * sizes.tileSize
        break
      case 2: // bottom-left
        playerStartX = 1 * sizes.tileSize
        playerStartY = 14 * sizes.tileSize
        break
      case 3: // bottom-right
        playerStartX = 14 * sizes.tileSize
        playerStartY = 14 * sizes.tileSize
        break 
    }

    //player létrehozása
    this.player = this.physics.add.image(playerStartX, playerStartY, 'player').setOrigin(0, 0)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)

    //player hitboxa a tile-ekhez igazítása
    this.player.body.setSize(20, 20)
    this.player.body.setOffset(6, 6)
    // player és tile-ek közötti ütközés
    this.player.body.setCircle(10)

    this.physics.add.collider(this.player, blocklayer)

    // player mozgatása billentyűkkel
    this.cursor = this.input.keyboard.createCursorKeys()
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
  }
  update() {

    const {left, right, up, down, space} = this.cursor

    if (this.cursor.space.isDown) {
      if (!this.bomb) {
        this.bomb = this.physics.add.sprite(this.player.x, this.player.y, 'bomb', 0).setOrigin(0, 0)
        this.bomb.body.allowGravity = false
        this.bomb.body.setImmovable(true)
        this.bomb.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.bomb)
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.bomb) {  
        this.bomb.destroy()
        this.bomb = null
      }
    }

    if (this.cursor.left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursor.right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
    } else {
        this.player.setVelocityX(0);
    }

    if (this.cursor.up.isDown) {
        this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursor.down.isDown) {
        this.player.setVelocityY(this.playerSpeed);
    } else {
        this.player.setVelocityY(0);
    }
  }
}

const config = {
  type:Phaser.WEBGL,
  width:sizes.screenWidth,
  height:sizes.screenHeight,
  canvas:gameCanvas,
  scene:[GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: speedDown },
      debug: true
    }
  },
  pixelArt:true
}

const game = new Phaser.Game(config)
