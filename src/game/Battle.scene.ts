import Phaser, { Game, Scene, Scenes } from 'phaser';
import socketService from '../socket/socketService';
import { Character } from './gameObject/Character';

export default class BattleScene extends Scene {
  constructor() {
    const sceneConfig = {
      key: 'BattleScene',
    };
    super(sceneConfig);
  }
  player_keys = {
    move: 'player_move',
    idle: 'player_idle',
    shoot: 'player_shoot',
    wake: 'player_wake',
    idle_wake: 'player_idle_wake',
    damage: 'player_damage',
    dead: 'player_dead',
    dead_idle: 'player_dead_idle',
  };
  preload() {
    this.load.image('background', './bg.png');
    this.load.image('ship', './spaceShips_001.png');
    this.load.image('otherPlayer', './enemyBlack5.png');
    this.load.spritesheet('player_move', './player_move.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_idle', './static idle.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_wake', './wake.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_shoot', './shoot with FX.png', { frameWidth: 117, frameHeight: 26 });
    this.load.spritesheet('player_idle_wake', './static wake.png', { frameWidth: 117, frameHeight: 26 });
    this.load.spritesheet('player_damage', './damage.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_dead', './dead.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_dead_idle', './dead_idle.png', { frameWidth: 40, frameHeight: 26 });
    this.load.image('bullet', './bullet.png');
  }
  setBackground(self: Scene) {
    let bg = self.add.image(0, 0, 'background').setOrigin(0);
    bg.setScale(Math.max(self.cameras.main.width / bg.width, self.cameras.main.height / bg.height));
  }
  players;
  playerList = [];
  playerObjectList = [];
  tesst: Character;
  create() {
    let self = this;
    this.players = this.add.group();
    this.physics.world.setBounds(
      0,
      this.sys.canvas.height * 0.23,
      this.sys.canvas.width,
      this.sys.canvas.height * 0.76
    );
    self.setBackground(self);
    // socketService.socket.on('newPlayer', (playerInfo) => {
    //   console.log('new Player!!');
    //   self.playerList.push(playerInfo.playerId);
    //   self.displayPlayers(playerInfo, 'otherPlayer');
    // });

    // socketService.socket.on('currentPlayers', function (players) {
    //   console.log('currentPlayers!!!');
    //   Object.keys(players).forEach(function (id) {
    //     if (players[id].playerId === socketService.socket.id) {
    //       self.displayPlayers(players[id], 'ship');
    //     } else {
    //       self.displayPlayers(players[id], 'otherPlayer');
    //     }
    //   });
    // });

    // socketService.socket.on('playerUpdates', function (players) {
    //   // console.log('ps');
    //   console.log(players);
    //   Object.keys(players).forEach(function (id) {
    //     self.players.getChildren().forEach(function (player) {
    //       if (players[id].playerId === player.playerId) {
    //         // player.setRotation(players[id].rotation);
    //         // player.setPosition(players[id].x, players[id].y);
    //       }
    //     });
    //   });
    // });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
    this.upKeyPressed = false;

    this.tesst = new Character(
      'c_1',
      500,
      500,
      this.player_keys,
      {
        maxX: this.sys.canvas.width,
        minX: 0,
        maxY: this.sys.canvas.height,
        minY: this.sys.canvas.height * 0.23,
      },
      this
    );

    this.test2 = {
      c_2: new Character(
        'c_2',
        Math.floor(Math.random() * 700) + 550,
        Math.floor(Math.random() * 400) + 200,
        this.player_keys,
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
      c_3: new Character(
        'c_3',
        Math.floor(Math.random() * 600) + 550,
        Math.floor(Math.random() * 400) + 200,
        this.player_keys,
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
    };
    Object.keys(this.test2).map((res) => {
      this.playerObjectList.push(this.test2[res].gameObject);
    });
    this.physics.add.collider(this.tesst.gameObject, this.playerObjectList);
  }
  test2;
  leftKeyPressed;
  rightKeyPressed;
  upKeyPressed;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  displayPlayers(playerInfo, sprite) {
    console.log(playerInfo);
    const player: Phaser.GameObjects.Sprite = this.add
      .sprite(playerInfo.x, playerInfo.y, sprite)
      .setOrigin(0, 0)
      .setDisplaySize(53, 40);
    player.setData({ playerId: playerInfo.playerId });

    // player.data.list['playerId'];
    this.players.add(player);
  }

  update() {
    // player.body.setZeroVelocity();
    let self = this;
    const speed = 240;
    let movement = {
      up: false,
      left: false,
      right: false,
      down: false,
      space: false,
    };

    if (this.cursors.left.isDown) {
      // this.tesst.setVelocityX(-speed);
      movement.left = true;
    }
    if (this.cursors.left.isUp) {
      // this.tesst.setVelocityX(0);
      movement.left = false;
    }
    if (this.cursors.right.isDown) {
      movement.right = true;
      // this.tesst.setVelocityX(speed);
    }
    if (this.cursors.right.isUp) {
      // this.tesst.setVelocityX(0);
      movement.right = false;
    }
    if (this.cursors.up.isDown) {
      // this.tesst.setVelocityY(-speed);
      movement.up = true;
    }
    if (this.cursors.up.isUp) {
      movement.up = false;
      // this.tesst.setVelocityY(0);
    }
    if (this.cursors.down.isDown) {
      // this.tesst.setVelocityY(speed);
      movement.down = true;
    }
    if (this.cursors.down.isUp) {
      movement.down = false;
      // this.tesst.setVelocityY(0);
    }
    if (this.cursors.space.isDown) {
      movement.space = true;
    }
    if (this.cursors.space.isUp) {
      movement.space = false;
    }
    this.tesst.move(movement);
  }
}
