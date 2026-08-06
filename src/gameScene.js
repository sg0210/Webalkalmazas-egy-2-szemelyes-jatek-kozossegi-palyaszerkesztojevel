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
    this.playerFirst
    this.playerSecond
    this.cursor
    this.playerSpeed = speedDown + 50
    this.bombFirstPlayer = undefined
    this.bombSecondPlayer = undefined
    this.destroyedBlocks
    this.explosion
    this.playerFirstHP
    this.playerFirstHit
    this.playerFirstBombs
    this.playerFirstBombGroup
    this.playerFirstEmptyBombs
    this.playerSecondHP
    this.playerSecondHit
    this.playerSecondBombs
    this.playerSecondBombGroup
    this.playerSecondEmptyBombs
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

    this.destroyedBlocks = this.physics.add.staticGroup()

    mapData.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 1) { blocklayer.putTileAt(tile, x, y) }
        else if (tile === 2) {
          bgLayer.putTileAt(0, x, y)
          this.destroyedBlocks.create(calculateCordinateXpx(x) , calculateCordinateYpx(y), 'tiles', tile).setOrigin(0, 0).refreshBody()} 
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
    this.bombFirstPlayer = this.physics.add.group()

    if (this.registry.get('numberOfPlayers') === 2) {
      //Hud HP
      this.playerSecondHP = 3
      for (let i = 0; i < this.playerSecondHP; i++) {
         this.add.sprite(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
      }

      //Hud Bomb
      this.playerSecondBombs = 3
      this.playerSecondBombGroup = this.add.group()
      this.playerSecondEmptyBombs = this.add.group()
      for (let i = 0; i < this.playerSecondBombs; i++) {
        this.playerSecondBombGroup.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
      }

      //player 2 létrehozása
      this.playerSecondHit = undefined
      this.playerSecond = this.physics.add.sprite(calculateCordinateXpx(playerSecondStartX), calculateCordinateYpx(playerSecondStartY), 'player', 4).setOrigin(0, 0)
      this.playerSecond.body.allowGravity = false
      this.playerSecond.setCollideWorldBounds(true)

      //player 2 hitbox a tile-okhoz igazítása
      this.playerSecond.body.setSize(24, 24)
      this.playerSecond.body.setOffset(4, 4)
    
      //player 2 és tile-ek közötti ütközés
      this.playerSecond.body.setCircle(13)
      this.physics.add.collider(this.playerSecond, blocklayer)
      this.physics.add.collider(this.playerSecond, this.destroyedBlocks)

      //player 1 és player 2 közötti ütközés
      //this.physics.add.collider(this.playerFirst, this.playerSecond)
      
    }

    //HUD HP
    this.playerFirstHP = 3
    for (let i = 0; i < this.playerFirstHP; i++) {
      this.add.sprite(5 + i * (sizes.tileSize / 1.5 + 2), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
    }


    //HUD Bomb
    this.playerFirstBombs = 3
    this.playerFirstBombGroup = this.add.group()
    this.playerFirstEmptyBombs = this.add.group()
    for (let i = 0; i < this.playerFirstBombs; i++) {
      this.playerFirstBombGroup.create(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
    }

    //player létrehozása
    this.playerFirstHit = undefined
    this.playerFirst = this.physics.add.sprite(calculateCordinateXpx(playerFirstStartX), calculateCordinateYpx(playerFirstStartY), 'player', 4).setOrigin(0, 0)
    this.playerFirst.body.allowGravity = false
    this.playerFirst.setCollideWorldBounds(true)

    //player hitbox a tile-okhoz igazítása
    this.playerFirst.body.setSize(24, 24)
    this.playerFirst.body.setOffset(4, 4)
    
    // player és tile-ek közötti ütközés
    this.playerFirst.body.setCircle(13)
    this.physics.add.collider(this.playerFirst, blocklayer)
    this.physics.add.collider(this.playerFirst, this.destroyedBlocks)

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
        this.bombFirstPlayer = undefined
        this.bombSecondPlayer = undefined
    }
    else {
      //Egy játkos
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      this.bombFirstPlayer = undefined
    }
    
    this.cursor = this.input.keyboard.createCursorKeys()


    //explosion
    this.isExplosionPlayingFirstPlayer = false
    this.isExplosionPlayingSecondPlayer = false

    //Vissza lépni a menube
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    
    this.powerUps = this.physics.add.group()
    
  }
  update() {

    if (this.playerFirstHP === 0 || this.playerSecondHP === 0)
    {
      this.gameOver()
      this.scene.restart(GameScene)
    }

    //this.scoreText.setText(`cordinate x: ${Math.round(this.playerFirst.x/sizes.tileSize)} y: ${Math.round(this.playerFirst.y/sizes.tileSize)}`)

    if (this.registry.get('numberOfPlayers') === 2) {
      //Player 2 mozgása
      if (this.keyA.isDown && !this.playerSecondHit) {
          this.playerSecond.anims.play("walkLeft", true);
          this.playerSecond.setVelocityX(-this.playerSpeed);  
      } else if (this.keyD.isDown && !this.playerSecondHit) {
          this.playerSecond.anims.play("walkRight", true);
          this.playerSecond.setVelocityX(this.playerSpeed);
      } else {
          this.playerSecond.setVelocityX(0);
          this.playerSecond.anims.stop();
      }

      if (this.keyW.isDown && !this.playerSecondHit) {
          this.playerSecond.setVelocityY(-this.playerSpeed);
          this.playerSecond.anims.play("walkUp", true);
      } else if (this.keyS.isDown && !this.playerSecondHit) {
          this.playerSecond.setVelocityY(this.playerSpeed);
          this.playerSecond.anims.play("walkDown", true);
      } else {
          this.playerSecond.setVelocityY(0);
          this.playerSecond.anims.stop();
      }

      //Player 1 bomba lerakása
      if (Phaser.Input.Keyboard.JustDown(this.keyFirstPlayerPlaceBomb) && !this.bombFirstPlayer && this.isExplosionPlayingFirstPlayer == false && this.playerFirstBombs > 0) {
        const result = this.bombPlace(this.playerFirst, this.playerFirstBombs, this.playerFirstBombGroup)
          this.bombFirstPlayer = result.bomb
          this.playerFirstBombs = result.playerbombs
          console.log(this.playerFirstBombs)
      }

      //Player 2 bomba lerakása
      if (Phaser.Input.Keyboard.JustDown(this.keySecondPlayerPlaceBomb) && !this.bombSecondPlayer && this.isExplosionPlayingSecondPlayer == false && this.playerSecondBombs > 0) {
        const result = this.bombPlace(this.playerSecond, this.playerSecondBombs, this.playerSecondBombGroup)
          this.bombSecondPlayer = result.bomb
          this.playerSecondBombs = result.playerbombs
          console.log(this.playerSecondBombs)
      }

      //Player 1 bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keyFirstPlayerExplodeBomb) && this.bombFirstPlayer) {
        this.explosion = this.physics.add.group()
        this.isExplosionPlayingFirstPlayer = true
        this.physics.add.overlap(this.playerFirst, this.explosion, this.playerExplsoionHit, null, this)
       
        this.explosion.create(this.bombFirstPlayer.x, this.bombFirstPlayer.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === this.bombFirstPlayer.x && explosion.y === this.bombFirstPlayer.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
      })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.isExplosionPlayingFirstPlayer = false
        this.playerFirstHit = false
      }, 800)

      this.bombFirstPlayer.destroy()
      this.bombFirstPlayer = null
    }

    //Player 2 bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keySecondPlayerExplodeBomb) && this.bombSecondPlayer) {
        this.explosion = this.physics.add.group()
        this.isExplosionPlayingSecondPlayer = true
        this.physics.add.overlap(this.playerSecond, this.explosion, this.playerExplsoionHit, null, this)
        this.explosion.create(this.bombSecondPlayer.x, this.bombSecondPlayer.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === this.bombSecondPlayer.x && explosion.y === this.bombSecondPlayer.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
      })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", sizes.explosionSize, this.bombSecondPlayer.y, this.bombSecondPlayer.x)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", sizes.explosionSize, this.bombSecondPlayer.y, this.bombSecondPlayer.x)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", sizes.explosionSize, this.bombSecondPlayer.y, this.bombSecondPlayer.x)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", sizes.explosionSize, this.bombSecondPlayer.y, this.bombSecondPlayer.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.isExplosionPlayingSecondPlayer = false
        this.playerSecondHit = false
      }, 800)

      this.bombSecondPlayer.destroy()
      this.bombSecondPlayer = null
      }
    }
    else { 
      if (Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.bombFirstPlayer && this.isExplosionPlayingFirstPlayer == false && this.playerFirstBombs > 0) {
          const result = this.bombPlace(this.playerFirst, this.playerFirstBombs, this.playerFirstBombGroup)
          this.bombFirstPlayer = result.bomb
          this.playerFirstBombs = result.playerbombs
      }

      //Bomba robbantása
      if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.bombFirstPlayer) {
        this.explosion = this.physics.add.group()
        this.isExplosionPlayingFirstPlayer = true
        this.physics.add.overlap(this.playerFirst, this.explosion, this.playerExplsoionHit, null, this)
        this.explosion.create(this.bombFirstPlayer.x, this.bombFirstPlayer.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
          if (explosion.x === this.bombFirstPlayer.x && explosion.y === this.bombFirstPlayer.y) {
            explosion.body.allowGravity = false
            explosion.anims.play("explosion", true)
          }
        })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
      this.explosionXRangeCalculator("right", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //x kordináta csökkentése
      this.explosionXRangeCalculator("left", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //y kordináta növelése
      this.explosionYRangeCalculator("up", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)

      //y kordináta csökkentése
      this.explosionYRangeCalculator("down", sizes.explosionSize, this.bombFirstPlayer.y, this.bombFirstPlayer.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.isExplosionPlayingFirstPlayer = false
        this.playerFirstHit = false
      }, 800)

      this.bombFirstPlayer.destroy()
      this.bombFirstPlayer = null
    }
  }

    const {left, right, up, down} = this.cursor

    if (this.cursor.left.isDown && !this.playerFirstHit) {
      this.playerFirst.anims.play("walkLeft", true);
      this.playerFirst.setVelocityX(-this.playerSpeed);  
    } else if (this.cursor.right.isDown && !this.playerFirstHit) {
      this.playerFirst.anims.play("walkRight", true);
      this.playerFirst.setVelocityX(this.playerSpeed);
    } else {
        this.playerFirst.setVelocityX(0);
        this.playerFirst.anims.stop();
    }

    if (this.cursor.up.isDown && !this.playerFirstHit) {
        this.playerFirst.setVelocityY(-this.playerSpeed);
        this.playerFirst.anims.play("walkUp", true);
    } else if (this.cursor.down.isDown && !this.playerFirstHit) {
        this.playerFirst.setVelocityY(this.playerSpeed);
        this.playerFirst.anims.play("walkDown", true);
    } else {
        this.playerFirst.setVelocityY(0);
        this.playerFirst.anims.stop();
    }

    //Pwerup felvétele, bomba hozzáadása a HUD-hoz, max bombaszám ellenőrzése
    if (this.powerUps.getChildren().length > 0 && this.physics.overlap(this.playerFirst, this.powerUps) == true) {
      this.playerFirstBombs = this.powerUpPickUp(this.playerFirst, this.powerUps, this.playerFirstBombs, this.playerFirstBombGroup)
    }
    else if (this.registry.get('numberOfPlayers') === 2 && this.powerUps.getChildren().length > 0 && this.physics.overlap(this.playerSecond, this.powerUps) == true) {
      this.playerSecondBombs = this.powerUpPickUp(this.playerSecond, this.powerUps, this.playerSecondBombs, this.playerSecondBombGroup)
    }

    if (this.keyEsc.isDown) {
          this.scene.pause('GameScene')  
          this.scene.launch('MenuScene')
          this.registry.set('previousScene', 'GameScene')
        }
  }


  playerExplsoionHit(player, explosion) {
    if (!explosion.hit && calculateCordinateX(explosion.x) == calculateCordinateX(player.x) &&calculateCordinateY(explosion.y) == calculateCordinateY(player.y)) {
      this.playerFirstHP -= 1
      this.add.sprite(5 + this.playerFirstHP * (sizes.tileSize / 1.5 + 2), 5, 'hp', 1).setOrigin(0, 0).setScale(0.75)
      explosion.hit = true
      this.playerFirstHit = true
    }
  }
    
  gameOver(){
    console.log("Game Over")
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

  powerUpPickUp(player, powerUp, playerBombs, playerBombGroup) {
    this.physics.add.overlap(player, powerUp, (player, powerUp) => {
        if (powerUp.frame.name === 0) {
          if (playerBombs < this.maxBombNumber + this.extraBombNumber) {
            playerBombs++
            if (playerBombs <= this.maxBombNumber) {
              this.emptyBombDestroy(playerBombs)
            }
            playerBombGroup.create(5 + (playerBombs - 1) * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(playerBombs)).setOrigin(0, 0).setScale(0.75)
          }
        }
        else if (powerUp.frame.name === 1) {
          playerBombs +=2
          if (playerBombs > this.maxBombNumber + this.extraBombNumber) {
            playerBombs = this.maxBombNumber + this.extraBombNumber
          }
          for (let i = playerBombs - 1; i <= playerBombs; i++) {
            if (i <= this.maxBombNumber && i > 0) {
              this.emptyBombDestroy(i)
            }
            if (i > 0) {
              playerBombGroup.create(5 + (i-1) * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(i)).setOrigin(0, 0).setScale(0.75)
            }
            else {
              playerBombGroup.create(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(i)).setOrigin(0, 0).setScale(0.75)
            }
          }
        }
        else if (powerUp.frame.name === 2) {
          playerBombs +=3
          if (playerBombs > this.maxBombNumber + this.extraBombNumber) {
            playerBombs = this.maxBombNumber + this.extraBombNumber
          }
          console.log(playerBombs)
          for (let i = playerBombs - 2; i <= playerBombs; i++) {
            if (i <= this.maxBombNumber) {
              this.emptyBombDestroy(i)
            }
            if (i > 0) {
              playerBombGroup.create(5 + (i-1) * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(i)).setOrigin(0, 0).setScale(0.75)
            }
            else {
              playerBombGroup.create(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', this.BombType(i)).setOrigin(0, 0).setScale(0.75)
            }
          }
        }
        powerUp.destroy()
        return playerBombs
      })
  }

  bombPlace(player, playerBombs, playerBombGroup){
        const playerBomb = this.physics.add.sprite(calculateCordinateXpx(calculateCordinateX(player.x)), calculateCordinateYpx(calculateCordinateY(player.y)), 'bomb', 0).setOrigin(0, 0)
        playerBomb.body.allowGravity = false
        playerBomb.body.setImmovable(true)
        playerBomb.setCollideWorldBounds(true)
        this.physics.add.collider(player, playerBomb)
        playerBombGroup.getChildren().slice(playerBombs - 1)[0].destroy()
        this.emptyBomb(playerBombs)
        playerBombs--
        return { bomb: playerBomb,
                 playerbombs: playerBombs 
        }
  }

  BombType(bombNumber) {
    if (bombNumber <= this.maxBombNumber) {
      return 0
    }
      return 2
  }

  emptyBomb(bombNumber) {
    if (bombNumber <= this.maxBombNumber && bombNumber > 0) {
      return this.playerFirstEmptyBombs.create(5 + (bombNumber - 1)   * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 1).setOrigin(0, 0).setScale(0.75)
    }
  }

  emptyBombDestroy(bombNumber) {
    if (bombNumber <= this.maxBombNumber) {
      this.playerFirstEmptyBombs.getChildren().slice(this.maxBombNumber - bombNumber)[0].destroy()
    }
    else if (bombNumber === 0) {
      this.playerFirstEmptyBombs.getChildren().slice(-1)[0].destroy()
    }
  }

  explosionXRangeCalculator(direction, explosionSize, y, x) {

    for (let i = 1; i < explosionSize; i++) {
        if (this.mapData[calculateCordinateY(y)][calculateCordinateX(x) + (direction === "right" ? i : -i)] === 2) {
          this.destroyedBlocks.getChildren().forEach(block => {
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
          this.destroyedBlocks.getChildren().forEach(block => {
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