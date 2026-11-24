import Phaser from "phaser";
import { getBrowserId, API_URL } from "./browserId";

export const sizes = {
        screenWidth:512,
        screenHeight:512 + 50,
        tileSize:32,
        mapSize:16,
        explosionSize:4,
        hudHeight:50
    }

export const speedDown = 100

export function calculateCordinateX(x) {

    return Math.floor(x / sizes.tileSize)
  }

export function calculateCordinateY(y) {
    return Math.floor((y - sizes.hudHeight) / sizes.tileSize)
  }

export function calculateCordinateXpx(x) {
    return x * sizes.tileSize
  }
    
export function calculateCordinateYpx(y) {
    return y * sizes.tileSize + sizes.hudHeight
  }

function setLimits(a){
  if (a > sizes.tileSize - 2){
    a = sizes.tileSize - 2
  }
  else if (a < 1){
    a = 1
  }
}

 export class GameScene extends Phaser.Scene {
  constructor() {
    super({key: 'GameScene'})
    this.players = {}
    this.playerSpeed = speedDown
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
    this.explosionSize = 4
    this.mapData
  }
  
  init (data) {
    this.numberOfPlayers = data.numberOfPlayers
    this.editorTest = data.editorTest || null
    this.mapId = data.mapId ?? null
    this.isGameOver = false
    if (this.numberOfPlayers === 2) {
      this.players = {
        first: this.createPlayer(1),
        second: this.createPlayer(2)
      }
    } else {
      this.players = {
        first: this.createPlayer(1),
        ai: this.createPlayer(2)
      }
      this.players.ai.blast = this.physics.add.group()
      this.players.ai.move = undefined
      this.players.ai.move = {
        target: undefined,
        isMoving: false
      }
    }

    //Alap pálya létrehozása vagy betöltése
    if (data.mapData === undefined || data.mapData === null ){
      this.mapData = [
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
      }else{
        this.mapData = JSON.parse(data.mapData)
        this.oldMapData = data.mapData
      }
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
    this.load.spritesheet('player', 'assets/red_move_anim.png', {
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

    this.load.image("header_bg", "assets/button.png")
    this.load.image("game_bg", "assets/maps_bg.png")
    this.load.image("red_head", "assets/red_head.png")
    this.load.image("orange_head", "assets/orange_head.png")
  }
  create() {
    
    const bg = this.add.image(0, 0, "game_bg").setOrigin(0, 0)
    const headerBG = this.add.nineslice(0, 0, "header_bg", null, sizes.screenWidth, sizes.hudHeight, 13, 13, 13, 13).setOrigin(0, 0)
    

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

    this.mapData.forEach((row, y) => {
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
      frames: this.anims.generateFrameNumbers("player", {
        start: 6,
        end: 11
      }),
      duration: 833,
      repeat:-1
    }

    const walkDown = {
      key:"walkDown",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 5
      }),
      duration: 833,
      repeat:-1
    }

    const walkLeft = {
      key:"walkLeft",
      frames: this.anims.generateFrameNumbers("player", {
        start: 12,
        end: 17 
      }),
      duration: 833,
      repeat:-1
    }

    const walkRight = {
      key:"walkRight",
      frames: this.anims.generateFrameNumbers("player", {
        start: 18,
        end: 23
      }),
      duration: 833,
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

    this.explosion = this.physics.add.group()

    //kordinátáék számolása
    //this.scoreText = this.add.text(10, sizes.hudHeight + 10, "cordinate x: 0 y: 0", { font: "16px Arial", fill: "#ffffff" })

    //HUD létrehozása
    this.buildPlayerHUD(this.players.first, 'red_head', "P1", 'left')
    if (this.numberOfPlayers === 2) {
      this.buildPlayerHUD(this.players.second, 'orange_head', "P2", 'right')
    }
    else {
      this.buildPlayerHUD(this.players.ai, 'orange_head', "AI", 'right')
    }

    //Players karakter létrehozása
    this.createCharacter(this.players.first, playerFirstStartX, playerFirstStartY, blocklayer)
    if (this.numberOfPlayers === 2) {
      this.createCharacter(this.players.second, playerSecondStartX, playerSecondStartY, blocklayer)
    }
    else{
      this.createCharacter(this.players.ai, playerSecondStartX, playerSecondStartY, blocklayer)
    }

    const opponent = this.numberOfPlayers === 2 ? this.players.second : this.players.ai
    this.players.first.skin.setPushable(false)
    opponent.skin.setPushable(false)
    this.physics.add.collider(this.players.first.skin, opponent.skin)

    //Játékosok irányítása billentyűkkel
    this.players.first.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT), placeBomb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K), explodeBomb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
    }
    if (this.numberOfPlayers === 2) {
      this.players.second.keys = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S), left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D), placeBomb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G), explodeBomb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
      }
    }

    //Vissza lépni a menube
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.keyV = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V)
    this.keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B)
    
    this.powerUps = this.physics.add.group()
    
    this.aiThinkDelay = 1000
    this.nextThinkTime = this.time.now + 3000
  }
  update(time, delta) {

    if (this.numberOfPlayers === 1)
    {
      if (this.players.first.hp === 0 || this.players.ai.hp === 0){
        console.log("Gameover")
        this.gameOver()
      }
    }
    else if (this.numberOfPlayers === 2){
      if (this.players.first.hp === 0 || this.players.second.hp === 0){
        console.log("Gameover")
        this.gameOver()
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyV)){
      this.powerUpPutRandomly(this.players.ai, this.players.first)
      this.scene.pause('GameScene')
    }

  
    //Karakter mozgás
    this.characterControl(this.players.first, this.numberOfPlayers === 2 ? this.players.second : this.players.ai)
    
    this.numberOfPlayers === 2 ? this.characterControl(this.players.second, this.players.first) : false
    
    if (this.numberOfPlayers != 2 && !this.players.ai.move.isMoving) {
      if (time >= this.nextThinkTime){
        const result = this.possibleMovementTile(this.players.ai)
        this.players.ai.move.target = result.tile
        this.players.ai.move.isMoving = result.canMove
        this.nextThinkTime = time + this.aiThinkDelay
      }
    }
    else if (this.numberOfPlayers != 2 && this.players.ai.move.target) {
      this.aiMovement(this.players.ai)
    }

    if (this.numberOfPlayers != 2 && !this.players.ai.move.isMoving){
      if (!this.players.ai.bomb && this.players.ai.isExplosionPlaying === false && this.players.ai.bombs > 0 ) {this.aiBombPut(this.players.ai, this.players.first) }
      else if (this.players.ai.bomb && this.blastRange(this.players.ai) === true && this.bombCheck(this.players.ai.bomb, calculateCordinateX(this.players.ai.skin.x), calculateCordinateY(this.players.ai.skin.y)) === 10 ) {this.bombExplosion(this.players.ai, this.players.first)}
    }

    

    //Sebződés
    if (this.numberOfPlayers === 2){
      this.bombHit(this.players.first, this.players.second)
      this.bombHit(this.players.second, this.players.first)
    }
    else{
      this.bombHit(this.players.first, this.players.ai)
      this.bombHit(this.players.ai, this.players.first)
    }

    //Powerup felvétele, bomba hozzáadása a HUD-hoz, max bombaszám ellenőrzése
    if (this.powerUps.getChildren().length > 0 && this.physics.overlap(this.players.first.skin, this.powerUps) == true && this.players.first.bombs < this.maxBombNumber + this.extraBombNumber) {
      const hitPowerUpFirstPlayer = this.powerUps.getChildren().find(powerUp => this.physics.overlap(this.players.first.skin, powerUp))
      this.players.first.bombs = this.powerUpPickUp(this.players.first, hitPowerUpFirstPlayer)
    }

    if (this.numberOfPlayers != 2 && this.powerUps.getChildren().length > 0 && this.physics.overlap(this.players.ai.skin, this.powerUps) == true && this.players.ai.bombs < this.maxBombNumber + this.extraBombNumber) {
      const hitPowerUpFirstPlayer = this.powerUps.getChildren().find(powerUp => this.physics.overlap(this.players.ai.skin, powerUp))
      this.players.ai.bombs = this.powerUpPickUp(this.players.ai, hitPowerUpFirstPlayer)
    }
    
    if (this.numberOfPlayers === 2 && this.powerUps.getChildren().length > 0 && this.physics.overlap(this.players.second.skin, this.powerUps) == true && this.players.second.bombs < this.maxBombNumber + this.extraBombNumber) {
      const hitPowerUpSecondPlayer = this.powerUps.getChildren().find(powerUp => this.physics.overlap(this.players.second.skin, powerUp))
      this.players.second.bombs = this.powerUpPickUp(this.players.second, hitPowerUpSecondPlayer)
    }

    //Powerup random lerakása a játékos körül, ha elfogy a bombák száma
    /*if (this.players.first.bombs === 0 && this.players.first.bombEmpty === false){
      this.players.first.bombEmpty = this.powerUpPutRandomly(this.players.first)
    }

    if (this.numberOfPlayers === 2 && this.players.second.bombs === 0 && this.players.second.bombEmpty === false){
      this.players.second.bombEmpty = this.powerUpPutRandomly(this.players.second)
    }

    if (this.numberOfPlayers != 2 && this.players.ai.bombs === 0 && this.players.ai.bombEmpty === false){
      this.players.ai.bombEmpty = this.powerUpPutRandomly(this.players.ai)
    }*/

    if (this.players.first.bombEmpty === true && this.players.first.bombs > 0) {
      this.players.first.bombEmpty = false
    }

    if (this.numberOfPlayers === 2 && this.players.second.bombEmpty === true && this.players.second.bombs > 0) {
      this.players.second.bombEmpty = false
    }

    if (this.keyEsc.isDown) {
          this.scene.pause('GameScene')  
          this.scene.launch('MenuScene', this.oldMapData)
          this.registry.set('previousScene', 'GameScene')
    }

  }

  aiCanExplodeBomb(player){
    if (this.physics.overlap(player.skin, player.blast)){
      return false
    }
    else{return true}
  }

  aiBombPut(player, enemy){
    if (this.enemyAround(player, enemy)){
      this.bombPlace(player)
    }
    else if (this.neighborDestroyable(player)){
      this.bombPlace(player)
    }
  }

  enemyAround(player, enemy){
    let enemyFound = 0
    let possibleTiles = []
    const ex = calculateCordinateX(enemy.skin.x)
    const ey = calculateCordinateY(enemy.skin.y)
    const px = calculateCordinateX(player.skin.x)
    const py = calculateCordinateY(player.skin.y)
    let right = true, left = true, up = true, down = true
   
    for (let i = 1; i <= this.explosionSize - 1; i++){

      if (right === true && this.tileAt(px + i, py) != 1){
        possibleTiles.push({x: px + i, y: py })
      }
      else{right = false}

      if (left === true && this.tileAt(px - i, py) != 1){
        possibleTiles.push({x: px - i, y: py })
      }
      else{left = false}

      if (up === true && this.tileAt(px, py + i) != 1){
        possibleTiles.push({x: px, y: py + i})
      }
      else{up = false}

      if (down === true && this.tileAt(px, py - i) != 1){
        possibleTiles.push({x: px, y: py - i})
      }
      else{down = false}
    }

    for (const pt of possibleTiles){
      if (pt.x === ex && pt.y === ey){
        enemyFound++
      }
    }

    if (enemyFound > 0) {return true}
    else {return false}
  }

  neighborDestroyable(player){
    let destroyableBlocks = 0
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }]

    for (const dir of directions){
      const newx = calculateCordinateX(player.skin.x) + dir.x
      const newy = calculateCordinateY(player.skin.y) + dir.y

      if (this.tileAt(newx, newy) === 2){
        destroyableBlocks++
      }
    }

    if (destroyableBlocks > 0) { 
      return true
    }
    else {return false} 

  }

  tileAt(x, y){
    if (!this.mapData[y] || this.mapData[y][x] === undefined) {
      return 1
    }
    return this.mapData[y][x]
  }

  aiMovement(player){
    if (!player.move.target) {
      player.move.isMoving = false
      return
    }
    const tx = calculateCordinateXpx(player.move.target.x)
    const ty = calculateCordinateYpx(player.move.target.y)
    const dx = tx - player.skin.x
    const dy = ty - player.skin.y


    const tolarenc = Math.max(2, this.playerSpeed * this.game.loop.delta / 1000)

    if (Math.abs(dx) <= tolarenc && Math.abs(dy) <= tolarenc) {
      player.skin.setVelocityX(0)
      player.skin.setVelocityY(0)
      player.skin.body.reset(tx, ty)
      player.move.isMoving = false
      return
    }

    player.skin.setVelocityX(Math.abs(dx) > tolarenc ? Math.sign(dx) * this.playerSpeed : 0)
    player.skin.setVelocityY(Math.abs(dy) > tolarenc ? Math.sign(dy) * this.playerSpeed : 0)

  }

  

  possibleMovementTile(player){
    const walkableTile = []
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0}]


    for (const dir of directions ){
      const newx = calculateCordinateX(player.skin.x) + dir.x
      const newy = calculateCordinateY(player.skin.y) + dir.y

      if (this.tileAt(newx, newy) === 0) {
        walkableTile.push({x: newx, y: newy, score: this.scoreTile(newx, newy)})
      }
    }

    walkableTile.sort((a, b) => b.score - a.score)
    this.players.ai.lastVisited = { x: calculateCordinateX(player.skin.x), y: calculateCordinateY(player.skin.y)}
    if (walkableTile.length === 0) {
      return {tile: undefined, canMove: false}
    }
    console.log(calculateCordinateX(player.skin.x) + "|" + calculateCordinateY(player.skin.y), walkableTile[0], walkableTile)
    return {tile: walkableTile[0], canMove: true}
  }

  scoreTile(x, y){
    let score = 0
    
    this.players.first.bomb ? score += this.bombCheck(this.players.first.bomb, x, y) : false
    this.players.ai.bomb ?score += this.bombCheck(this.players.ai.bomb, x, y) : false
    
    if (this.players.first.bomb) {score -= this.explosionCheck(this.players.first.bomb, x, y)}
    if (this.players.ai.bomb) { score -= this.explosionCheck(this.players.ai.bomb, x, y)}

    if(this.explosion.getChildren().length > 0) {score -= this.blastCheck(x, y)}

    if (x == this.players.ai.lastVisited.x && y == this.players.ai.lastVisited.y && calculateCordinateX(this.players.ai.skin.x) != this.players.ai.lastVisited.x && calculateCordinateY(this.players.ai.skin.y) != this.players.ai.lastVisited.y){
        score -= 1
    }

    if ((!this.players.first.bomb && !this.players.ai.bomb) || this.explosion.getChildren().length == 0){
      score -= this.avoidStay(x, y, this.players.ai.skin)
    }

    if (this.blastRange(this.players.ai)){
      score -= this.enemyDistance(x, y, this.players.first)
    }

    this.players.ai.bombs < 3 ? score += this.powerupCheck(x, y) : false

    this.players.first.bomb || this.players.ai.bomb ? score -= this.deadendCheck(x, y) : false 

    return score
  }

  avoidStay(x, y, player){
    const px = calculateCordinateX(player.x)
    const py = calculateCordinateY(player.y)

    if (x == px && y == py){
      return 2
    }
    else{
      return 0
    }


  }

  enemyDistance(x, y, enemy){
    const ex = calculateCordinateX(enemy.skin.x)
    const ey = calculateCordinateY(enemy.skin.y)
    return Math.abs(ex - x) + Math.abs(ey - y)
  }

  deadendCheck(x, y){
    let deadendscore = 0
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }]

    for (const dir of directions){
      const newx = x + dir.x
      const newy = y + dir.y

      if (this.tileAt(newx, newy) != 0){
        deadendscore += 10
      }
    }

    return deadendscore
  }

  powerupCheck(x, y){
    let powerupScore = 0

    this.powerUps.getChildren().forEach(powerUp => {
          if (calculateCordinateX(powerUp.x) === x && calculateCordinateY(powerUp.y) === y) {    
            switch (powerUp.frame.name){
              case 0:
                powerupScore += 10
                break
              case 1:
                powerupScore += 11
                break
              case 2:
                powerupScore += 12
                break
              default:
                powerupScore = 0
            }
          }
        })
    
    return powerupScore
  }

  bombCheck(bomb, x, y){
    if (bomb && x == calculateCordinateX(bomb.x) && y == calculateCordinateY(bomb.y)){
      return -1000
    }
    else {return 10}
  }

  explosionCheck(bomb, x, y){
    let explosionScore = 0
    let explosionTiles = []
    let bombx = calculateCordinateX(bomb.x)
    let bomby = calculateCordinateY(bomb.y)
    let right = 0, left = 0, up = 0, down = 0

    for (let i = 1; i <= this.explosionSize; i++) {
      if (right === 0 && this.tileAt(bombx + i, bomby) != 1){
        explosionTiles.push({x: bombx + i, y: bomby})
      }else {right = 1}

      if (left === 0 && this.tileAt(bombx - i, bomby) != 1){
        explosionTiles.push({x: bombx - i, y: bomby})
      }else {left = 1}

      if (down === 0 && this.tileAt(bombx, bomby + i) != 1){
        explosionTiles.push({x: bombx, y: bomby + i})
      }else {down = 1}

      if (up === 0 && this.tileAt(bombx, bomby - i) != 1){
        explosionTiles.push({x: bombx, y: bomby - i})
      }else {up = 1}
    }

    for (const tile of explosionTiles){
      if (tile.x === x && tile.y === y){
        explosionScore = 100
        break
      }
    }
    return explosionScore
  }

  blastCheck(x, y){
    let blastScore = 0
    this.explosion.getChildren().forEach(explosion => {
      if (calculateCordinateX(explosion.x) == x && calculateCordinateY(explosion.y) == y){
        blastScore = 100
      }
    })

    console.log(blastScore)
    return blastScore
  }

  characterControl(player, enemy){
    player.skin.setVelocity(0);

    if (!player.hit){
      if (player.keys.left.isDown) {
          player.skin.setVelocityX(-this.playerSpeed);
          player.skin.anims.play("walkLeft", true);
      } else if (player.keys.right.isDown) {
          player.skin.setVelocityX(this.playerSpeed);  
          player.skin.anims.play("walkRight", true);
      } else if (player.keys.up.isDown) {
          player.skin.setVelocityY(-this.playerSpeed);
          player.skin.anims.play("walkUp", true);
      } else if (player.keys.down.isDown) {
          player.skin.setVelocityY(this.playerSpeed);
          player.skin.anims.play("walkDown", true);
      } else {
          player.skin.anims.stop();
      }
    }

      if (player.keys.placeBomb.isDown && !player.bomb && player.isExplosionPlaying === false && player.bombs > 0) {
          this.bombPlace(player)
      }

      if (Phaser.Input.Keyboard.JustDown(player.keys.explodeBomb) && player.bomb) {
        this.bombExplosion(player, enemy) 
      }
  }

  createPlayer(number)
  {
    return{number: number, skin: undefined, hp: 3, hit: false, bombs: 3, bomb: undefined, blast: undefined, 
           bombEmpty: false, HUD: {}, isExplosionPlaying: false, keys: undefined, lastVisited: {}}
  }

  createCharacter(player, x, y, blocklayer) {
    player.hit = false
    player.skin = this.physics.add.sprite(calculateCordinateXpx(x), calculateCordinateYpx(y), 'player', 0).setOrigin(0, 0)
    player.skin.body.allowGravity = false
    player.skin.setCollideWorldBounds(true)

    //player hitbox a tile-okhoz igazítása
    player.skin.body.setSize(24, 24)
    player.skin.body.setOffset(4, 4)
    
    // player és tile-ek közötti ütközés
    player.skin.body.setCircle(13)
    this.physics.add.collider(player.skin, blocklayer)
    this.physics.add.collider(player.skin, this.destroyableBlocks)
  }

  createPlayerHUD() {
    return{
      fill: this.add.group(),
      empty: this.add.group()
    }
  }

  //HUD felépítése: fej, név, életek és bombák. A jobb oldali HUD tükrözve, jobbról balra épül.
  buildPlayerHUD(player, headKey, label, side) {
    const right = side === 'right'
    const centerY = sizes.hudHeight / 2
    let head
    if (side === 'right'){
      head = this.add.image(right ? sizes.screenWidth - 10 : 10, centerY, headKey, null).setOrigin(right ? 1 : 0, 0.5).setFlipX(true)
    }
    else{
      head = this.add.image(right ? sizes.screenWidth - 10 : 10, centerY, headKey, null).setOrigin(right ? 1 : 0, 0.5)
    }
    const name = this.add.text(right ? head.x - head.width - 5 : head.x + head.width + 5, centerY, label).setOrigin(right ? 1 : 0, 0.5)
    const startX = right ? name.x - name.width : name.x + name.width

    player.HUD = {
      hpHUD: this.createPlayerHUD(),
      bombHUD: this.createPlayerHUD(),
      originX: right ? 1 : 0,
      direction: right ? -1 : 1,
      step: sizes.tileSize / 1.5 + 2,
      hpY: centerY - 7.5,
      bombY: centerY + 9.5
    }
    for (let i = 0; i < player.hp; i++) {
      this.addHudIcon(player, player.HUD.hpHUD.fill, startX + player.HUD.direction * i * player.HUD.step, player.HUD.hpY, 'hp', 0)
    }
    for (let i = 0; i < player.bombs; i++) {
      this.addHudIcon(player, player.HUD.bombHUD.fill, startX + player.HUD.direction * i * player.HUD.step, player.HUD.bombY, 'bomb_hp', 0)
    }
  }

  addHudIcon(player, group, x, y, key, frame) {
    return group.create(x, y, key, frame).setOrigin(player.HUD.originX, 0.5).setScale(0.60)
  }

  nextBombHudX(player) {
    return player.HUD.bombHUD.fill.getChildren().slice(-1)[0].x + player.HUD.direction * player.HUD.step
  }

  playerExplsoionHit(player) {
      player.hp -= 1
      const lastHp = player.HUD.hpHUD.fill.getChildren().slice(-1)[0]
      this.addHudIcon(player, player.HUD.hpHUD.empty, lastHp.x, lastHp.y, 'hp', 1)
      player.HUD.hpHUD.fill.getChildren().slice(-1)[0].destroy()
      return true
  }
    
  gameOver(){
    if (this.isGameOver) return
    this.isGameOver = true
    this.saveWin()
    this.scene.pause('GameScene')
    this.scene.launch('GameOverScene')
  }

  //Győztes mentése a pálya ranglistájához (csak közösségi pályán, teszt játéknál nem)
  saveWin(){
    if (this.mapId === null || this.editorTest) return
    const opponent = this.numberOfPlayers === 2 ? this.players.second : this.players.ai
    const firstDead = this.players.first.hp <= 0
    const opponentDead = opponent.hp <= 0
    if (firstDead === opponentDead) return //döntetlen

    const winner = !firstDead ? 'Player 1' : (this.numberOfPlayers === 2 ? 'Player 2' : 'AI')
    fetch(`${API_URL}/maps/${this.mapId}/win`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({browser_id: getBrowserId(), winner})
    }).catch(err => console.error('Error saving win:', err))
  }

  powerUpDrop(bombNumber){
    return Math.random() < this.dropChance
  }
  
  powerUpType() {
    const r = Math.random()
    if (r < this.powerUpOne) return 0                       
    if (r < this.powerUpOne + this.powerUpTwo) return 1    
    return 2
  }

  powerUpPickUp(player, powerUp) {
        if (powerUp.frame.name === 0) {
          if (player.bombs < this.maxBombNumber + this.extraBombNumber) {
            player.bombs++
            if (player.bombs > this.maxBombNumber) {
              this.addHudIcon(player, player.HUD.bombHUD.fill, this.nextBombHudX(player), player.HUD.bombY, 'bomb_hp', this.BombType(player.bombs))
            }
            else if (player.bombs <= this.maxBombNumber) {
              this.addHudIcon(player, player.HUD.bombHUD.fill, player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, player.HUD.bombY, 'bomb_hp', this.BombType(player.bombs))
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
              this.addHudIcon(player, player.HUD.bombHUD.fill, this.nextBombHudX(player), player.HUD.bombY, 'bomb_hp', 2)
            }
            else if (player.HUD.bombHUD.empty.getChildren().length > 0) {
              this.addHudIcon(player, player.HUD.bombHUD.fill, player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, player.HUD.bombY, 'bomb_hp', 0)
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
              this.addHudIcon(player, player.HUD.bombHUD.fill, this.nextBombHudX(player), player.HUD.bombY, 'bomb_hp', 2)
            }
            else if (player.HUD.bombHUD.empty.getChildren().length > 0) {
              this.addHudIcon(player, player.HUD.bombHUD.fill, player.HUD.bombHUD.empty.getChildren().slice(-1)[0].x, player.HUD.bombY, 'bomb_hp', 0)
              this.emptyBombDestroy(player)
            }
          }
        }
        powerUp.destroy()
        return player.bombs
  }

  powerUpPutRandomly(player, enemy){
      this.powerUps.getChildren().forEach(powerUp =>
        {if (powerUp.getData('owner') === player.number) {return}
      })

      let possibleTile = []
      const range = 2
      const px = calculateCordinateX(player.skin.x)
      const py = calculateCordinateY(player.skin.y)
      const ex = calculateCordinateX(enemy.skin.x)
      const ey = calculateCordinateY(enemy.skin.y)

      for (let tilex = -range; tilex <= range; tilex++){
        for (let tiley = -range; tiley <= range; tiley++){
          if (py + tiley > 0 && py + tiley < sizes.mapSize - 1 && px + tilex > 0 && px + tilex < sizes.mapSize - 1) 
            if(this.mapData[py + tiley][px + tilex] == 0){
              possibleTile.push({x: px + tilex, y: py + tiley})
            }
        }
      }

      const aiBomb = player.bomb ? {x: calculateCordinateX(player.bomb.x), y: calculateCordinateY(player.bomb.y)} : false
      const enemyBomb = enemy.bomb ? {x: calculateCordinateX(enemy.bomb.x), y: calculateCordinateY(enemy.bomb.y)} : false
    
      
      possibleTile = possibleTile.filter(tile =>
        !(aiBomb && aiBomb.x === tile.x && aiBomb.y === tile.y) &&
        !(enemyBomb && enemyBomb.x === tile.x && enemyBomb.y === tile.y) &&
        !(px == tile.x && py == tile.y) &&
        !(ex == tile.x && ey == tile.y)
      )

      if (this.powerUps != undefined || this.powerUps != null)
      {
        possibleTile = possibleTile.filter(tile => 
          !this.powerUps.getChildren().some(obj => 
          calculateCordinateX(obj.x) === tile.x &&
          calculateCordinateY(obj.y) === tile.y)
        )
      }

      if (possibleTile.length === 0) return
      else {
        const tile = Phaser.Utils.Array.GetRandom(possibleTile)
        const powerUp = this.powerUps.create(calculateCordinateXpx(tile.x), calculateCordinateYpx(tile.y), 'bomb_powerup', this.powerUpType()).setOrigin(0, 0)
        powerUp.setData('owner', player.number)
        this.powerUps.getChildren().forEach(powerUp => {
                  powerUp.body.setImmovable(true)
                  powerUp.body.allowGravity = false
                })
      }
      console.log(possibleTile)
  }

  bombHit(player, enemyPlayer){
    if (player.hit != true && (player.isExplosionPlaying == true || enemyPlayer.isExplosionPlaying == true)) {
      if (this.physics.overlap(player.skin, this.explosion) == true) {
        player.hit = this.playerExplsoionHit(player)
      }
    }
  }

  bombPlace(player){
        player.bomb = this.physics.add.sprite(calculateCordinateXpx(calculateCordinateX(player.skin.body.x)), calculateCordinateYpx(calculateCordinateY(player.skin.body.y)), 'bomb', 0).setOrigin(0, 0)
        player.bomb.body.allowGravity = false
        player.bomb.body.setImmovable(true)
        player.bomb.setCollideWorldBounds(true)
        this.bombCollider(this.players, player.bomb)
        const lastBomb = player.HUD.bombHUD.fill.getChildren().slice(player.bombs - 1)[0]
        this.emptyBomb(player, lastBomb)
        player.HUD.bombHUD.fill.getChildren().slice(-1)[0].destroy()
        player.bombs--
  }

  blastRange(player){
    if (player.bomb == null || player.bomb == undefined) {return true}
    let blastTiles = []
    let inRange = 0
    let bombx = calculateCordinateX(player.bomb.x)
    let bomby = calculateCordinateY(player.bomb.y)
    let right = 0, left = 0, up = 0, down = 0

    for (let i = 1; i <= this.explosionSize; i++) {
      if (right === 0 && this.tileAt(bombx + i, bomby) != 1){
        blastTiles.push({x: bombx + i , y: bomby})
      }else {right = 1}

      if (left === 0 && this.tileAt(bombx - i, bomby) != 1){
        blastTiles.push({x: bombx - i , y: bomby})
      }else {left = 1}

      if (down === 0 && this.tileAt(bombx, bomby + i) != 1){
        blastTiles.push({x: bombx, y: bomby + i})
      }else {down = 1}

      if (up === 0 && this.tileAt(bombx, bomby - i) != 1){
        blastTiles.push({x: bombx, y: bomby - i})
      }else {up = 1}
    }

    for (let blast of blastTiles){
      if (blast.x == calculateCordinateX(player.skin.x + player.skin.body.width) && blast.y == calculateCordinateY(player.skin.y + player.skin.body.height)){
        inRange++
      }
    }

    if (inRange > 0) {return false}
    else{return true}
  }

  bombExplosion(player, enemy){
        player.isExplosionPlaying = true
        this.explosion.create(player.bomb.x, player.bomb.y, 'explosion', 1,).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === player.bomb.x && explosion.y === player.bomb.y) {
          explosion.playerID = player.number
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
        })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", this.explosionSize, player.bomb.y, player.bomb.x, player.number)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", this.explosionSize, player.bomb.y, player.bomb.x, player.number)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", this.explosionSize, player.bomb.y, player.bomb.x, player.number)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", this.explosionSize, player.bomb.y, player.bomb.x, player.number)

        
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          if (explosion.playerID === player.number){
            if (this.physics.overlap(player.skin, explosion) && player.hit){
              player.hit = false
            }
            if (this.physics.overlap(enemy.skin, explosion) && enemy.hit){
              enemy.hit = false
            }
            explosion.destroy()
          }
        })
        player.isExplosionPlaying = false
      }, 800)

      player.bomb.destroy()
      player.bomb = undefined
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
      this.addHudIcon(player, player.HUD.bombHUD.empty, lastBomb.x, lastBomb.y, 'bomb_hp', 1)
    }
  }

  emptyBombDestroy(player) {
      player.HUD.bombHUD.empty.getChildren().slice(-1)[0].destroy()
  }

  explosionXRangeCalculator(direction, explosionSize, y, x, id) {

    for (let i = 1; i < explosionSize; i++) {
        if (this.mapData[calculateCordinateY(y)][calculateCordinateX(x) + (direction === "right" ? i : -i)] === 2) {
          this.destroyableBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)) && block.y === calculateCordinateYpx(calculateCordinateY(y))) {
              block.destroy()
              this.mapData[calculateCordinateY(block.y)][calculateCordinateX(block.x)] = 0
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
              explosion.playerID = id
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(y)][calculateCordinateX(x) + (direction === "right" ? i : -i)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)), calculateCordinateYpx(calculateCordinateY(y)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(x) + (direction === "right" ? i : -i)) && explosion.y === calculateCordinateYpx(calculateCordinateY(y))) {
                explosion.playerID = id
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }   
      }
  }

  explosionYRangeCalculator(direction, explosionSize, y, x, id) {
    
   for (let i = 1; i < explosionSize; i++) {
        if (this.mapData[calculateCordinateY(y) + (direction === "up" ? i : -i)][calculateCordinateX(x)] === 2) {
          this.destroyableBlocks.getChildren().forEach(block => {
            if (block.x === calculateCordinateXpx(calculateCordinateX(x)) && block.y === calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i))) {
              block.destroy()
              this.mapData[calculateCordinateY(block.y)][calculateCordinateX(block.x)] = 0
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
              explosion.playerID = id
              explosion.body.allowGravity = false
              explosion.anims.play("explosion", true)
            }
          })
        }
        else if (this.mapData[calculateCordinateY(y) + (direction === "up" ? i : -i)][calculateCordinateX(x)] === 0) {
            this.explosion.create(calculateCordinateXpx(calculateCordinateX(x)), calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i)), 'explosion', 1).setOrigin(0, 0)
            this.explosion.getChildren().forEach(explosion => {
              if(explosion.x === calculateCordinateXpx(calculateCordinateX(x)) && explosion.y === calculateCordinateYpx(calculateCordinateY(y) + (direction === "up" ? i : -i))) {
                explosion.playerID = id
                explosion.body.allowGravity = false
                explosion.anims.play("explosion", true)
              }
            })
        }
        else { break }
      }
  }

}