import BattleScene from '../Battle.scene';
import { Character } from './Character';

export class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene: BattleScene, public charId: string) {
    super(scene.physics.world, scene);

    this.createMultiple({
      frameQuantity: 1000,
      key: 'bullet',
      active: false,
      visible: false,
      classType: Bullet,
    });
  }

  fireBullet(x, y, direction: 'LEFT' | 'RIGHT') {
    try {
      let bullet = this.getFirstDead(false);
      if (bullet) {
        bullet.fire(x, y, direction, this.charId);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage = 10;
  id: string = '';
  constructor(public scene: BattleScene, x, y) {
    super(scene, x, y, 'bullet');
  }

  fire(x, y, direction: 'LEFT' | 'RIGHT', charId: string) {
    this.body.reset(x, y);
    this.setScale(0.2);
    this.setDepth(1);
    this.setActive(true);
    this.setVisible(true);
    this.id = charId;
    if (direction == 'RIGHT') this.setVelocityX(300);
    if (direction == 'LEFT') this.setVelocityX(-300);
  }

  hit(self, sprite, object) {
    self.setActive(false);
    self.setVisible(false);
    console.log(object.data.list['id']);
    if (self.scene.otherPlayer[object.data.list['id']].health.value >= 0 && self.id != object.data.list['id'])
      self.scene.otherPlayer[object.data.list['id']].damageTaken(self.damage);
    //   t.damageTaken();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    let self = this;
    this.scene.physics.overlap(this, this.scene.playerObjectList, (e, t) => {
      this.hit(self, e, t);
    });
    if (this.x >= this.scene.sys.canvas.width || this.x <= -1) {
      console.log('out');
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
