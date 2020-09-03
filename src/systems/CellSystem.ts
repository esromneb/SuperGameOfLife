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

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

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

  countNeighbors(tile: Vec2): number {
    const [x,y] = tile;
      
    const pos = [
    [x-1,y-1],
    [x-0,y-1],
    [x+1,y-1],
    [x+1,y-0],
    [x+1,y+1],
    [x-0,y+1],
    [x-1,y+1],
    [x-1,y+0],
    ];

    const ok = pos.filter(z=>(z[0]>=0&&z[1]>=0));

    let count = 0;

    for( let p of ok ) {
      const e = this.world.getEntity(`c${p[0]}_${p[1]}`);
      if( !!e ) {
        count++;
      }
    }

    return count;
  }

  update(tick) {
  }

  calculateLife() {
    const gboard = this.world.getEntity('gboard');
    const sz = gboard.c.board.gsize;
    let kill = {};


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
