import {WorldParent} from '../WorldParent'

import {
Vec2
} from '../Types'


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

  addCell(tile: Vec2): Entity {

    const [x,y] = this.wp.board.tileToPixel(tile);

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
            x,
            y,
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
