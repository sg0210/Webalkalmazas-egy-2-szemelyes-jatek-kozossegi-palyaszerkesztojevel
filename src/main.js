import './style.css'
import Phaser, { Physics } from 'phaser'
import {GameScene} from "./gameScene"
import {sizes} from "./gameScene"
import {speedDown} from "./gameScene"
import {MapEditor} from "./mapEditor"
import { LandScene } from './landScene'
import { MenuScene } from './menuScene'
import { PlayerSelectScene } from './playerSelectScene'
import { GameOverScene } from './gameOverScene'

const config = {
  type:Phaser.WEBGL,
  height: sizes.screenHeight,
  width: sizes.screenWidth,
  canvas: gameCanvas,
  scale:{
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    resizeInterval: 0
  },
  scene: [LandScene, MapEditor, GameScene, MenuScene, PlayerSelectScene, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: speedDown },
      debug: true
    }
  },
  render: {
    pixelArt: true
  },
}

const game = new Phaser.Game(config)

