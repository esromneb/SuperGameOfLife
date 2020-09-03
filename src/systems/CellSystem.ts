import {WorldParent} from '../WorldParent'

import {
  System,
  World,
  Component,
  Entity,
  EntityRef,
  EntitySet,
  EntityObject,
  Query,
} from 'ape-ecs';

const ApeECS = {
  World,
  System,
  Component,
};

class CellSystem extends ApeECS.System {

  // spriteQuery: Query;
  // posQuery: Query;
  // game: any;

  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

  }

  update(tick) {

  }

  addCell(x: number, y: number): Entity {

    const game = this.wp.gamec;

    const s = this.world.createEntity({
        tags: ['New'],
        components: [
          {
            type: 'GraphicsSprite',
            frame: 'x',
            container: game.layers.main,
            scale: 3,
            color: 0xffffff
          },
          {
            type: 'Position',
            x: 40,
            y: 40,
            angle: 0,
          }
        ]
      });

    const e = this.world.createEntity({
      components: [
        {
          type: 'Tile',
          key: 'tile',
          x,
          y
        },
        {
          type: 'Cell',
          key: 'cell',
        }
      ]
    });
    return e;
  }


}

export {
CellSystem,
}
