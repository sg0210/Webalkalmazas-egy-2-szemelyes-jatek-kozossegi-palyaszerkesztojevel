import './style.css'
import Phaser, { CANVAS } from 'phaser'

const sizes = {
  width: 500,
  height: 500
}

const config = {
  type: Phaser.AUTO,
  width: sizes.width,
  height: sizes.height,
  canvas: document.getElementById('gameCanvas')
}

const game = new Phaser.Game(config)
