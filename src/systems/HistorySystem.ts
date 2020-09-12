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

// The history is stored on an entity
// called 'chistory'
// The history is saved before each step.  the call to this.saveCellHistory() is made by
// CellSytem.stepForward()
// The history is maintained as a LIFO (last in first out) stack
// cell objects created from the Entity (not the Entity itself) is stored

class HistorySystem extends ApeECS.System {

  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

  }

  update(tick) {

  }


  cellHistoryLength(): number {
    return this.wp.snapshots.c.history.snapshots.length;
  }

  // steps back one step
  stepBackwards(): void {
    if( this.cellHistoryLength() <= 0 ) {
      return;
    }

    // console.log('stepBackwards');

    // pop() here gives LIFO
    // shift() here gives FIFO (which is wrong)
    let snap = this.wp.snapshots.c.history.snapshots.pop();

    if( snap == undefined ) {
      return;
    }

    // wipe the board
    this.wp.cell.destroyAllCells();

    for( const pojo of snap ) {
      this.wp.cell.spawnCellFromObject(pojo);
    }
    

  }

  saveCellHistory(): void {
    const snap = this.exportCellState();

    this.wp.snapshots.c.history.snapshots.push(snap);
  }


  exportCellState(): any[] {
    // This query grabs all entities with these components
    // it also skips the entity with the id 'chistory'
    const q = this.world.createQuery().not('chistory').fromAny(
      'Tile',
      'Cell',
      'PotionEffect',
      );
    const es = q.execute();

    // at this point es is a set of entity objects
    // if we were to save these, the current game
    // state would affect our saved history
    // instead we use getObject to get a POJO (plain old javascript object)
    // and then save that
    // if desired the result of getObject() can be seralied into JSON
    // (the normal way) and then saved via network or whatever

    let ret = [];

    for(const e of es) {
      // console.log(e);

      // convert to POJO
      ret.push(e.getObject());
    }
    return ret;
  }

}

export {
HistorySystem,
}
