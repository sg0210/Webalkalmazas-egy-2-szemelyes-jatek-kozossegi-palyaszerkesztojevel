import './style.css'
import Phaser, { Physics } from 'phaser'
import {GameScene} from "./gameScene"
import {sizes} from "./gameScene"
import {speedDown} from "./gameScene"
import {MapEditor} from "./mapEditor"

const config = {
  type:Phaser.WEBGL,
  width: sizes.screenWidth,
  height: sizes.screenHeight,
  canvas: gameCanvas,
  scene: [MapEditor],
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

