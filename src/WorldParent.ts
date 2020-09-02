import * as ComponentExports from './components/Index'


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
  System,
  Component,
};


class WorldParent {
  world: World;

  constructor(public browserInterface: any) {
    console.log("Built parent"); 

    this.world = new ECS.World({
      entityPool: 4000,
      cleanupPools: false,
    });

    // this.registerComponents();
    this.setupFirstEntities();
  }

  update(dt, df, time): void {
    console.log("World Parent Update", dt);
  }

  setupFirstEntities(): void {

  }

  registerComponents(): void {
    for (const name of Object.keys(ComponentExports)) {
      this.world.registerComponent(ComponentExports[name]);
    }
  }

}

export {
WorldParent,
}