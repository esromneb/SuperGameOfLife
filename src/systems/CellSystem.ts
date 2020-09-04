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

  spriteSize: number = 0.7;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

  }

  finalInit() {
    this.spriteSize = this.getSpriteScale();

  }

  tileHasCell(tile: Vec2): boolean {
    const e = this.world.getEntity(`c${tile[0]}_${tile[1]}`);
    return !!e;
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

  // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
  // Any live cell with two or three live neighbours lives on to the next generation.
  // Any live cell with more than three live neighbours dies, as if by overpopulation.
  // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

  calculateLife() {
    const gboard = this.world.getEntity('gboard');
    const sz = gboard.c.board.tiles;
    let kill: Vec2[] = [];
    let spawn: Vec2[] = [];

    let neighbors = {};
    for(let x = 0; x < sz[0]; x++) {
      for(let y = 0; y < sz[1]; y++) {
        const key = `c${x}_${y}`;
        const count = neighbors[key] = this.countNeighbors([x,y]);
        // the rules of the game
        // it's ok to kill a cell if it doesn't exist
        if( count < 2 ) {
          kill.push([x,y]);
        } else if( count > 3 ) {
          kill.push([x,y]);
        }

        // we should guard spawnCell according to the rules
        if( count === 3 && !(this.tileHasCell([x,y]))) {
          spawn.push([x,y]);
        }

      }
    }

    // console.log(neighbors);

    for( let k of kill ) {
      this.destroyCell(k);
    }

    for(let s of spawn ) {
      this.spawnCell(s);
    }
  }

  getSpriteScale(): number {
    const e = this.world.getEntity('gboard');
    const offset = e.c.board.tileOffset;
    const sz = e.c.board.gsize;

    const minsz = Math.min(sz[0], sz[1]);

    // console.log(minsz);

    const startSize = 40;
    const startScale = 0.8;

    const ret = (minsz/startSize) * startScale;


    // this scale was calculated when the board was 40x40


    return ret;
  }

  // returns the new entity if spawned
  // returns the existing one if something already exists here
  spawnCell(tile: Vec2): Entity {

    const existing = this.world.getEntity(`c${tile[0]}_${tile[1]}`);
    if( !!existing ) {
      return existing;
    }

    const [x,y] = this.wp.board.tileToPixel(tile);

    const game = this.wp.gamec;

    const s = this.world.createEntity({
        tags: ['New'],
        components: [
          {
            type: 'Sprite',
            key: 's0',
            frame: 'pearl_01d',
            container: game.layers.main,
            scale: this.spriteSize,
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

  spawnIce(tile: Vec2): Entity {
    const e = this.spawnCell(tile);

    e.c.cell.sprite.c.s0.color = 0xD4F1F9;

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


/*
// create cell squares not sprites

    const s = this.world.createEntity({
        tags: ['New'],
        components: [
          {
            type: 'GraphicsSprite',
            key: 's0',
            // frame: 'pearl_01d',
            container: game.layers.main,
            scale: this.spriteSize,
            color: 0xff0000,
          },
          {
            type: 'Position',
            x,
            y,
            angle: 0,
          }
        ]
      });


*/