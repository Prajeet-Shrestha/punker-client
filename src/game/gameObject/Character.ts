import BattleScene from '../Battle.scene';
import { Bullets } from './Bullets';
interface keys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}
export class Character {
  gameObject: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  bullets: Bullets;
  speed: number = 200;
  public dimension: { height: number; width: number } = {
    height: 0,
    width: 0,
  };
  lastActiveState: number = 0;
  state: 'IDLE' | 'WAKE' | 'DEAD' = 'IDLE';
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  health: HealthBar;
  constructor(
    public id: string,
    public posX: number,
    public posY: number,
    public spriteSheet: {
      move: string;
      idle: string;
      idle_wake: string;
      shoot: string;
      wake: string;
      damage: string;
      dead: string;
      dead_idle: string;
    },
    public boundries: {
      maxX: number;
      maxY: number;
      minY: number;
      minX: number;
    },
    public scene: BattleScene
  ) {
    this.gameObject = this.scene.physics.add
      .sprite(posX, posY, spriteSheet.idle)
      .setOrigin(0, 0)
      .setScale(6)
      .setDepth(2);
    this.gameObject.setDrag(100);
    this.gameObject.setBodySize(10, 20);
    this.gameObject.setData({ id: id });
    this.gameObject.setAngularDrag(100);
    this.gameObject.setMaxVelocity(200);
    // this.gameObject.setTint(0xff00ff);

    this.health = new HealthBar(scene, this.gameObject.x, this.gameObject.y, this);
    this.dimension.height = this.gameObject.displayHeight;
    this.dimension.width = this.gameObject.displayWidth - 500;
    this.gameObject.body.setCollideWorldBounds(true);
    scene.anims.create({
      key: 'MOVE_RIGHT',
      frames: this.spriteSheet.move,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'MOVE_LEFT',
      frames: this.spriteSheet.move,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'IDLE',
      frames: this.spriteSheet.idle,
      frameRate: 12,
      repeat: -1,
    });
    scene.anims.create({
      key: 'SHOOT',
      frames: this.spriteSheet.shoot,
      frameRate: 22,
      repeat: -1,
    });
    scene.anims.create({
      key: 'WAKE',
      frames: this.spriteSheet.wake,
      frameRate: 12,
      repeat: 1,
    });
    scene.anims.create({
      key: 'DAMAGE',
      frames: this.spriteSheet.damage,
      frameRate: 10,
      repeat: 1,
    });
    scene.anims.create({
      key: 'IDLE_WAKE',
      frames: this.spriteSheet.idle_wake,
      frameRate: 1,
      repeat: 1,
    });
    scene.anims.create({
      key: 'IDLE_DEAD',
      frames: this.spriteSheet.dead_idle,
      frameRate: 1,
      repeat: 1,
    });
    scene.anims.create({
      key: 'DEAD',
      frames: this.spriteSheet.dead,
      frameRate: 12,
      repeat: 1,
    });
    this.bullets = new Bullets(scene);
    let self = this;
    scene.events.on('postupdate', function () {
      self.health.draw(true);
    });
  }
  boundriesValidator() {
    if (this.gameObject.y + this.gameObject.displayHeight >= this.boundries.maxY) {
      this.gameObject.setY(this.boundries.maxY - (this.gameObject.displayHeight + 10));
      this.gameObject.setVelocityY(0);
    }
    if (this.gameObject.y <= this.boundries.minY) {
      this.gameObject.setY(this.boundries.minY + 10);
      this.gameObject.setVelocityY(0);
    }
    if (this.gameObject.x + this.dimension.width >= this.boundries.maxX) {
      this.gameObject.setX(this.boundries.maxX - (this.dimension.width + 10));
      this.gameObject.setVelocityX(0);
    }
    if (this.gameObject.x <= this.boundries.minX) {
      this.gameObject.setX(this.boundries.minX + 2);
      this.gameObject.setVelocityX(0);
    }
  }
  isWakingUp: boolean = false;
  setDead() {
    this.state = 'DEAD';
    if (this.gameObject.anims.getName() != 'DEAD') {
      console.log('dead');
      this.gameObject.play('DEAD');
      let self = this;
      this.gameObject.on(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        function () {
          console.log('done!');
          if (self.gameObject.anims.getName() != 'IDLE_DEAD' && self.state == 'DEAD') {
            self.gameObject.play('IDLE_DEAD');
          }
        },
        this.scene
      );
    }
  }
  damageTaken() {
    if (this.gameObject.anims.getName() != 'DAMAGE' && this.state != 'DEAD') {
      console.log('damage1');
      this.gameObject.play('DAMAGE');
      this.health.decrease(10);
      if (this.health.value <= 0) {
        this.setDead();
      }
      let self = this;
      this.gameObject.on(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        function () {
          if (self.gameObject.anims.getName() != 'IDLE_WAKE' && self.state == 'WAKE') {
            self.gameObject.play('IDLE_WAKE');
          } else if (self.state == 'IDLE' && self.gameObject.anims.getName() != 'IDLE') {
            self.gameObject.play('IDLE');
          } else if (self.state == 'DEAD' && self.gameObject.anims.getName() != 'IDLE_DEAD') {
            self.gameObject.play('IDLE_DEAD');
          }
        },
        this.scene
      );
    }
  }

  setAnimation({ up, down, left, right, space }: keys) {
    if (!this.isWakingUp) {
      if (this.state == 'IDLE') {
        if (right || up || down || left) {
          this.gameObject.setVelocity(0, 0);
          this.isWakingUp = true;
          if (this.gameObject.anims.getName() != 'WAKE') {
            let self = this;
            this.gameObject.play('WAKE');
            this.gameObject.on(
              Phaser.Animations.Events.ANIMATION_COMPLETE,
              function () {
                self.isWakingUp = false;
                self.state = 'WAKE';
              },
              this.scene
            );
          }
        }
      } else {
        if (space) {
          if (this.gameObject.anims.getName() != 'SHOOT') this.gameObject.play('SHOOT');
          setTimeout(() => {
            this.bullets.fireBullet(this.gameObject.x + 200, this.gameObject.y + 60);
          }, 100);
        } else {
          if (right || up || down || left) {
            if (this.gameObject.anims.getName() != 'MOVE_RIGHT') this.gameObject.play('MOVE_RIGHT');
          }
        }
      }

      if (!right && !left && !up && !down && !space) {
        if (this.gameObject.anims.getName() != 'IDLE_WAKE' && this.state == 'WAKE') {
          this.gameObject.play('IDLE_WAKE');
        } else if (this.state == 'IDLE') {
          this.gameObject.play('IDLE');
        }
      }
    }
  }
  move(movement: keys) {
    if (this.state !== 'DEAD') {
      if (!movement.space && !this.isWakingUp) {
        if (this.gameObject.x + this.dimension.width < this.boundries.maxX && this.gameObject.x > this.boundries.minX)
          this.gameObject.setVelocityX(movement.left ? -this.speed : movement.right ? this.speed : 0);
        if (
          this.gameObject.y + this.gameObject.displayHeight < this.boundries.maxY &&
          this.gameObject.y > this.boundries.minY
        )
          this.gameObject.setVelocityY(movement.up ? -this.speed : movement.down ? this.speed : 0);
      } else {
        this.gameObject.setVelocity(0, 0);
      }
      this.setAnimation(movement);
      this.boundriesValidator();
      this.health.draw(true);
    }
  }
}

class HealthBar {
  bar: Phaser.GameObjects.Graphics;
  x;
  y;
  value;
  length;
  total;
  isVisible = true;
  constructor(scene, x, y, public character: Character) {
    let self = this;
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.x = character.gameObject.x + 100;
    this.y = character.gameObject.y + 20;
    this.value = 100;
    this.total = this.value;
    this.length = 76;
    this.draw(true);
    setTimeout(() => {
      self.isVisible = false;
      this.draw(false);
    }, 1000);
    scene.add.existing(this.bar);
  }

  decrease(amount) {
    this.value -= amount;
    console.log(this.value);
    if (this.value < 0) {
      this.value = 0;
    }

    this.draw(true);
    setTimeout(() => {
      this.draw(false);
    }, 2000);
    return this.value === 0;
  }

  draw(show) {
    if (this.isVisible || show) {
      this.x = this.character.gameObject.x + 100;
      this.y = this.character.gameObject.y;
      this.bar.clear();
      //  BG
      this.bar.fillStyle(0x000000);
      this.bar.fillRect(this.x, this.y, this.length + 4, 10);
      //  Health
      this.bar.fillStyle(0xffffff);
      this.bar.fillRect(this.x + 2, this.y + 2, this.length, 7);
      if (this.value < 30) {
        this.bar.fillStyle(0xff0000);
      } else {
        this.bar.fillStyle(0x00ff00);
      }
      var d = this.value / this.total;
      this.bar.fillRect(this.x + 2, this.y + 2, d * this.length, 7);
    } else {
      this.bar.clear();
    }
  }
}
