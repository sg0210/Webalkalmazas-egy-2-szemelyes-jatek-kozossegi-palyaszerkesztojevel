import Phaser from "phaser";

export const sizes = {
        screenWidth:512,
        screenHeight:512 + 50,
        tileSize:32,
        mapSize:16,
        explosionSize:4,
        hudHeight:50
    }

export const speedDown = 150

export function calculateCordinateX(x) {
    return Math.round(x / sizes.tileSize)
  }

export function calculateCordinateY(y) {
    return Math.round((y - sizes.hudHeight) / sizes.tileSize)
  }

export function calculateCordinateXpx(x) {
    return x * sizes.tileSize
  }
    
export function calculateCordinateYpx(y) {
    return y * sizes.tileSize + sizes.hudHeight
  }

 export class GameScene extends Phaser.Scene {
  constructor() {
    super({key: 'GameScene'})
    /*this.players.first.skin
    this.players.first.skin
    this.players.first.bomb = undefined
    this.bombSecondPlayer = undefined
    this.players.first.hp
    this.players.first.hit
    this.players.first.bombs
    this.players.first.HUD.bombHUD.fill
    this.players.first.HUD.bombHUD.empty
    this.players.first.hp
    this.players.second.hit
    this.playerSecondBombs
    this.playerSecondBombGroup
    this.playerSecondEmptyBombs*/
    this.players = {
      first: {
        number: 1,
        skin: undefined,
        hp: 3,
        hit: false,
        bombs: 3,
        bomb: undefined,
        HUD: {
          bombHUD: {},
          hpHUD: {}
        },
        isExplosionPlaying: false
      },
      second: {
        number: 2,
        skin: undefined,
        hp: 3,
        hit: false,
        bombs: 3,
        bomb: undefined,
        HUD: {
          bombHUD: {},
          hpHUD: {}
        },
        isExplosionPlaying: false
      }
    }
    this.playerSpeed = speedDown + 50
    this.destroyableBlocks
    this.explosion
    this.cursor
    this.powerUps
    this.dropChance = 0.3
    this.powerUpOne = 0.7
    this.powerUpTwo = 0.25
    this.powerUpThree = 0.05
    this.maxBombNumber = 3
    this.extraBombNumber = 2
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
      frameHeight: sizes.tileSize,
    })

    //Robbanás effect
    this.load.spritesheet('explosion', 'assets/explosion_animation.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    })

    this.load.spritesheet('hp', 'assets/hp.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    })
    
    this.load.spritesheet('bomb_hp', 'assets/bombs.png', {
      frameWidth: sizes.tileSize,
      frameHeight: sizes.tileSize
    })

    this.load.spritesheet('bomb_powerup', 'assets/bomb_powerup.png', {
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

    this.mapData = mapData

    // Tile empty map
    const map = this.make.tilemap({
      tileWidth: sizes.tileSize,
      tileHeight: sizes.tileSize,
      width: sizes.mapSize,
      height: sizes.mapSize
    })

    const tileset = map.addTilesetImage('tiles', 'tiles')

    const bgLayer = map.createBlankLayer('bg', tileset, 0, sizes.hudHeight)
    const blocklayer = map.createBlankLayer('block', tileset, 0, sizes.hudHeight)

    this.destroyableBlocks = this.physics.add.staticGroup()

    mapData.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 1) { blocklayer.putTileAt(tile, x, y) }
        else if (tile === 2) {
          bgLayer.putTileAt(0, x, y)
          this.destroyableBlocks.create(calculateCordinateXpx(x) , calculateCordinateYpx(y), 'tiles', tile).setOrigin(0, 0).refreshBody()} 
        else { bgLayer.putTileAt(0, x, y) }
      })
    })
    
   
    blocklayer.setCollision([1])

    //player kezdő pozíciójának üres tile-ra helyezése
    const playerStartCorner = Math.floor(Math.random() * 4)
    let playerFirstStartX
    let playerFirstStartY
    let playerSecondStartX
    let playerSecondStartY

    switch (playerStartCorner) {
      case 0: // top-left
        playerFirstStartX = 1
        playerFirstStartY = 1
        if (this.registry.get('numberOfPlayers') === 2) {
        playerSecondStartX = sizes.mapSize - 2
        playerSecondStartY = sizes.mapSize - 2
        }
        break
      case 1: // top-right
        playerFirstStartX = sizes.mapSize-2
        playerFirstStartY = 1
        if (this.registry.get('numberOfPlayers') === 2) {
        playerSecondStartX = 1
        playerSecondStartY = sizes.mapSize - 2
        }
        break
      case 2: // bottom-left
        playerFirstStartX = 1
        playerFirstStartY = sizes.mapSize-2
        if (this.registry.get('numberOfPlayers') === 2) {
        playerSecondStartX = sizes.mapSize - 2
        playerSecondStartY = 1
        }
        break
      case 3: // bottom-right
        playerFirstStartX = sizes.mapSize-2
        playerFirstStartY = sizes.mapSize-2
        if (this.registry.get('numberOfPlayers') === 2) { 
        playerSecondStartX = 1
        playerSecondStartY = 1
        }
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

    const explosion = {
      key:"explosion",
      frames: this.anims.generateFrameNumbers("explosion", {frames:[1,0,2]}),
      frameRate:3,
      repeat:-1
    }

    this.anims.create(walkUp)
    this.anims.create(walkDown)
    this.anims.create(walkLeft)
    this.anims.create(walkRight)
    this.anims.create(explosion)

    //kordinátáék számolása
    //this.scoreText = this.add.text(10, sizes.hudHeight + 10, "cordinate x: 0 y: 0", { font: "16px Arial", fill: "#ffffff" })

    //Bomb group létrehozása
    this.players.first.HUD.bombHUD.fill = this.add.group()
    this.players.first.HUD.bombHUD.empty = this.add.group()
    this.players.first.HUD.hpHUD.fill = this.add.group()
    this.players.first.HUD.hpHUD.empty = this.add.group()

    if (this.registry.get('numberOfPlayers') === 2) {
      //Hud HP
      this.players.second.hp = 3
      this.players.second.HUD.hpHUD.fill = this.add.group()
      this.players.second.HUD.hpHUD.empty = this.add.group()
      for (let i = 0; i < this.players.second.hp; i++) {
         this.players.second.HUD.hpHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
      }

      //Hud Bomb
      this.players.second.bombs = 3
      this.players.second.HUD.bombHUD.fill = this.add.group()
      this.players.second.HUD.bombHUD.empty = this.add.group()
      for (let i = 0; i < this.players.second.bombs; i++) {
        this.players.second.HUD.bombHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
      }

      //player 2 létrehozása
      this.players.second.hit = false
      this.players.second.skin = this.physics.add.sprite(calculateCordinateXpx(playerSecondStartX), calculateCordinateYpx(playerSecondStartY), 'player', 4).setOrigin(0, 0)
      this.players.second.skin.body.allowGravity = false
      this.players.second.skin.setCollideWorldBounds(true)

      //player 2 hitbox a tile-okhoz igazítása
      this.players.second.skin.body.setSize(24, 24)
      this.players.second.skin.body.setOffset(4, 4)
    
      //player 2 és tile-ek közötti ütközés
      this.players.second.skin.body.setCircle(13)
      this.physics.add.collider(this.players.second.skin, blocklayer)
      this.physics.add.collider(this.players.second.skin, this.destroyableBlocks)

      //player 1 és player 2 közötti ütközés
      //this.physics.add.collider(this.players.first.skin, this.players.first.skin)
      
    }

    //HUD HP
    this.players.first.hp = 3
    for (let i = 0; i < this.players.first.hp; i++) {
      this.players.first.HUD.hpHUD.fill.create(5 + i * (sizes.tileSize / 1.5 + 2), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
    }


    //HUD Bomb
    this.players.first.bombs = 3
    this.players.first.HUD.bombHUD.fill = this.add.group()
    this.players.first.HUD.bombHUD.empty = this.add.group()
    for (let i = 0; i < this.players.first.bombs; i++) {
      this.players.first.HUD.bombHUD.fill.create(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
    }

    //player létrehozása
    this.players.first.hit = false
    this.players.first.skin = this.physics.add.sprite(calculateCordinateXpx(playerFirstStartX), calculateCordinateYpx(playerFirstStartY), 'player', 4).setOrigin(0, 0)
    this.players.first.skin.body.allowGravity = false
    this.players.first.skin.setCollideWorldBounds(true)

    //player hitbox a tile-okhoz igazítása
    this.players.first.skin.body.setSize(24, 24)
    this.players.first.skin.body.setOffset(4, 4)
    
    // player és tile-ek közötti ütközés
    this.players.first.skin.body.setCircle(13)
    this.physics.add.collider(this.players.first.skin, blocklayer)
    this.physics.add.collider(this.players.first.skin, this.destroyableBlocks)

    // player mozgatása billentyűkkel
    if (this.registry.get('numberOfPlayers') === 2) {
      //Két játékos
        //1. játékos
        this.keyFirstPlayerPlaceBomb = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
        this.keyFirstPlayerExplodeBomb = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)

        //2. játékos
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.keySecondPlayerPlaceBomb = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        this.keySecondPlayerExplodeBomb = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G)
        this.players.first.bomb = undefined
        this.players.second.bomb = undefined
    }
    else {
      //Egy játkos
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      this.players.first.bomb = undefined
    }
    
    this.cursor = this.input.keyboard.createCursorKeys()


    //explosion
    this.players.first.isExplosionPlaying = false
    this.players.second.isExplosionPlaying = false

    //Vissza lépni a menube
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.keyV = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V)
    
    this.powerUps = this.physics.add.group()
    
  }
  update() {

    if (this.players.first.hp === 0 || this.players.second.hp === 0)
    {
      this.gameOver()
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyV)) {
      console.log('X: ' + calculateCordinateX(Math.floor(this.players.first.skin.x)) + " Y: " + calculateCordinateY(Math.floor(this.players.first.skin.y)))
    }

    if (this.registry.get('numberOfPlayers') === 2) {
      //Player 2 mozgása
      if (this.keyA.isDown && !this.players.second.hit) {
          this.players.second.skin.anims.play("walkLeft", true);
          this.players.second.skin.setVelocityX(-this.playerSpeed);  
      } else if (this.keyD.isDown && !this.players.second.hit) {
          this.players.second.skin.anims.play("walkRight", true);
          this.players.second.skin.setVelocityX(this.playerSpeed);
      } else {
          this.players.second.skin.setVelocityX(0);
          this.players.second.skin.anims.stop();
      }

      if (this.keyW.isDown && !this.players.second.hit) {
          this.players.second.skin.setVelocityY(-this.playerSpeed);
          this.players.second.skin.anims.play("walkUp", true);
      } else if (this.keyS.isDown && !this.players.second.hit) {
          this.players.second.skin.setVelocityY(this.playerSpeed);
          this.players.second.skin.anims.play("walkDown", true);
      } else {
          this.players.second.skin.setVelocityY(0);
          this.players.second.skin.anims.stop();
      }

      //Player 1 bomba lerakása
      if (Phaser.Input.Keyboard.JustDown(this.keyFirstPlayerPlaceBomb) && !this.players.first.bomb && this.players.first.isExplosionPlaying == false && this.players.first.bombs > 0) {
        const result = this.bombPlace(this.players.first)
          this.players.first.bomb = result.bomb
          this.players.first.bombs = result.playerbombnumber
      }

      //Player 2 bomba lerakása
      if (Phaser.Input.Keyboard.JustDown(this.keySecondPlayerPlaceBomb) && !this.players.second.bomb && this.players.second.isExplosionPlaying == false && this.players.second.bombs > 0) {
        const result = this.bombPlace(this.players.second)
          this.players.second.bomb = result.bomb
          this.players.second.bombs = result.playerbombnumber
      }

      //Player 1 bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keyFirstPlayerExplodeBomb) && this.players.first.bomb) {
        this.explosion = this.physics.add.group()
        this.players.first.isExplosionPlaying = true
        this.explosion.create(this.players.first.bomb.x, this.players.first.bomb.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === this.players.first.bomb.x && explosion.y === this.players.first.bomb.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
        })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.players.first.isExplosionPlaying = false
        this.players.second.hit = false
        this.players.first.hit = false
      }, 800)

      this.players.first.bomb.destroy()
      this.players.first.bomb = null
    }

    //Player 2 bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keySecondPlayerExplodeBomb) && this.players.second.bomb) {
        this.explosion = this.physics.add.group()
        this.players.second.isExplosionPlaying = true
        this.explosion.create(this.players.second.bomb.x, this.players.second.bomb.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === this.players.second.bomb.x && explosion.y === this.players.second.bomb.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
      })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", sizes.explosionSize, this.players.second.bomb.y, this.players.second.bomb.x)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", sizes.explosionSize, this.players.second.bomb.y, this.players.second.bomb.x)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", sizes.explosionSize, this.players.second.bomb.y, this.players.second.bomb.x)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", sizes.explosionSize, this.players.second.bomb.y, this.players.second.bomb.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.players.second.isExplosionPlaying = false
        this.players.second.hit = false
        this.players.first.hit = false
      }, 800)

      this.players.second.bomb.destroy()
      this.players.second.bomb = null
      }
    }
    else { 
      if (Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.players.first.bomb && this.players.first.isExplosionPlaying === false && this.players.first.bombs > 0) {
          const result = this.bombPlace(this.players.first)
          this.players.first.bomb = result.bomb
          this.players.first.bombs = result.playerbombnumber
      }

      //Bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.players.first.bomb) {
        this.explosion = this.physics.add.group()
        this.players.first.isExplosionPlaying = true
        this.explosion.create(this.players.first.bomb.x, this.players.first.bomb.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
          if (explosion.x === this.players.first.bomb.x && explosion.y === this.players.first.bomb.y) {
            explosion.body.allowGravity = false
            explosion.anims.play("explosion", true)
          }
        })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
      this.explosionXRangeCalculator("right", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //x kordináta csökkentése
      this.explosionXRangeCalculator("left", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //y kordináta növelése
      this.explosionYRangeCalculator("up", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)

      //y kordináta csökkentése
      this.explosionYRangeCalculator("down", sizes.explosionSize, this.players.first.bomb.y, this.players.first.bomb.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.players.first.isExplosionPlaying = false
        this.players.first.hit = false
        this.players.second.hit = false
      }, 800)

      this.players.first.bomb.destroy()
      this.players.first.bomb = null
    }
  }

    if (this.players.first.hit != true && (this.players.first.isExplosionPlaying == true || this.players.second.isExplosionPlaying == true)) {
      if (this.physics.overlap(this.players.first.skin, this.explosion) == true) {
        this.players.first.hit = this.playerExplsoionHit(this.players.first)
      }
    }

    if (this.registry.get('numberOfPlayers') === 2 && this.players.second.hit != true && (this.players.first.isExplosionPlaying == true || this.players.second.isExplosionPlaying == true)) {  
      if (this.physics.overlap(this.players.second.skin, this.explosion) == true) {
        this.players.second.hit = this.playerExplsoionHit(this.players.second)
      }
    }

    const {left, right, up, down} = this.cursor

    if (this.cursor.left.isDown && !this.players.first.hit) {
      this.players.first.skin.anims.play("walkLeft", true);
      this.players.first.skin.setVelocityX(-this.playerSpeed);  
    } else if (this.cursor.right.isDown && !this.players.first.hit) {
      this.players.first.skin.anims.play("walkRight", true);
      this.players.first.skin.setVelocityX(this.playerSpeed);
    } else {
        this.players.first.skin.setVelocityX(0);
        this.players.first.skin.anims.stop();
    }

    if (this.cursor.up.isDown && !this.players.first.hit) {
        this.players.first.skin.setVelocityY(-this.playerSpeed);
        this.players.first.skin.anims.play("walkUp", true);
    } else if (this.cursor.down.isDown && !this.players.first.hit) {
        this.players.first.skin.setVelocityY(this.playerSpeed);
        this.players.first.skin.anims.play("walkDown", true);
    } else {
        this.players.first.skin.setVelocityY(0);
        this.players.first.skin.anims.stop();
    }

    //Powerup felvétele, bomba hozzáadása a HUD-hoz, max bombaszám ellenőrzése
    if (this.powerUps.getChildren().length > 0 && this.physics.overlap(this.players.first.skin, this.powerUps) == true && this.players.first.bombs < this.maxBombNumber + this.extraBombNumber) {
      const hitPowerUpFirstPlayer = this.powerUps.getChildren().find(powerUp => this.physics.overlap(this.players.first.skin, powerUp))
      this.players.first.bombs = this.powerUpPickUp(this.players.first, hitPowerUpFirstPlayer)
    }
    else if (this.registry.get('numberOfPlayers') === 2 && this.powerUps.getChildren().length > 0 && this.physics.overlap(this.players.second.skin, this.powerUps) == true && this.players.second.bombs < this.maxBombNumber + this.extraBombNumber) {
      const hitPowerUpSecondPlayer = this.powerUps.getChildren().find(powerUp => this.physics.overlap(this.players.second.skin, powerUp))
      this.players.second.bombs = this.powerUpPickUp(this.players.second, hitPowerUpSecondPlayer)
    }

    //Powerup random lerakása a játékos körül, ha elfogy a bombák száma
    if (this.players.first.bombs === 0){
      this.powerUpPutRandomly(this.players.first)
    }

    if (this.registry.get('numberOfPlayers') === 2 && this.players.second.bombs === 0){
      this.powerUpPutRandomly(this.players.second)
    }

    if (this.keyEsc.isDown) {
          this.scene.pause('GameScene')  
          this.scene.launch('MenuScene')
          this.registry.set('previousScene', 'GameScene')
        }
  }



  playerExplsoionHit(player) {
      player.hp -= 1
      player.HUD.hpHUD.empty.create(player.HUD.hpHUD.fill.getChildren().slice(-1)[0].x, player.HUD.hpHUD.fill.getChildren().slice(-1)[0].y, 'hp', 1).setOrigin(0, 0).setScale(0.75)
      player.HUD.hpHUD.fill.getChildren().slice(-1)[0].destroy()
      return true
  }
    
  gameOver(){
    this.scene.pause('GameScene')
    this.scene.launch('GameOverScene')
  }

  powerUpDrop(bombNumber){
    this.randomDropChance = Math.floor(Math.random() * 10)
    if (bombNumber === 1) {
      this.dropChance = 0.9
    }
    if(this.randomDropChance <= this.dropChance * 10) {
      return true
    }
    else {
      return false
    }
    this.dropChance = 0.3
  }
  
  powerUpType() {
    this.randomPowerUpChance = Math.floor(Math.random() * 100)
    if(this.randomPowerUpChance <= this.powerUpOne * 100 && this.randomPowerUpChance > this.powerUpTwo * 100) {
      return 0
    }
    else if(this.randomPowerUpChance <= this.powerUpTwo * 100 && this.randomPowerUpChance > this.powerUpThree * 100) {
      return 1
    }
    else if(this.randomPowerUpChance <= this.powerUpThree * 100) {
      return 2
    }
  }

  powerUpPickUp(player, powerUp) {
        if (powerUp.frame.name === 0) {
          if (player.bombs < this.maxBombNumber + this.extraBombNumber) {
            player.bombs++
            if (player.bombs > this.maxBombNumber) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.fill.getChildren().slice(-1)[0].x + ((player.number === 2 ? -1 * sizes.tileSize : sizes.tileSize) / 1.5 + (player.number === 2 ? -2 : 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(player.bombs)).setOrigin(0, 0).setScale(0.75)
            }
            else if (player.bombs <= this.maxBombNumber) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(player.bombs)).setOrigin(0, 0).setScale(0.75)
              this.emptyBombDestroy(player)
            }
          }
        }
        else if (powerUp.frame.name === 1) {
          const lastBombNumber = player.bombs
          player.bombs +=2
          if (player.bombs > this.maxBombNumber + this.extraBombNumber) {
            player.bombs = this.maxBombNumber + this.extraBombNumber
          }
          const bombNumberDifference = player.bombs - lastBombNumber
          for (let i = 0; i < bombNumberDifference; i++) {
            if (player.HUD.bombHUD.empty.getChildren().length === 0) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.fill.getChildren().slice(-1)[0].x + ((player.number === 2 ? -1 * sizes.tileSize : sizes.tileSize) / 1.5 + (player.number === 2 ? -2 : 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 2).setOrigin(0, 0).setScale(0.75)
            }
            else if (player.HUD.bombHUD.empty.getChildren().length > 0) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
              this.emptyBombDestroy(player)
            }
          }
        }
        else if (powerUp.frame.name === 2) {
          const lastBombNumber = player.bombs
          player.bombs +=3
          if (player.bombs > this.maxBombNumber + this.extraBombNumber) {
            player.bombs = this.maxBombNumber + this.extraBombNumber
          }
          const bombNumberDifference = player.bombs - lastBombNumber
          for (let i = 0; i < bombNumberDifference; i++) {
            if (player.HUD.bombHUD.empty.getChildren().length === 0) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.fill.getChildren().slice(-1)[0].x + ((player.number === 2 ? -1 * sizes.tileSize : sizes.tileSize) / 1.5 + (player.number === 2 ? -2 : 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 2).setOrigin(0, 0).setScale(0.75)
            }
            else if (player.HUD.bombHUD.empty.getChildren().length > 0) {
              player.HUD.bombHUD.fill.create(player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
              this.emptyBombDestroy(player)
            }
          }
        }
        powerUp.destroy()
        return player.bombs
  }

  powerUpPutRandomly(player){
    this.time.delayedCall(5000, () => {
      let possibleTile = [[]]
      for (let i = 1; i <= 2; i++){
        if (this.mapData[calculateCordinateX(Math.floor(player.skin.x)) + i][calculateCordinateY(Math.floor(player.skin.y))] === 0 && calculateCordinateX(Math.floor(player.skin.x) + i) <= sizes.mapSize - 2){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x))+i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }

        if (this.mapData[calculateCordinateX(Math.floor(player.skin.x)) - i][calculateCordinateY(Math.floor(player.skin.y))] === 0 && calculateCordinateX(Math.floor(player.skin.x)) - i >= 0 ){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x))+i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }

        if (this.mapData[calculateCordinateX(Math.floor(player.skin.x))][calculateCordinateY(Math.floor(player.skin.y)) + i] === 0 && calculateCordinateY(Math.floor(player.skin.y)) + i >= 0){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x))+i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }

        if (this.mapData[calculateCordinateX(Math.floor(player.skin.x)) + i][calculateCordinateY(Math.floor(player.skin.y)) - i] === 0 && calculateCordinateY(Math.floor(player.skin.y)) - i >= sizes.mapSize - 2){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x))+i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }
        
      }

      if (player.bombs === 0){
        const tile = Phaser.Utils.Array.GetRandom(possibleTile)
        this.powerUps.create(tile.x, tile.y, 'bomb_powerup', this.powerUpType()).setOrigin(0, 0)
                this.powerUps.getChildren().forEach(powerUp => {
                  powerUp.body.setImmovable(true)
                  powerUp.body.allowGravity = false
                })
      }
      console.log("Lefutott")
    })
  }

  bombPlace(player){
        const playerBomb = this.physics.add.sprite(calculateCordinateXpx(calculateCordinateX(player.skin.x)), calculateCordinateYpx(calculateCordinateY(player.skin.y)), 'bomb', 0).setOrigin(0, 0)
        playerBomb.body.allowGravity = false
        playerBomb.body.setImmovable(true)
        playerBomb.setCollideWorldBounds(true)
        this.bombCollider(this.players, playerBomb)
        const lastBomb = player.HUD.bombHUD.fill.getChildren().slice(player.bombs - 1)[0]
        this.emptyBomb(player, lastBomb)
        player.HUD.bombHUD.fill.getChildren().slice(-1)[0].destroy()
        console.log("Bomb number: " + player.bombs)
        player.bombs--
        console.log("Bomb number: " + player.bombs)
        return { bomb: playerBomb,
                 playerbombnumber: player.bombs 
        }
  }

  bombCollider(player, bomb) {
      this.physics.add.collider(player.first.skin, bomb)
      if (this.registry.get('numberOfPlayers') === 2) {
        this.physics.add.collider(player.second.skin, bomb)
      }
  }

  BombType(bombNumber) {
    if (bombNumber <= this.maxBombNumber) {
      return 0
    }
      return 2
  }

  emptyBomb(player, lastBomb) {
    if (player.bombs <= this.maxBombNumber && player.bombs > 0) {
      player.HUD.bombHUD.empty.create(lastBomb.x, lastBomb.y, 'bomb_hp', 1).setOrigin(0, 0).setScale(0.75)
    }
  }

  emptyBombDestroy(player) {
      player.HUD.bombHUD.empty.getChildren().slice(-1)[0].destroy()
  }

  explosionXRangeCalculator(direction, explosionSize, y, x) {

    for (let i = 1; i < explosionSize; i++) {
        if (this.mapData[calculateCordinateY(y)][calculateCordinateX(x) + (direction === "right" ? i : -i)] === 2) {
          this.destroyableBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)) && block.y === calculateCordinateYpx(calculateCordinateY(y))) {
              block.destroy()
              if (this.powerUpDrop() == true) {
                this.powerUps.create(block.x, block.y, 'bomb_powerup', this.powerUpType()).setOrigin(0, 0)
                this.powerUps.getChildren().forEach(powerUp => {
                  powerUp.body.setImmovable(true)
                  powerUp.body.allowGravity = false
                })
              }
            }
          })
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)), calculateCordinateYpx(calculateCordinateY(y)), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i))  && explosion.y === calculateCordinateYpx(calculateCordinateY(y))) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(y)][calculateCordinateX(x) + (direction === "right" ? i : -i)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)), calculateCordinateYpx(calculateCordinateY(y)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)) && explosion.y === calculateCordinateYpx(calculateCordinateY(y))) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }   
      }
  }

  explosionYRangeCalculator(direction, explosionSize, y, x) {
    
   for (let i = 1; i < explosionSize; i++) {
        if (this.mapData[calculateCordinateY(y) + (direction === "up" ? i : -i)][calculateCordinateX(x)] === 2) {
          this.destroyableBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(x)) && block.y === calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i))) {
              block.destroy()
              if (this.powerUpDrop() == true) {
                this.powerUps.create(block.x, block.y, 'bomb_powerup', this.powerUpType()).setOrigin(0, 0)
                this.powerUps.getChildren().forEach(powerUp => {
                  powerUp.body.setImmovable(true)
                  powerUp.body.allowGravity = false
                })
              }
            }
          })
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(x)), calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i)), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i))) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(y) + (direction === "up" ? i : -i)][calculateCordinateX(x)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(x)), calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i))) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }
      }
  }

}