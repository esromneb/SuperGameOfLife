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


test('Child of cell splits effects', () => {
  // console.log("test start");

  const wp = new WorldParent({}, defaultOptions);
  wp.testMode = true;

  // expected frames
  // const ef = [

  //   ['2_1','2_2','2_3','2_4'],
  //   ['1_2','2_2','3_2','1_3','2_3','3_3'],
  //   ['2_1','1_2','1_3','2_4','3_2','3_3'],
  //   ['2_1','1_2','1_3','2_4','3_2','3_3'],
  //   ['2_1','1_2','1_3','2_4','3_2','3_3'],

  // ].map(x=>new Set(x));

  const cell = wp.cell;

  cell.spawnCell([5,5]);
  cell.spawnCell([6,4]);
  cell.spawnCell([5,4]);
  cell.spawnCell([6,5]);
  cell.spawnPotion([4,6]);

  // expect(matchFrame(wp, ef[0])).toBe(true);

  // infect cell in 5,5
  wp.cell.stepForward();
  wp.update();

  cell.destroyCell([6,4]);

  expect(cell.tileHasCell([6,4])).toBe(false);

  // console.log(cell.tileHasCell([6,4]));

  wp.cell.stepForward();
  wp.update();

  expect(cell.tileHasCell([6,4])).toBe(true);

  const e = cell.cellInTile([6,4]); // spawned child

  let i = 0;
  for(const childEff of e.types['PotionEffect'] ) {
    const got = childEff.crowdProtection;
    const expected = 1.5;
    const delta = Math.abs(got-expected);
    expect(delta < 0.00001).toBe(true);

    i++;
  }

  expect(i).toBe(1);

  // console.log(e.types['PotionEffect']);

  const pe = cell.cellInTile([5,5]); // parent

  i = 0;
  for(const paerentEff of pe.types['PotionEffect'] ) {
    const got = paerentEff.crowdProtection;
    const expected = 1.5;
    const delta = Math.abs(got-expected);
    expect(delta < 0.00001).toBe(true);

    i++;
  }

  expect(i).toBe(1);

  // console.log(pe);



  // for(let i = 0; i < 5; i++) {

  //   // expect(matchFrame(wp, ef[i])).toBe(true);


  //   wp.cell.stepForward();
  //   wp.update();
  // }

});





test('Potion pickup is sane', () => {

  const wp = new WorldParent({}, defaultOptions);
  wp.testMode = true;


  const cell = wp.cell;

  cell.spawnIce([9,1]); // spawn an ice block off to the side to improve coverage, FIXME

  cell.spawnCell([5,4]);
  cell.spawnCell([4,5]);
  cell.spawnCell([5,5]);
  cell.spawnCell([6,5]);
  cell.spawnPotion([6,4]);

  // expect(matchFrame(wp, ef[0])).toBe(true);

  // infect cells in 4,5  5,5  6,5
  wp.cell.stepForward();
  wp.update();


  expect(wp.cell.getDescription([4,4]).match(/crowd/)).toBe(null);
  expect(wp.cell.getDescription([4,5]).match(/crowd/)).toBe(null);
  expect(wp.cell.getDescription([5,6]).match(/crowd/)).toBe(null);
  expect(wp.cell.getDescription([5,4]).match(/crowd/)).not.toBe(null);
  expect(wp.cell.getDescription([5,5]).match(/crowd/)).not.toBe(null);
  expect(wp.cell.getDescription([6,5]).match(/crowd/)).not.toBe(null);


  if( false ) {
    const sz = wp.board.getBoardSize();

    for(let x = 0; x < sz[0]; x++) {
      for(let y = 0; y < sz[1]; y++) {
        const key = `${x}_${y}`;
        const actualCell = wp.cell.tileHasCell([x,y]);

        if( actualCell ) {
          console.log([x,y],wp.cell.getDescription([x,y]));
        }

        // const expectedCell = frame.has(key);
        // if( expectedCell != actualCell ) {
        //   return false;
        // }
      }
    }

  }

 

});
