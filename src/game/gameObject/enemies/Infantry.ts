import BattleScene from '../../Battle.scene';
import { Bullets } from '../Bullets';

interface keys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}
export class Infantry {
  gameObject: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  bullets: Bullets;
  speed: number = 200;
  public dimension: { height: number; width: number } = {
    height: 0,
    width: 0,
  };
  lastActiveState: number = 0;
  state: 'IDLE' | 'DEAD' = 'IDLE';

  health: HealthBar;
  constructor(
    public id: string,
    public posX: number,
    public posY: number,
    public spriteSheet: {
      move: string;
      idle: string;
      shoot: string;
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
      .sprite(scene.sys.canvas.width - Math.floor(Math.random() * 200) + 400, posY, spriteSheet.idle)
      .setOrigin(0, 0)
      .setScale(3)
      .setFlipX(true)
      .setDepth(2);
    this.gameObject.setDrag(100);
    this.gameObject.setBodySize(20, 30);
    this.gameObject.setData({ id: id });
    this.gameObject.setAngularDrag(100);
    this.gameObject.setMaxVelocity(200);
    // this.gameObject.setTint(0xff00ff);

    this.health = new HealthBar(scene, this.gameObject.x, this.gameObject.y, this);
    this.dimension.height = this.gameObject.displayHeight;
    this.dimension.width = this.gameObject.displayWidth - 500;
    this.gameObject.body.setCollideWorldBounds(true);

    this.bullets = new Bullets(scene, this.id);
    let self = this;
    scene.events.on('postupdate', function () {
      self.health.draw(true);
    });
    this.gameObject.play('INFANTRY_IDLE');

    ///sd
    setInterval(() => {
      self.shoot();
    }, Math.floor(Math.random() * 2000) + 10000);

    var tween = scene.tweens.add({
      targets: this.gameObject,
      x: 700,
      duration: 4000,
      ease: 'linear',
      onStart: (e) => {
        self.gameObject.play('INFANTRY_MOVE_RIGHT');
      },
      onComplete: (e) => {
        self.gameObject.play('INFANTRY_IDLE');
      },
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
    if (this.gameObject.anims.getName() != 'INFANTRY_DEAD' && this.state !== 'DEAD') {
      console.log('dead');
      this.gameObject.play('INFANTRY_DEAD');
      let self = this;
      this.state = 'DEAD';
      this.gameObject.setBodySize(20, 10);

      this.gameObject.on(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        function () {
          console.log('done!');
          this.state = 'DEAD';

          //   if (self.gameObject.anims.getName() != 'INFANTRY_IDLE_DEAD' && self.state == 'DEAD') {
          //     self.gameObject.play('INFANTRY_IDLE_DEAD');
          //   }
        },
        this.scene
      );
    }
  }
  damageTaken(damage) {
    console.log(damage);
    if (this.gameObject.anims.getName() != 'INFANTRY_DAMAGE' && this.state != 'DEAD') {
      this.health.decrease(damage);
      if (this.health.value <= 0) {
        this.setDead();
      } else {
        this.state = 'IDLE';
        this.gameObject.play('INFANTRY_DAMAGE');
      }
      let self = this;
      this.gameObject.on(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        function () {
          if (self.state == 'IDLE' && self.gameObject.anims.getName() != 'INFANTRY_IDLE') {
            self.gameObject.play('INFANTRY_IDLE');
          } else if (self.state == 'DEAD' && self.gameObject.anims.getName() != 'INFANTRY_IDLE_DEAD') {
            self.gameObject.play('INFANTRY_IDLE_DEAD');
          }
        },
        this.scene
      );
    }
  }

  setAnimation({ up, down, left, right, space }: keys) {
    if (space) {
      if (this.gameObject.anims.getName() != 'INFANTRY_SHOOT') this.gameObject.play('INFANTRY_SHOOT');
      setTimeout(() => {
        this.bullets.fireBullet(this.gameObject.x + 200, this.gameObject.y + 60, 'RIGHT');
      }, 100);
    } else {
      if (right || up || down || left) {
        if (this.gameObject.anims.getName() != 'INFANTRY_MOVE_RIGHT') this.gameObject.play('INFANTRY_MOVE_RIGHT');
      }
    }

    if (!right && !left && !up && !down && !space) {
      if (this.gameObject.anims.getName() != 'INFANTRY_IDLE' && this.state == 'IDLE') {
        this.gameObject.play('INFANTRY_IDLE');
      }
    }
  }
  shoot() {
    let self = this;
    setInterval(() => {
      //   if (self.gameObject.anims.getName() != 'INFANTRY_SHOOT') self.gameObject.play('INFANTRY_SHOOT'
      if (self.state != 'DEAD') {
        self.bullets.fireBullet(self.gameObject.x - 20, self.gameObject.y + 60, 'LEFT');
      }
    }, 2000);
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
  constructor(scene, x, y, public character: Infantry) {
    let self = this;
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.x = character.gameObject.x;
    this.y = character.gameObject.y + 20;
    this.value = 100;
    this.total = 100;
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
    if (this.value <= 1) {
      this.value = 0;
    }

    this.draw(true);
    setTimeout(() => {
      this.draw(false);
    }, 2000);
    return this.value;
  }

  draw(show) {
    if (this.isVisible || show) {
      this.x = this.character.gameObject.x + 20;
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
