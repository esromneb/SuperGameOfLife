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

  tileToPixel(tile: Vec2): Vec2 {
    return [0,0];
  }


}

export {
BoardSystem,
}
