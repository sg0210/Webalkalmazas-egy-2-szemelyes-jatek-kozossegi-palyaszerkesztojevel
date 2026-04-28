import './style.css'
import Phaser, { Physics } from 'phaser'



const sizes = {
  screenWidth:512,
  screenHeight:512,
  tileSize:32,
  mapSize:16
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
    this.load.spritesheet('player', 'assets/player_movement.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    }) 
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
      width: sizes.mapSize,
      height: sizes.mapSize
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
        playerStartX = (sizes.mapSize-2) * sizes.tileSize
        playerStartY = 1 * sizes.tileSize
        break
      case 2: // bottom-left
        playerStartX = 1 * sizes.tileSize
        playerStartY = (sizes.mapSize-2) * sizes.tileSize
        break
      case 3: // bottom-right
        playerStartX = (sizes.mapSize-2) * sizes.tileSize
        playerStartY = (sizes.mapSize-2) * sizes.tileSize
        break 
    }

    //player mozgás animáció
    const walkUp = {
      key:"walkUp",
      frames: this.anims.generateFrameNumbers("player", {frames:[0,1,2,3]}),
      frameRate:8,
      repeat:-1
    }

    const walkDown = {
      key:"walkDown",
      frames: this.anims.generateFrameNumbers("player", {frames:[4,5,6,7]}),
      frameRate:8,
      repeat:-1
    }

    const walkLeft = {
      key:"walkLeft",
      frames: this.anims.generateFrameNumbers("player", {frames:[8,9,10,11]}),
      frameRate:8,
      repeat:-1
    }

    const walkRight = {
      key:"walkRight",
      frames: this.anims.generateFrameNumbers("player", {frames:[12,13,14,15]}),
      frameRate:8,
      repeat:-1
    }

    this.anims.create(walkUp)
    this.anims.create(walkDown)
    this.anims.create(walkLeft)
    this.anims.create(walkRight)

    this.scoreText = this.add.text(10, 10, "cordinate x: 0 y: 0", { font: "16px Arial", fill: "#ffffff" })

    //player létrehozása
    this.player = this.physics.add.sprite(playerStartX, playerStartY, 'player', 0).setOrigin(0, 0)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)

    //player hitbox a tile-okhoz igazítása
    this.player.body.setSize(30, 30)
    this.player.body.setOffset(1, 1)
    
    // player és tile-ek közötti ütközés
    this.player.body.setCircle(15)
    this.physics.add.collider(this.player, blocklayer)

    // player mozgatása billentyűkkel
    this.cursor = this.input.keyboard.createCursorKeys()
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
  }
  update() {

    this.scoreText.setText(`cordinate x: ${Math.round(this.player.x/32)} y: ${Math.round(this.player.y/32)}`)

    const {left, right, up, down, space} = this.cursor

    if (this.cursor.space.isDown) {
      if (!this.bomb) {
        this.bomb = this.physics.add.sprite((this.player.x / sizes.tileSize)*sizes.tileSize, (this.player.y / sizes.tileSize)*sizes.tileSize, 'bomb', 0).setOrigin(0, 0)
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
      this.player.anims.play("walkLeft", true);
      this.player.setVelocityX(-this.playerSpeed);  
    } else if (this.cursor.right.isDown) {
      this.player.anims.play("walkRight", true);
      this.player.setVelocityX(this.playerSpeed);
    } else {
        this.player.setVelocityX(0);
        this.player.anims.stop();
    }

    if (this.cursor.up.isDown) {
        this.player.setVelocityY(-this.playerSpeed);
        this.player.anims.play("walkUp", true);
    } else if (this.cursor.down.isDown) {
        this.player.setVelocityY(this.playerSpeed);
        this.player.anims.play("walkDown", true);
    } else {
        this.player.setVelocityY(0);
        this.player.anims.stop();
    }
  }
}

const gameCanvas = document.getElementById('gameCanvas')

const config = {
  type:Phaser.WEBGL,
  width: sizes.screenWidth,
  height: sizes.screenHeight,
  canvas: gameCanvas,
  scene: [GameScene],
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
