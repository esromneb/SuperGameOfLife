import {WorldParent} from '../src/WorldParent'

import { mocked } from 'ts-jest/utils';

// import jest from 'jest'

const defaultOptions = {
  width: 1920,
  height: 1080,
  transparent: false,
  backgroundColor: 0x000000,
};


jest.mock('pixi.js');


test('WorldParent builds', done => {
  console.log("test start");

  const wp = new WorldParent({}, defaultOptions);

  // expect(4).not.toBe(undefined);
  done();
});
