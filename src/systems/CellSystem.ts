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
            scale: 1,
            color: 0xff0000
          },
          {
            type: 'Position',
            x,
            y,
            angle: 0,
          }
        ]
      });

    // we use an id for this entity which is composed of the letter c and the tiles 
    // coordinates.  This allows us to fetch this entity on demand if we have a tile
    const e = this.world.createEntity({
      id: `c${tile[0]}_${tile[1]}`,
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
          sprite: s,
        }
      ]
    });
    return e;
  }

  // returns true if found
  // false if no cell at that tile
  destroyCell(tile: Vec2): boolean {
    const e = this.world.getEntity(`c${tile[0]}_${tile[1]}`);
    if( !e ) {
      return false;
    }
    this.world.removeEntity(e.c.cell.sprite);
    this.world.removeEntity(e);
    return true;
  }


}

export {
CellSystem,
}
