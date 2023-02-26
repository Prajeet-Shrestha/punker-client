import { Game } from 'phaser';
import Phaser from 'phaser';
import BattleScene from './Battle.scene';
export class PhaserGame {
  game: Game | null = null;
  constructor() {}

  start() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'canvas_game',
      autoFocus: true,
      width: '100%',
      height: '100%',
      physics: {
        default: 'arcade',
        arcade: {
          fps: 60,
          // gravity: { y: 300 },
          debug: false,
        },
      },
      render: {
        // antialias: true,
        // antialiasGL: true,
        desynchronized: false,
        pixelArt: true,
        // context: "CanvasRenderingContext2D",
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'high-performance', // 'high-performance', 'low-power' or 'default'
        batchSize: 4096,
        maxLights: 10,
        maxTextures: -1,
        mipmapFilter: 'LINEAR_MIPMAP_NEAREST', // 'NEAREST', 'LINEAR', 'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST', 'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR'
      },
      dom: {
        createContainer: true,
      },
      fps: {
        target: 30,
        min: 20,
        forceSetTimeOut: true,
      },

      scene: [BattleScene],
      backgroundColor: '#000000',
      // backgroundColor: "#9497a8",
      scale: {
        mode: Phaser.Scale.NONE,
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: 1,
      },
    };
    if (this.game === null) {
      console.log('Initiating game');
      this.game = new Phaser.Game(config);
    }
  }
}
