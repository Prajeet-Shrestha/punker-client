import BattleScene from '../Battle.scene';
import { Character } from './Character';

export class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene: BattleScene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      frameQuantity: 1000,
      key: 'bullet',
      active: false,
      visible: false,
      classType: Bullet,
    });
  }

  fireBullet(x, y) {
    let bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y);
    }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(public scene: BattleScene, x, y) {
    super(scene, x, y, 'bullet');
  }

  fire(x, y) {
    this.body.reset(x, y);
    this.setScale(0.2);
    this.setDepth(1);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityX(300);
  }

  hit(self, sprite, object) {
    self.setActive(false);
    self.setVisible(false);
    console.log(object.data.list['id']);
    self.scene.test2[object.data.list['id']].damageTaken();
    //   t.damageTaken();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    let self = this;
    this.scene.physics.overlap(this, this.scene.playerObjectList, (e, t) => {
      this.hit(self, e, t);
    });
    if (this.x >= this.scene.sys.canvas.width) {
      console.log('out');
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
