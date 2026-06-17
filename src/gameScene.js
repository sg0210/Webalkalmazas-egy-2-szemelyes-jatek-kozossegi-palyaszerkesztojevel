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
    this.bomb
    this.destroyedBlocks
    this.explosion
    this.playerFirstHP
    this.playerFirstHit
    this.playerFirstBombs
    this.playerSecondHP
    this.playerSecondHit
    this.powerUps
    this.dropChance = 0.3
    this.powerUpOne = 0.7
    this.powerUpTwo = 0.25
    this.powerUpThree = 0.05
    this.maxBombNumber = 5
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
    
    this.load.spritesheet('bomb_hp', 'assets/bomb_hp.png', {
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
        playerSecondStartX = sizes.mapSize - 2
        playerSecondStartY = sizes.mapSize - 2
        break
      case 1: // top-right
        playerFirstStartX = sizes.mapSize-2
        playerFirstStartY = 1
        playerSecondStartX = 1
        playerSecondStartY = sizes.mapSize - 2
        break
      case 2: // bottom-left
        playerFirstStartX = 1
        playerFirstStartY = sizes.mapSize-2
        playerSecondStartX = sizes.mapSize - 2
        playerSecondStartY = 1
        break
      case 3: // bottom-right
        playerFirstStartX = sizes.mapSize-2
        playerFirstStartY = sizes.mapSize-2
        playerSecondStartX = 1
        playerSecondStartY = 1
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

    //HUD HP
    this.playerFirstHP = 3
    for (let i = 0; i < this.playerFirstHP; i++) {
      this.add.sprite(5 + i * (sizes.tileSize / 1.5 + 2), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
    }

    //HUD Bomb
    this.playerFirstBombs = 3
    for (let i = 0; i < this.playerFirstBombs; i++) {
      this.add.sprite(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
    }

    this.powerUps = this.physics.add.group()

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
      //Első játkos
      this.cursor = this.input.keyboard.createCursorKeys()
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

      

    //explosion
    this.isExplosionPlaying = false

    //Vissza lépni a menube
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)


  }
  update() {

    if (this.playerFirstHP === 0)
    {
      this.gameOver()
      this.scene.restart(GameScene)
    }

    //this.scoreText.setText(`cordinate x: ${Math.round(this.playerFirst.x/sizes.tileSize)} y: ${Math.round(this.playerFirst.y/sizes.tileSize)}`)

    if (this.cursor.space.isDown && !this.bomb && this.isExplosionPlaying == false && this.playerFirstBombs > 0) {
      if (!this.bomb) {
        this.bomb = this.physics.add.sprite(calculateCordinateXpx(calculateCordinateX(this.playerFirst.x)), calculateCordinateYpx(calculateCordinateY(this.playerFirst.y)), 'bomb', 0).setOrigin(0, 0)
        this.bomb.body.allowGravity = false
        this.bomb.body.setImmovable(true)
        this.bomb.setCollideWorldBounds(true)
        this.physics.add.collider(this.playerFirst, this.bomb)
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.bomb) {
      this.playerFirstBombs--
      this.add.sprite(5 + this.playerFirstBombs * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 1).setOrigin(0, 0).setScale(0.75)
      this.explosion = this.physics.add.group()
      this.isExplosionPlaying = true
      this.physics.add.overlap(this.playerFirst, this.explosion, this.playerExplsoionHit, null, this)
       
      this.explosion.create(this.bomb.x, this.bomb.y, 'explosion', 1).setOrigin(0, 0)
      this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === this.bomb.x && explosion.y === this.bomb.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
      })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
      for (let i = 1; i < sizes.explosionSize; i++) {
        if (this.mapData[calculateCordinateY(this.bomb.y)][calculateCordinateX(this.bomb.x) + i] === 2) {
          this.destroyedBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) + i) && block.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
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
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x) + i), calculateCordinateYpx(calculateCordinateY(this.bomb.y)), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) + i)  && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(this.bomb.y)][calculateCordinateX(this.bomb.x) + i] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x) + i), calculateCordinateYpx(calculateCordinateY(this.bomb.y)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) + i) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }   
      }

      //x kordináta csökkentése
      for (let i = 1; i < sizes.explosionSize; i++) {
        if (this.mapData[calculateCordinateY(this.bomb.y)][calculateCordinateX(this.bomb.x) - i] === 2) {
          this.destroyedBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) - i) && block.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
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
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x) - i), calculateCordinateYpx(calculateCordinateY(this.bomb.y)), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) - i) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(this.bomb.y)][calculateCordinateX(this.bomb.x) - i] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x) - i), calculateCordinateYpx(calculateCordinateY(this.bomb.y)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x) - i) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y))) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }
      }

      //y kordináta növelése
      for (let i = 1; i < sizes.explosionSize; i++) {
        if (this.mapData[calculateCordinateY(this.bomb.y) + i][calculateCordinateX(this.bomb.x)] === 2) {
          this.destroyedBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && block.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) + i)) {
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
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x)), calculateCordinateYpx(calculateCordinateY(this.bomb.y) + i), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) + i)) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(this.bomb.y) + i][calculateCordinateX(this.bomb.x)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x)), calculateCordinateYpx(calculateCordinateY(this.bomb.y) + i), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) + i)) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }
      }

      //y kordináta csökkentése
      for (let i = 1; i < sizes.explosionSize; i++) {
        if (this.mapData[calculateCordinateY(this.bomb.y) - i][calculateCordinateX(this.bomb.x)] === 2) {
          this.destroyedBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && block.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) - i)) {
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
          this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x)), calculateCordinateYpx(calculateCordinateY(this.bomb.y) - i), 'explosion', 1).setOrigin(0, 0)
          this.explosion.getChildren().forEach(explosion => {
          if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) - i)) {
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(this.bomb.y) - i][calculateCordinateX(this.bomb.x)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(this.bomb.x)), calculateCordinateYpx(calculateCordinateY(this.bomb.y) - i), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(this.bomb.x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(this.bomb.y) - i)) {
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }
      }
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        this.isExplosionPlaying = false
        this.playerFirstHit = false
      }, 800)

      this.bomb.destroy()
      this.bomb = null
    }

    if (this.powerUps.getChildren().length > 0) {
      this.physics.add.overlap(this.playerFirst, this.powerUps, (player, powerUp) => {
        if (powerUp.frame.name === 0) {
          if (this.playerFirstBombs < this.maxBombNumber) {
            this.playerFirstBombs++
            this.add.sprite(5 + (this.playerFirstBombs - 1) * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
          }
        }
        else if (powerUp.frame.name === 1) {
          this.playerFirstBombs +=2
          if (this.playerFirstBombs > this.maxBombNumber) {
            this.playerFirstBombs = this.maxBombNumber
          }
          for (let i = this.playerFirstBombs - 2; i < this.playerFirstBombs; i++) {
            this.add.sprite(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
          }
        }
        else if (powerUp.frame.name === 2) {
          this.playerFirstBombs +=3
          if (this.playerFirstBombs > this.maxBombNumber) {
            this.playerFirstBombs = this.maxBombNumber
          }
          for (let i = this.playerFirstBombs - 3; i < this.playerFirstBombs; i++) {
            this.add.sprite(5 + i * (sizes.tileSize / 1.5 + 2), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
          }
        }
        powerUp.destroy()
      })
    }
          

    const {left, right, up, down, space} = this.cursor

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

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.start('MenuScene')
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
      this.dropChance = 0.5
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

}