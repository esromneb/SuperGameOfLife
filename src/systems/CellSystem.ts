import {WorldParent} from '../WorldParent'

import {
Vec2
} from '../Types'

import {
hsvToRgb,
} from 'colorsys'


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


// takes the output of hsvToRgb and converts it to a number
// pixi.js can use
function colorToHex(c: any): number {
  let {r,g,b} = c;

  let ret = (r << 16) | (g<<8) | b;

  return ret;
}

function hsv(h: number, s: number, v: number): number {
  return colorToHex(hsvToRgb(h,s,v));
}

class CellSystem extends ApeECS.System {

  // spriteQuery: Query;
  // posQuery: Query;
  // game: any;

  logSimulationStep: boolean = false;

  wp: WorldParent;
  stepQ: Query;

  spriteSize: number = 0.7;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

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

  // returns a list of valid tiles around this tile
  // valid means they are not negative
  getValidNeighborTiles(tile: Vec2): Vec2[] {
    const [x,y] = tile;
      
    const pos: Vec2[] = [
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
    return ok;
  }

  countNeighbors(tile: Vec2): number {
    const ok = this.getValidNeighborTiles(tile);

    let count = 0;

    for( let p of ok ) {
      const e = this.world.getEntity(`c${p[0]}_${p[1]}`);

      const exists: boolean = !!e;

      if( exists && e.c.cell.ctype !== 'ice' && e.c.cell.ctype !== 'potion' ) {
        count++;
      }
    }

    return count;
  }

  // call with a tile that will spawn a cell next turn
  // this calculates the potions that should be given to that tile

  calculateSpawnEffectsFromNeighbors(tile: Vec2): any {

    const ret = [];

    const inherit: number = 0.5; // larger aka closer to 1 means child gets more

    const valid = this.getValidNeighborTiles(tile);
    for( const t of valid ) {
      // check a parent
      const e = this.cellInTile(t);
      let parentUpdated = false;
      if( !!e && e.c.cell.ctype === 'cell' ) {
        const potions = e.types['PotionEffect'] || new Set();

        // if parent has any effects
        for(const effect of potions) {
          let forChild = effect.getObject();
          let forParent = effect.getObject();

          if( forChild.crowdProtection != undefined ) {
            forChild.crowdProtection *= inherit;
            forParent.crowdProtection *= (1-inherit);

            // just replace the value in the existing component
            effect.crowdProtection = forParent.crowdProtection;

            ret.push(forChild);
            parentUpdated = true;
          }

          // console.log(effect.getObject());

        }
      }
      if( parentUpdated ) {
        this.updateTileGraphcs(t);
      }
    }
    return ret;
  }

  update(tick) {
    const q = this.stepQ.execute();
    for(const e of q) {
      
      if( !!e.c.StepSimulation.forward ) {
        this.stepForward();
      } else {
        this.wp.history.stepBackwards();
      }
      this.notifyCellStateChanged();


      e.destroy();
    }
  }

  stepForward(): void {
    // istanbul ignore if
    if( this.logSimulationStep ) {
      console.log("step simulation on frame " + this.world.currentTick);
    }
    this.wp.history.saveCellHistory();
    this.calculateLife();
  }

  // creates a "notification" that the board state has changed
  // this is accomplished by an entity with a component
  // the input system reads this component
  // the theory is that this function is not called inside any of the mutation
  // functions (stepForward, calculateLife, spawnPotion, destroyCell, mutateCell, destroyAllCells, etc)
  // and you must call it yourself, this should be more efficient (but possibly prone to forgetting)
  notifyCellStateChanged(): void {
    this.world.createEntity({c:{CellStateChanged:{}}});
  }

  // look around tile and then apply any potions (And consume them)
  // pass kill from the rules function so that we can also delete
  // the potion
  grabPotions(consumer: Entity, tile: Vec2, kill: Vec2[]): void {
    // istanbul ignore if
    if( !consumer ) {
      return;
    }
    const valid = this.getValidNeighborTiles(tile);
    // check each neighbor
    // if it's a cell, drink the potion
    for(let t of valid) {
      const e = this.cellInTile(t);
      if( !!e && e.c.cell.ctype === 'potion' ) {
        // consumer.addComponent()
        // console.log(e.types['PotionEffect']);
        for( const effect of e.types['PotionEffect'] ) {
          // console.log(effect.getObject());
          consumer.addComponent(effect.getObject());
        }

        // destroy the potion
        kill.push(t);

        // console.log("drank potion");
        // update cell color now that it consumed the potion
        this.updateCellGraphics(consumer);
      }
    }
  }

  // looks for effects
  // these two numbers are used to determine the rules of the game
  // cells with fewer neighbors than [0] will die
  // cells with neighbors between [0] and [1] will survive
  // empty space with neighbors between [1] and ([1]+1) will spawn
  adjustedRuleTolerances(e: Entity | undefined): Vec2 {
    if( e == undefined ) {
      return [2, 3];
    }

    // seems like increasing crowd protection has the side effect
    // of making it harder to spawn in a tile
    // this is ignored however because empty tiles always
    // use default rules
    // once this gets changed this needs to be re-visited FIXME

    let alone = 2;
    let crowded = 3;

    const potions = e.types['PotionEffect'] || new Set();

    for( const effect of potions ) {
      if( effect.crowdProtection != undefined ) {
        crowded += effect.crowdProtection;
      }
    }

    return [alone, crowded];
  }

  normalRules(tile: Vec2, key: string, kill: Vec2[], spawn: Vec2[], grab: Vec2[]): void {
    const e = this.cellInTile(tile);
    const populated: boolean = !!e;
    if( populated ) {
      grab.push(tile);
      // this.grabPotions(e, tile, kill);
    }

    const [alone_count, crowd_count] = this.adjustedRuleTolerances(e);
    const spawn_upper = crowd_count+1;

    let print = false;
    // if( alone_count !== 2 || crowd_count !== 3 ) {
    //   print = true;
    // }


    const count = this.countNeighbors(tile);

    // istanbul ignore next
    if( print ) {
      console.log(`Cell has ${count} neighbors and comparing [${alone_count},${crowd_count}] `);
    }

    // the rules of the game
    // it's ok to kill a cell if it doesn't exist
    if( count < alone_count ) {
      kill.push(tile);
    } else if( count > crowd_count ) {
      kill.push(tile);
    }

    // we should guard spawnCell according to the rules
    // before this said count === 3
    // however we are using fractional neighbor counts
    // so we take this to mean (count >= 3) && (count < 4)
    if( ((count >= crowd_count) && (count < spawn_upper))   && (!populated) ) {
      spawn.push(tile);
    }
  }

  iceRules(tile: Vec2, key: string, kill: Vec2[], spawn: Vec2[], grab: Vec2[]): void {
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
    const sz = this.wp.board.getBoardSize();
    let kill: Vec2[] = [];
    let spawn: Vec2[] = [];
    let grab: Vec2[] = [];

    let neighbors = {};
    for(let x = 0; x < sz[0]; x++) {
      for(let y = 0; y < sz[1]; y++) {
        const tile: Vec2 = [x,y];
        const key = `c${x}_${y}`;

        const e = this.cellInTile(tile);
        if(!!e && e.c.cell.ctype === 'ice' ) {
          this.iceRules(tile, key, kill, spawn, grab)
        } else if (!!e && e.c.cell.ctype === 'potion' ) {
          // do nothing for potions
          // they are destroyed when consumed by a neighbor cell
        } else {
          this.normalRules(tile, key, kill, spawn, grab);
        }


      }
    }

    // console.log(neighbors);

    let childEffects: any = {};

    for( let s of spawn ) {
      const key = `c${s[0]}_${s[1]}`;
      // if( s[0] == 4 && s[1] == 6 ) {

      // } else {
      //   continue;
      // }
      childEffects[key] = this.calculateSpawnEffectsFromNeighbors(s);
      // childEffects[key] = new Set();

      // console.log(s);
    }

    for( let g of grab ) {
      const e = this.cellInTile(g);
      this.grabPotions(e, g, kill);
    }

    for( let k of kill ) {
      this.destroyCell(k);
    }

    for(let s of spawn ) {
      const key = `c${s[0]}_${s[1]}`;
      const spawned = this.spawnCell(s, childEffects[key]);

      // for(let effect of ) {
      //   spawned.addComponent(effect);
      // }
    }

    this.consolodateEffects();
  }

  // if a crowd effect goes below this limit it is ended
  effectMinimum: number = 0.01;

  consolodateEffects(): void {
    const q = this.createQuery().fromAll('PotionEffect').execute();
    for( const e of q ) {
      let total: any = {};
      for( let eff of e.types['PotionEffect'] ) {
        if( eff.crowdProtection !== undefined ) {
          if( total.crowdProtection === undefined ) {
            total.crowdProtection = 0;
          }

          total.crowdProtection += eff.crowdProtection;

        }
        // console.log(eff);
        e.removeComponent(eff);
      }

      if( total.crowdProtection >= this.effectMinimum ) {
        e.addComponent(
          {
            type: 'PotionEffect',
            crowdProtection: total.crowdProtection,
          }
        );
      }
    }
  }

  getEffectDescription(c: Component): string {
    let ret = '';
    if( c.crowdProtection != undefined ) {
      ret += `crowd protection +${c.crowdProtection}`;
    }

    return ret;
  }


  getDescription(tile: Vec2): string {

    const e = this.cellInTile(tile);
    
    if( !!e ) {
      if( e.c.cell.ctype === 'ice' ) {
        return 'Ice Block';
      } else {
        let base = 'Cell';

        if( e.c.cell.ctype === 'potion' ) {
          base = 'Potion';
        }

        // e.types[] may return undefined
        // to make this easier, if we get undefined
        // we simply give an empty set
        // this skips having an extra if which first checks
        // if the key is in types, and then later runs the loop
        const potions = e.types['PotionEffect'] || new Set();
        for( const effect of potions ) {
          base += ' ' + this.getEffectDescription(effect);
        }

        return base;
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

  // takes a POJO (plain old javascript object) and makes a cell
  // pass the output of e.getObject() to this function to re-create
  // the cell

  spawnCellFromObject(pojo: any): Entity|any {
    // console.log(pojo);
    const tile = pojo.c.tile.vec2;
    // console.log(tile);
    if( tile == undefined ) {
      throw new Error(`spawnCellFromObject: tile was not found on argument object`);
    }
    const existing = this.world.getEntity(`c${tile[0]}_${tile[1]}`);
    if( !!existing ) {
      return existing;
    }

    const s = this._createSpriteDuringSpawn(tile);

    const e = this.world.createEntity(pojo);
    e.c.cell.sprite = s;
    this.updateCellGraphics(e);
    return e;
  }


  // returns the new entity if spawned
  // returns the existing one if something already exists here
  // effects is a list of component objects to add after spawning
  spawnCell(tile: Vec2, effects?: any[]): Entity {

    const existing = this.world.getEntity(`c${tile[0]}_${tile[1]}`);
    if( !!existing ) {
      return existing;
    }

    const s = this._createSpriteDuringSpawn(tile);

    // we use an id for this entity which is composed of the letter c and the tiles 
    // coordinates.  This allows us to fetch this entity on demand if we have a tile
    const e = this.world.createEntity({
      id: `c${tile[0]}_${tile[1]}`,
      components: [
        {
          type: 'Tile',
          key: 'tile',
          vec2: tile,
        },
        {
          type: 'Cell',
          key: 'cell',
          sprite: s,
        }
      ]
    });

    if( effects != undefined ) {
      for(let ef of effects) {
        e.addComponent(ef);
      }
    }

    this.updateCellGraphics(e);
    return e;
  }

  _createSpriteDuringSpawn(tile: Vec2): Entity {
    const [x,y] = this.wp.board.tileToPixel(tile);


    const s = this.world.createEntity({
        tags: ['New'],
        components: [
          {
            type: 'Sprite',
            key: 's0',
            // frame: 'pearl_01d',
            scale: this.spriteSize,
          },
          {
            type: 'Position',
            key: 'position',
            x,
            y,
          }
        ]
      });

    return s;
  }


  ds: number = 85;  // saturation
  dv: number = 100; // value

  // istanbul ignore next
  cellColor(e): number {
    // base color for default cells (cells with no potion effects)

    let tint;
    // let tint = 0x00ff00;
    let hue = 100;

    // console.log("here");
    // console.log(hslToRgb(360, 100, 100));
    // console.log(hslToRgb(50, 80, 50));
    // console.log(hslToRgb(355, 80, 50));

    // tint = colorToHex(hsvToRgb(delme, this.ds, this.dv));
    // console.log(`h: ${delme} rgb: ${tint.toString(16)}`)


    const potions = e.types['PotionEffect'] || new Set();


    if( false ) {
      for( const effect of potions ) {
        if( effect.crowdProtection ) {

          hue += 90*effect.crowdProtection/1.5;
        }
        // base += ' ' + this.getEffectDescription(effect);
      }
    }

    if( true ) {
      let x = 0;
      let changed: boolean = false;
      for( const effect of potions ) {
        if( effect.crowdProtection ) {
          x += effect.crowdProtection;
          changed = true;
        }
        // base += ' ' + this.getEffectDescription(effect);
      }
      if( changed ) {
        let h = (-10/(0.02*(x+1.4)))+360;
        hue += h;
      }
    }


    tint = hsv(hue, this.ds, this.dv);

    return tint;
  }

  // istanbul ignore next
  updateTileGraphcs(tile: Vec2): void {
    const e = this.cellInTile(tile);
    if( !!e ) {
      this.updateCellGraphics(e);
    }
  }

  // istanbul ignore next
  updateCellGraphics(e) {
    let frame;
    let tint = 0xffffff;

    switch(e.c.cell.ctype) {
      case 'potion':
        frame = 'potion_03a';
        break;
      case 'ice':
        frame = 'ice_01';
        break;
      default:
      case 'cell':
        frame = 'pearl_01a';
        tint = this.cellColor(e);
        break;
    }
    e.c.cell.sprite.c.s0.frame = frame;
    e.c.cell.sprite.c.s0.tint = tint;

    e.c.cell.sprite.addTag('UpdateSprite');

  }

  spawnIce(tile: Vec2): Entity {
    const e = this.spawnCell(tile);

    // e.c.cell.sprite.c.s0.color = 0xD4F1F9;
    e.c.cell.ctype = 'ice';

    this.updateCellGraphics(e);

    return e;
  }

  // , options: any
  spawnPotion(tile: Vec2): Entity {
    const e = this.spawnCell(tile);


    // if( options.crowdProtection ) {

    // }

    e.addComponent({
      type: 'PotionEffect',
      crowdProtection: 3,
    });


    // e.c.cell.sprite.c.s0.color = 0xD4F1F9;
    e.c.cell.ctype = 'potion';

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

  // istanbul ignore next
  mutateCellFlip(tile: Vec2): void {
    if(this.tileHasCell(tile)) {
      const e = this.cellInTile(tile);
      const type = e.c.cell.ctype;
        this.destroyCell(tile);
      // if( type === 'cell' ) {
      //   this.spawnIce(tile);
      // } else if( type === 'ice' ) {
      //   this.destroyCell(tile);
      //   this.spawnPotion(tile);
      // } else {

      //   this.destroyCell(tile);
      // }
      // if( )
    } else {
      this.spawnCell(tile);
    }
  }

  // istanbul ignore next
  mutateCell(tile: Vec2): void {
    if(this.tileHasCell(tile)) {
      const e = this.cellInTile(tile);
      const type = e.c.cell.ctype;
      if( type === 'cell' ) {
        this.destroyCell(tile);
        this.spawnIce(tile);
      } else if( type === 'ice' ) {
        this.destroyCell(tile);
        this.spawnPotion(tile);
      } else {

        this.destroyCell(tile);
      }
      // if( )
    } else {
      this.spawnCell(tile);
    }
  }

  destroyAllCells(): void {
    const gboard = this.world.getEntity('gboard');
    const sz = gboard.c.board.tiles;
    // let kill: Vec2[] = [];
    // let spawn: Vec2[] = [];

    let neighbors = {};
    for(let x = 0; x < sz[0]; x++) {
      for(let y = 0; y < sz[1]; y++) {
        const tile: Vec2 = [x,y];
        const key = `c${x}_${y}`;

        this.destroyCell(tile);

        // const e = this.cellInTile(tile);
        // if(!!e && e.c.cell.ctype === 'ice' ) {
        //   this.iceRules(tile, key, kill, spawn)
        // } else if (!!e && e.c.cell.ctype === 'potion' ) {
        //   // do nothing for potions
        //   // they are destroyed when consumed by a neighbor cell
        // } else {
        //   this.normalRules(tile, key, kill, spawn);
        // }
      }
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