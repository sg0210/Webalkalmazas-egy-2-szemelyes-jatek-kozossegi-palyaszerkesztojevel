import './style.css'
import Phaser, { Physics } from 'phaser'



const sizes = {
  width:500,
  height:500
}

const speedDown = 2100;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
  }

  preload() {
    this.load.image('bg', 'assets/default_map.png')
    this.load.image('player', 'assets/player.png') 
  }
  create() {
    this.add.image(0, 0, 'bg').setOrigin(0, 0)
    this.player = this.physics.add.image(85, 250, 'player').setOrigin(0, 0)
    this.player.body.allowGravity = false
  }
  update() {}
}

const config = {
  type:Phaser.WEBGL,
  width:sizes.width,
  height:sizes.height,
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
