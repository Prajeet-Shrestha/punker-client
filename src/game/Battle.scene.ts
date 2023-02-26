import Phaser, { Game, Scene, Scenes } from 'phaser';
import socketService from '../socket/socketService';
import { Character } from './gameObject/Character';
import { Infantry } from './gameObject/enemies/Infantry';

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
    this.load.spritesheet('player_shoot', './shoot with FX.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_idle_wake', './static wake.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_damage', './damage.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_dead', './dead.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('player_dead_idle', './dead_idle.png', { frameWidth: 40, frameHeight: 26 });
    this.load.spritesheet('infantry_move', './Red/Run.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('infantry_dead', './Red/Dead.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('infantry_idle', './Red/Idle.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('infantry_damage', './Red/damage.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('infantry_dead_idle', './Red/Dead_idle.png', { frameWidth: 48, frameHeight: 48 });
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
  infantyAnim(scene, spriteSheet) {
    scene.anims.create({
      key: 'INFANTRY_MOVE_RIGHT',
      frames: spriteSheet.move,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'INFANTRY_MOVE_LEFT',
      frames: spriteSheet.move,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'INFANTRY_IDLE',
      frames: spriteSheet.idle,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'INFANTRY_SHOOT',
      frames: spriteSheet.shoot,
      frameRate: 22,
      repeat: -1,
    });

    scene.anims.create({
      key: 'INFANTRY_DAMAGE',
      frames: spriteSheet.damage,
      frameRate: 12,
      repeat: 1,
    });
    scene.anims.create({
      key: 'INFANTRY_IDLE_DEAD',
      frames: spriteSheet.dead_idle,
      frameRate: 1,
      repeat: 1,
    });
    scene.anims.create({
      key: 'INFANTRY_DEAD',
      frames: spriteSheet.dead,
      frameRate: 12,
      repeat: 1,
    });
  }
  create() {
    let self = this;
    this.infantyAnim(this, {
      move: 'infantry_move',
      idle: 'infantry_idle',
      shoot: '',
      damage: 'infantry_damage',
      dead: 'infantry_dead',
      dead_idle: 'infantry_dead_idle',
    });
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

    // this.tesst = new Character(
    //   'c_1',
    //   500,
    //   500,
    //   this.player_keys,
    //   {
    //     maxX: this.sys.canvas.width,
    //     minX: 0,
    //     maxY: this.sys.canvas.height,
    //     minY: this.sys.canvas.height * 0.23,
    //   },
    //   this
    // );

    this.otherPlayer = {
      c_1: new Character(
        'c_1',
        200,
        300,
        this.player_keys,
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height * 0.23,
        },
        this
      ),
      c2_1: new Character(
        'c2_1',
        200,
        500,
        this.player_keys,
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height * 0.23,
        },
        this
      ),
      c_2: new Infantry(
        'c_2',
        750,
        700,
        {
          move: 'infantry_move',
          idle: 'infantry_idle',
          shoot: '',
          damage: 'infantry_damage',
          dead: 'infantry_dead',
          dead_idle: 'infantry_dead_idle',
        },
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
      c_3: new Infantry(
        'c_3',
        600,
        500,
        {
          move: 'infantry_move',
          idle: 'infantry_idle',
          shoot: '',
          damage: 'infantry_damage',
          dead: 'infantry_dead',
          dead_idle: 'infantry_dead_idle',
        },
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
      i_1: new Infantry(
        `i_1`,
        600,
        200,
        {
          move: 'infantry_move',
          idle: 'infantry_idle',
          shoot: '',
          damage: 'infantry_damage',
          dead: 'infantry_dead',
          dead_idle: 'infantry_dead_idle',
        },
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
      i_11: new Infantry(
        `i_11`,
        570,
        320,
        {
          move: 'infantry_move',
          idle: 'infantry_idle',
          shoot: '',
          damage: 'infantry_damage',
          dead: 'infantry_dead',
          dead_idle: 'infantry_dead_idle',
        },
        {
          maxX: this.sys.canvas.width,
          minX: 0,
          maxY: this.sys.canvas.height,
          minY: this.sys.canvas.height - 700,
        },
        this
      ),
    };
    // new Infantry(
    //   `i_1`,
    //   Math.floor(Math.random() * this.sys.canvas.width - 200) + 100,
    //   Math.floor(Math.random() * this.sys.canvas.height * 0.7) + this.sys.canvas.height * 0.23,
    //   {
    //     move: 'infantry_move',
    //     idle: 'infantry_idle',
    //     shoot: '',
    //     damage: 'infantry_damage',
    //     dead: 'infantry_dead',
    //     dead_idle: 'infantry_dead_idle',
    //   },
    //   {
    //     maxX: this.sys.canvas.width,
    //     minX: 0,
    //     maxY: this.sys.canvas.height,
    //     minY: this.sys.canvas.height - 700,
    //   },
    //   this
    // ).shoot();
    Object.keys(this.otherPlayer).map((res) => {
      this.playerObjectList.push(this.otherPlayer[res].gameObject);
    });
    this.physics.add.collider(this.otherPlayer.c_1.gameObject, this.playerObjectList);
  }
  otherPlayer;
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
      movement.left = true;
    }
    if (this.cursors.left.isUp) {
      movement.left = false;
    }
    if (this.cursors.right.isDown) {
      movement.right = true;
    }
    if (this.cursors.right.isUp) {
      movement.right = false;
    }
    if (this.cursors.up.isDown) {
      movement.up = true;
    }
    if (this.cursors.up.isUp) {
      movement.up = false;
    }
    if (this.cursors.down.isDown) {
      movement.down = true;
    }
    if (this.cursors.down.isUp) {
      movement.down = false;
    }
    if (this.cursors.space.isDown) {
      movement.space = true;
    }
    if (this.cursors.space.isUp) {
      movement.space = false;
    }
    this.otherPlayer.c_1.move(movement);
    // console.log(this);
  }
}
