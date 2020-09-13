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

  getClickBounds(): [Vec2,Vec2] {
    const e = this.world.getEntity('gboard');

    const tiles = e.c.board.tiles;
    // console.log(e);
    // const tiles = e.c.gboard.tiles;
    const ul = e.c.board.tileOffset;
    const br = this.tileToPixel([tiles[0],tiles[1]]);

    return [ul, br];
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

  // istanbul ignore next
  pixelToTile(px: Vec2): Vec2 {
    const e = this.world.getEntity('gboard');
    // console.log(e);
    // const tiles = e.c.gboard.tiles;
    const offset = e.c.board.tileOffset;
    const sz = e.c.board.gsize;
    let raw: Vec2 = [0,0];

    const [x,y] = px;

    // x = o + (t * s)
    // x - o = (t * s)
    // (x - o)/s = t

    // y = 1+o + (t*s)
    // y - 1 - o

    raw[0] = (x - offset[0]    ) / sz[0];
    raw[1] = (y - offset[1] - 1) / sz[1];

    // due to the rounding, we snap to the wrong grid
    // offset by 50% of a tile
    const t: Vec2 = [Math.round(raw[0]-0.5), Math.round(raw[1]-0.5)];
    // const t = raw;

    return t;
  }

  getBoardSize(): Vec2 {
    const gboard = this.world.getEntity('gboard');
    const sz: Vec2 = gboard.c.board.tiles;
    return sz;
  }


}

export {
BoardSystem,
}
