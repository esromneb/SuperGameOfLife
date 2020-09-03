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

class BoardSystem extends ApeECS.System {

  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

  }

  update(tick) {

  }

  initBoard(x: number, y: number): Entity {
    const e = this.world.createEntity({
      id: 'gboard',
      components: [
        {
          type: 'GameBoard',
          key: 'board',
          tiles: [x,y],
        }
      ]
    });

    return e;
  }

  // returns the upper left pixel of a square
  // drawing a rectangle here must be able to fill the entire grid correctly
  tileToPixel(tile: Vec2): Vec2 {
    const e = this.world.getEntity('gboard');
    // console.log(e);
    // const tiles = e.c.gboard.tiles;
    const offset = e.c.board.tileOffset;
    const sz = e.c.board.gsize;

    const x =   offset[0] + tile[0] * sz[0];
    const y = 1+offset[1] + tile[1] * sz[1];  // not sure what this fudge is

    return [x,y];
  }


}

export {
BoardSystem,
}
