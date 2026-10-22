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
  }
  
  init (data) {
    this.numberOfPlayers = data.numberOfPlayers
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
      this.players.ai = {
        move: undefined
      }
      this.players.ai.move = {
        target: undefined,
        isMoving: false
      }
    }
  }

  preload() {

    const loadingbg = this.add.graphics()
    loadingbg.fillStyle(0x222222, 0.8)
    loadingbg.fillRect(
      sizes.width / 2,
      sizes.height / 2,
      320,
      50
    )

    const loadingbar = this.add.graphics()

    const loadingpercentage = this.add.text(
      sizes.width / 2,
      sizes.height / 2 + 50,
      '0%',
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    ).setOrigin(0.5)

    this.load.on('progress', (value) => {
      loadingbar.clear()
      loadingbar.fillStyle(0x00ff00, 1)
      loadingbar.fillRect(
        sizes.width / 2 - 150,
        sizes.height / 2 - 15,
        300* value,
        30
      )

      loadingpercentage.setText(
        Math.floor(value * 100) + '%'
      )

    })

    this.load.once('complete', () => {
      loadingbar.destroy()
      loadingbg.destroy()
      loadingpercentage.destroy()
    })

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

    //HUD group létrehozása
    
    this.players.first.HUD = {hpHUD: this.createPlayerHUD(), bombHUD: this.createPlayerHUD()}
    for (let i = 0; i < this.players.first.hp; i++) {
         this.players.first.HUD.hpHUD.fill.create(0 + (5 + i * (sizes.tileSize / 1.5 + 2)), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
    }
    for (let i = 0; i < this.players.first.bombs; i++) {
        this.players.first.HUD.bombHUD.fill.create(0 + (5 + i * (sizes.tileSize / 1.5 + 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
    }
    if (this.numberOfPlayers === 2) {
      this.players.second.HUD = {hpHUD: this.createPlayerHUD(),
                                 bombHUD: this.createPlayerHUD()}
      for (let i = 0; i < this.players.second.hp; i++) {
         this.players.second.HUD.hpHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
      }
      for (let i = 0; i < this.players.second.bombs; i++) {
        this.players.second.HUD.bombHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
      }
    }
    else {
      this.players.ai.HUD = {hpHUD: this.createPlayerHUD(),
                                 bombHUD: this.createPlayerHUD()}
      for (let i = 0; i < this.players.ai.hp; i++) {
         this.players.ai.HUD.hpHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5, 'hp', 0).setOrigin(0, 0).setScale(0.75)
      }
      for (let i = 0; i < this.players.ai.bombs; i++) {
        this.players.ai.HUD.bombHUD.fill.create(sizes.screenWidth - (5 + (i + 1) * (sizes.tileSize / 1.5 + 2)), 5 + sizes.tileSize / 1.5 + 2, 'bomb_hp', 0).setOrigin(0, 0).setScale(0.75)
      }
    }

    //Players karakter létrehozása
    this.createCharacter(this.players.first, 1, 1, blocklayer)
    if (this.numberOfPlayers === 2) {
      this.createCharacter(this.players.second, playerSecondStartX, playerSecondStartY, blocklayer)
    }
    else{
      this.createCharacter(this.players.ai, 14, 14, blocklayer)
    }

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
    
    this.powerUps = this.physics.add.group()
    
    this.nextThinkTime = 0
    
  }
  update(time, delta) {

    if (this.players.first.hp === 0 || this.numberOfPlayers != 2 ? this.players.ai.hp === 0 : false || this.numberOfPlayers === 2 ? this.players.second.hp === 0 : false)
    {
      this.gameOver()
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyV)){
    }
  
    //Karakter mozgás
    this.characterControl(this.players.first, this.numberOfPlayers === 2 ? this.players.second : this.players.ai)
    this.numberOfPlayers === 2 ? this.characterControl(this.players.second, this.players.first) : false
    if (this.numberOfPlayers != 2 && !this.players.ai.move.isMoving) {setTimeout(() => {
      if (time >= this.nextThinkTime){
      const result = this.possibleMovementTile(this.players.ai)
      this.players.ai.move.target = result.tile
      this.players.ai.move.isMoving = result.canMove
      this.nextThinkTime = time + 1000
      console.log("Megy")}
    }, 3000)}
    else {
      this.aiMovement(this.players.ai)
    }


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
    if (this.players.first.bombs === 0 && this.players.first.bombEmpty === false){
      this.players.first.bombEmpty = this.powerUpPutRandomly(this.players.first)
    }

    if (this.numberOfPlayers === 2 && this.players.second.bombs === 0 && this.players.first.bombEmpty === false){
      this.players.second.bombEmpty = this.powerUpPutRandomly(this.players.second)
    }

    if (this.players.first.bombEmpty === true && this.players.first.bombs > 0) {
      this.players.first.bombEmpty = false
    }

    if (this.numberOfPlayers === 2 && this.players.second.bombEmpty === true && this.players.second.bombs > 0) {
      this.players.second.bombEmpty = false
    }

    if (this.keyEsc.isDown) {
          this.scene.pause('GameScene')  
          this.scene.launch('MenuScene')
          this.registry.set('previousScene', 'GameScene')
        }

  }

  aiMovement(player){
    const tx = calculateCordinateXpx(player.move.target.x)
    const ty = calculateCordinateYpx(player.move.target.y)
    const dx = tx - player.skin.x
    const dy = ty - player.skin.y

    const tolarenc = Math.max(2, this.playerSpeed * this.game.loop.delta / 1000)

    if (Math.abs(dx) <= tol && Math.abs <= tol) {
      player.skin.setVelocityX(0)
      player.skin.setVelocityY(0)
      player.move.isMoving = false
    }

    /*if (player.skin.x != player.move.target.x && player.skin.y != player.move.target.y){
      if (player.skin.x > calculateCordinateXpx(player.move.target.x)){
        player.skin.setVelocityX(-this.playerSpeed)
        console.log("Player:",player.skin.x,player.skin.y)
        console.log("Target:",calculateCordinateXpx(player.move.target.x),calculateCordinateYpx(player.move.target.y))
        console.log("Megy X-:",player.move.isMoving)
      }
      else if (player.skin.x < calculateCordinateXpx(player.move.target.x)){
        player.skin.setVelocityX(this.playerSpeed)
        console.log("Player:",player.skin.x,player.skin.y)
        console.log("Target:",calculateCordinateXpx(player.move.target.x),calculateCordinateYpx(player.move.target.y))
        console.log("Megy X:",player.move.isMoving)
      }
      else {player.skin.setVelocityX(0), player.move.isMoving = false}
      
      if (player.skin.y < calculateCordinateYpx(player.move.target.y)){
        player.skin.setVelocityY(this.playerSpeed)
        console.log("Player:",player.skin.x,player.skin.y)
        console.log("Target:",calculateCordinateXpx(player.move.target.x),calculateCordinateYpx(player.move.target.y))
        console.log("Megy y:",player.move.isMoving)
      }
      else if (player.skin.y > calculateCordinateYpx(player.move.target.y)){
        player.skin.setVelocityY(-this.playerSpeed)
        console.log("Player:",player.skin.x,player.skin.y)
        console.log("Target:",calculateCordinateXpx(player.move.target.x),calculateCordinateYpx(player.move.target.y))
        console.log("Megy y-:",player.move.isMoving)
      }
      else {player.skin.setVelocityY(0), player.move.isMoving = false}
    }*/


    /*if (playerX < calculateCordinateXpx(tile[0].x)){
      while (player.skin.x < calculateCordinateXpx(tile[0].x)){
        player.skin.x += 32
        if (this.players.ai.bomb && this.explosionCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 0 && this.bombCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 10){
          this.bombExplosion(player, enemy)
        }
      }
    }
    else if (playerX > calculateCordinateXpx(tile[0].x)){
      while (player.skin.x > calculateCordinateXpx(tile[0].x)){
        player.skin.x -= 32
        if (this.players.ai.bomb && this.explosionCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 0 && this.bombCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 10){
          this.bombExplosion(player, enemy)
        }
      }
    }

    if (playerY > calculateCordinateYpx(tile[0].y)){
      while (player.skin.y > calculateCordinateYpx(tile[0].y)){
        player.skin.y -= 32
        if (this.players.ai.bomb && this.explosionCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 0 && this.bombCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 10){
          this.bombExplosion(player, enemy)
        }
      }
    }else if (playerY < calculateCordinateYpx(tile[0].y)){
      while (player.skin.y < calculateCordinateYpx(tile[0].y)){
        player.skin.y += 32
        if (this.players.ai.bomb && this.explosionCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 0 && this.bombCheck(player.bomb, calculateCordinateX(player.skin.x), calculateCordinateY(player.skin.y)) === 10){
          this.bombExplosion(player, enemy)
        }
      }
    }*/
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

      if (this.mapData[newy][newx] === 2)
      {
        if (!player.bomb && player.isExplosionPlaying === false && player.bombs > 0){
          console.log("bomb")
          const result = this.bombPlace(player)
          player.bomb = result.bomb
          player.bombs = result.playerbombnumber
        }
      }
    }

    for (const dir of directions ){
      const newx = calculateCordinateX(player.skin.x) + dir.x
      const newy = calculateCordinateY(player.skin.y) + dir.y

      if (this.mapData[newy][newx] === 0) {
        walkableTile.push({x: newx, y: newy, score: this.scoreTile(newx, newy)})
        this.players.ai.lastVisited = { x: newx, y: newy}
      }
    }

    walkableTile.sort((a, b) => b.score - a.score)

    return {tile: walkableTile[0], canMove: true}
  }

  scoreTile(x, y){
    let score = 0
    
    score += this.bombCheck(this.players.first.bomb, x, y)
    score += this.bombCheck(this.players.ai.bomb, x, y)

    if (this.players.first.bomb) {score -= this.explosionCheck(this.players.first.bomb, x, y)}
    if (this.players.ai.bomb) {score -= this.explosionCheck(this.players.ai.bomb, x, y)}

    if (this.players.ai.lastVisited != undefined && x == this.players.ai.lastVisited.x && y == this.players.ai.lastVisited.y){
        score -= 1
    }

    this.players.ai.bombs < 3 ? score += this.powerupCheck(x, y) : false

    this.players.first.bomb || this.players.ai.bomb ? score -= this.deadendCheck(x, y) : false 

    return score
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

      if (this.mapData[newy][newx] != 0){
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
      if (right === 0 && this.mapData[bomby][bombx + i] != 1){
        explosionTiles.push({x: bombx + i, y: bomby})
      }else {right = 1}

      if (left === 0 && this.mapData[bomby][bombx - i] != 1){
        explosionTiles.push({x: bombx - i, y: bomby})
      }else {left = 1}

      if (down === 0 && this.mapData[bomby + i][bombx] != 1){
        explosionTiles.push({x: bombx, y: bomby + i})
      }else {down = 1}

      if (up === 0 && this.mapData[bomby - i][bombx] != 1){
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

  characterControl(player, enemy){
      if (player.keys.left.isDown && !player.hit) {
          player.skin.anims.play("walkLeft", true);
          player.skin.setVelocityX(-this.playerSpeed);  
      } else if (player.keys.right.isDown && !player.hit) {
          player.skin.anims.play("walkRight", true);
          player.skin.setVelocityX(this.playerSpeed);
      } else {
          player.skin.setVelocityX(0);
          player.skin.anims.stop();
      }

      if (player.keys.up.isDown && !player.hit) {
          player.skin.setVelocityY(-this.playerSpeed);
          player.skin.anims.play("walkUp", true);
      } else if (player.keys.down.isDown && !player.hit) {
          player.skin.setVelocityY(this.playerSpeed);
          player.skin.anims.play("walkDown", true);
      } else {
          player.skin.setVelocityY(0);
          player.skin.anims.stop();
      }

      if (player.keys.placeBomb.isDown && !player.bomb && player.isExplosionPlaying === false && player.bombs > 0) {
          const result = this.bombPlace(player)
          player.bomb = result.bomb
          player.bombs = result.playerbombnumber
      }

      if (Phaser.Input.Keyboard.JustDown(player.keys.explodeBomb) && player.bomb) {
        this.bombExplosion(player, enemy) 
      }
  }

  createPlayer(number)
  {
    return{number: number, skin: undefined, hp: 3, hit: false, bombs: 3, bomb: undefined, 
           bombEmpty: false, HUD: {}, isExplosionPlaying: false, keys: undefined, lastVisited: {}}
  }

  createCharacter(player, x, y, blocklayer) {
    player.hit = false
    player.skin = this.physics.add.sprite(calculateCordinateXpx(x), calculateCordinateYpx(y), 'player', 4).setOrigin(0, 0)
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
    this.time.delayedCall(0, () => {
      let possibleTile = []
      for (let i = 1; i <= 2; i++){
        if (calculateCordinateX(Math.floor(player.skin.x)) + i <= sizes.mapSize - 2 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) + i][calculateCordinateY(Math.floor(player.skin.y))] == 0){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) + i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }

        if (calculateCordinateX(Math.floor(player.skin.x)) - i >= 0 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) - i][calculateCordinateY(Math.floor(player.skin.y))] == 0){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) - i, y: calculateCordinateY(Math.floor(player.skin.y))})
        }

        if (calculateCordinateY(Math.floor(player.skin.y)) + i <= sizes.mapSize - 2 && this.mapData[calculateCordinateX(Math.floor(player.skin.x))][calculateCordinateY(Math.floor(player.skin.y)) + i] == 0){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)), y: calculateCordinateY(Math.floor(player.skin.y)) + i})
        }

        if (calculateCordinateY(Math.floor(player.skin.y)) - i >= 0 && this.mapData[calculateCordinateX(Math.floor(player.skin.x))][calculateCordinateY(Math.floor(player.skin.y)) - i] == 0){
          possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)), y: calculateCordinateY(Math.floor(player.skin.y)) - i})
        }
        
      }

      for (let i = 1; i <= 2; i++){
        for (let j = 1; j <= i; j++){
          if (calculateCordinateX(Math.floor(player.skin.x)) + i <= sizes.mapSize - 2 && calculateCordinateY(Math.floor(player.skin.y)) + j <= sizes.mapSize - 2 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) + i][calculateCordinateY(Math.floor(player.skin.y)) + j] == 0){
            possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) + i, y: calculateCordinateY(Math.floor(player.skin.y)) + j})
          }

          if (calculateCordinateX(Math.floor(player.skin.x)) + i <= sizes.mapSize - 2 && calculateCordinateY(Math.floor(player.skin.y)) - j >= 0 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) + i][calculateCordinateY(Math.floor(player.skin.y)) - j] == 0){
            possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) + i, y: calculateCordinateY(Math.floor(player.skin.y)) - j})
          }

          if (calculateCordinateX(Math.floor(player.skin.x)) - i <= 0 && calculateCordinateY(Math.floor(player.skin.y)) + j <= sizes.mapSize - 2 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) - i][calculateCordinateY(Math.floor(player.skin.y)) + j] == 0){
            possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) - i, y: calculateCordinateY(Math.floor(player.skin.y)) + j})
          }

          if (calculateCordinateX(Math.floor(player.skin.x)) - i <= 0 && calculateCordinateY(Math.floor(player.skin.y)) - j >= 0 && this.mapData[calculateCordinateX(Math.floor(player.skin.x)) - i][calculateCordinateY(Math.floor(player.skin.y)) - j] == 0){
            possibleTile.push({ x: calculateCordinateX(Math.floor(player.skin.x)) - i, y: calculateCordinateY(Math.floor(player.skin.y)) - j})
          }
        }
      }

      possibleTile.forEach((cordinate, rowIndex) =>{
        console.log("ID: " + rowIndex + " X: " + cordinate.x + " Y: " + cordinate.y )
      })

      /*this.powerUps.getChildren().forEach(powerUp => {
        for (let i = 0; i < possibleTile.length; i++) {
          if (powerUp.x === calculateCordinateXpx(possibleTile[i].x) && powerUp.y === calculateCordinateYpx(possibleTile[i].y)) {
            possibleTile.splice(i, 1)
          }
        }
      })

      if (player.bombs === 0){
        const tile = Phaser.Utils.Array.GetRandom(possibleTile)
        console.log("Tile: " + tile.x + " " + tile.y)
        this.powerUps.create(calculateCordinateXpx(tile.x), calculateCordinateYpx(tile.y), 'bomb_powerup', this.powerUpType()).setOrigin(0, 0)
                this.powerUps.getChildren().forEach(powerUp => {
                  powerUp.body.setImmovable(true)
                  powerUp.body.allowGravity = false
                })
      }*/
      console.log("Lefutott")
      player.bombEmpty = true
    })
  }

  bombHit(player, enemyPlayer){
    if (player.hit != true && (player.isExplosionPlaying == true || enemyPlayer.isExplosionPlaying == true)) {
      if (this.physics.overlap(player.skin, this.explosion) == true) {
        player.hit = this.playerExplsoionHit(player)
      }
    }
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
        player.bombs--
        return { bomb: playerBomb,
                 playerbombnumber: player.bombs 
        }
  }

  bombExplosion(player, enemy){
        this.explosion = this.physics.add.group()
        player.isExplosionPlaying = true
        this.explosion.create(player.bomb.x, player.bomb.y, 'explosion', 1).setOrigin(0, 0)
        this.explosion.getChildren().forEach(explosion => {
        if (explosion.x === player.bomb.x && explosion.y === player.bomb.y) {
          explosion.body.allowGravity = false
          explosion.anims.play("explosion", true)
        }
        })

      //robbanások létrehozása a bomba körül a megadott méretig, amíg nem ütköznek falba
      //x kordináta növelése
        this.explosionXRangeCalculator("right", this.explosionSize, player.bomb.y, player.bomb.x)

      //x kordináta csökkentése
        this.explosionXRangeCalculator("left", this.explosionSize, player.bomb.y, player.bomb.x)

      //y kordináta növelése
        this.explosionYRangeCalculator("up", this.explosionSize, player.bomb.y, player.bomb.x)

      //y kordináta csökkentése
        this.explosionYRangeCalculator("down", this.explosionSize, player.bomb.y, player.bomb.x)
      
    
      // robbanás animáció lejátszása és törlése
      setTimeout(() => {
        this.explosion.getChildren().slice().forEach(explosion => {
          explosion.destroy()
        })
        player.isExplosionPlaying = false
        player.hit = false
        enemy.hit = false
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