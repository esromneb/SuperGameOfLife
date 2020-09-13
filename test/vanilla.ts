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

const ECS = {
  World,
  System: System,
  Component,
};


import {WorldParent} from '../src/WorldParent'


const defaultOptions = {
  width: 1920,
  height: 1080,
  transparent: false,
  backgroundColor: 0x000000,
  initialCellPattern: -1,
};


// returns true if world exactly matches the frame
function matchFrame(wp: any, frame: Set<string>): boolean | any {
  const sz = wp.board.getBoardSize();

  for(let x = 0; x < sz[0]; x++) {
    for(let y = 0; y < sz[1]; y++) {
      const key = `${x}_${y}`;
      const expectedCell = frame.has(key);
      const actualCell = wp.cell.tileHasCell([x,y]);
      if( expectedCell != actualCell ) {
        return false;
      }
    }
  }
  return true;
}


test('Vanilla game of life rules are correct', () => {
  // console.log("test start");

  const wp = new WorldParent({}, defaultOptions);
  wp.testMode = true;

  // expected frames
  const ef = [

    ['2_1','2_2','2_3','2_4'],
    ['1_2','2_2','3_2','1_3','2_3','3_3'],
    ['2_1','1_2','1_3','2_4','3_2','3_3'],
    ['2_1','1_2','1_3','2_4','3_2','3_3'],
    ['2_1','1_2','1_3','2_4','3_2','3_3'],

  ].map(x=>new Set(x));

  const cell = wp.cell;

  cell.spawnCell([2,1]);
  cell.spawnCell([2,2]);
  cell.spawnCell([2,3]);
  cell.spawnCell([2,4]);

  expect(matchFrame(wp, ef[0])).toBe(true);

  wp.update();

  for(let i = 0; i < 5; i++) {

    expect(matchFrame(wp, ef[i])).toBe(true);


    wp.cell.stepForward();
    wp.update();
  }

});


test('spawnCell returns existing object when cell exists', () => {

  const wp = new WorldParent({}, defaultOptions);
  wp.testMode = true;
  const cell = wp.cell;

  // spawn a first cell
  const e0 = cell.spawnCell([2,1]);

   
  // spawn another
  const ne1 = cell.cellInTile([4,4]);

  // verify they are not the same entity
  expect(e0 !== ne1).toBe(true);

  // destroy the first
  cell.destroyCell([2,1]);

  // spawn in the location of the first
  const e1 = cell.spawnCell([2,1]);

  // verify that the new entity is different than the old
  expect(e0 !== e1).toBe(true);

  // spawn again (heres the real test)
  const e2 = cell.spawnCell([2,1]);

  // verify it returns the same entity
  expect(e1 === e2).toBe(true);
});

