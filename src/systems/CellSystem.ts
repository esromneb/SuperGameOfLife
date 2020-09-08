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
  stepQ: Query;

  spriteSize: number = 0.7;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

    // @ts-ignore
    this.stepQ = this.createQuery()
      .fromAll('StepSimulation')
      .persist();
  }

  finalInit() {
    this.spriteSize = this.getSpriteScale();
  }

  cellInTile(tile: Vec2): Entity | undefined {
    return this.world.getEntity(`c${tile[0]}_${tile[1]}`);
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

      const exists: boolean = !!e;

      if( exists && e.c.cell.ctype !== 'ice' ) {
        count++;
      }
    }

    return count;
  }

  update(tick) {
    const q = this.stepQ.execute();
    for(const e of q) {
      console.log("step simulation on frame " + this.world.currentTick);
      this.calculateLife();
      e.destroy();
    }
  }

  normalRules(tile: Vec2, key: string, kill: Vec2[], spawn: Vec2[]): void {
    const count = this.countNeighbors(tile);
    // the rules of the game
    // it's ok to kill a cell if it doesn't exist
    if( count < 2 ) {
      kill.push(tile);
    } else if( count > 3 ) {
      kill.push(tile);
    }

    // we should guard spawnCell according to the rules
    if( count === 3 && !(this.tileHasCell(tile))) {
      spawn.push(tile);
    }
  }

  iceRules(tile: Vec2, key: string, kill: Vec2[], spawn: Vec2[]): void {
    const count = this.countNeighbors(tile);

    // does not kill if alone
    // but kill 3 or more neighbors
    if( count > 2 ) {
      kill.push(tile);
    }
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
        const tile: Vec2 = [x,y];
        const key = `c${x}_${y}`;

        const e = this.cellInTile(tile);
        if(!!e && e.c.cell.ctype === 'ice' ) {
          this.iceRules(tile, key, kill, spawn)
        } else {
          this.normalRules(tile, key, kill, spawn);
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


  getDescription(tile: Vec2): string {

    const e = this.cellInTile(tile);
    
    if( !!e ) {
      if( e.c.cell.ctype === 'ice' ) {
        return 'Ice Block';
      } else {
        return 'Cell';
      }

    }
    return '';
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
            // frame: 'pearl_01d',
            container: game.layers.main,
            scale: this.spriteSize,
          },
          {
            type: 'Position',
            key: 'position',
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

    this.updateCellGraphics(e);
    return e;
  }

  updateCellGraphics(e) {
    if(e.c.cell.ctype === 'cell') {
      e.c.cell.sprite.c.s0.frame = 'pearl_01d';
    } else if( e.c.cell.ctype === 'ice' ) {
      e.c.cell.sprite.c.s0.frame = 'ice_01';
    }
  }

  spawnIce(tile: Vec2): Entity {
    const e = this.spawnCell(tile);

    // e.c.cell.sprite.c.s0.color = 0xD4F1F9;
    e.c.cell.ctype = 'ice';

    this.updateCellGraphics(e);

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

  mutateCell(tile: Vec2): void {
    if(this.tileHasCell(tile)) {
      const e = this.cellInTile(tile);
      if( e.c.cell.ctype === 'cell' ) {
        this.destroyCell(tile);
        this.spawnIce(tile);
      } else {

        this.destroyCell(tile);
      }
      // if( )
    } else {
      this.spawnCell(tile);
    }
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