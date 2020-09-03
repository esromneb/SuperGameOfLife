import * as ComponentExports from './components/Index'
import {Scene} from './Scene'

import {SpriteSystem} from './systems/SpriteSystem'
import {BoardSystem} from './systems/BoardSystem'
import {CellSystem} from './systems/CellSystem'

// import {GlobalState} from './components/Components'

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


class WorldParent extends Scene {
  world: World;

  sprite: SpriteSystem;
  board: BoardSystem;
  cell: CellSystem;

  eboard: Entity;

  gamec: Component;

  constructor(game: any, public options: any = {}) {
    super(game);

    this.world = new ApeECS.World({
      entityPool: 4000,
      cleanupPools: false,
    });

    this.registerComponents();
    this.registerTags();
    this.setupFirstEntities();
    this.debugEntities();
    this.setupSystems();
    this.finalInit();


  }

  update(dt, df, time): void {
    // console.log("World Parent Update", dt);
    this.world.runSystems('sprite');
  }


  finalInit(): void {
    this.eboard = this.board.initBoard(12,8);
    this.sprite.drawBoundaries();


    this.cell.addCell([0,0]);
    this.cell.addCell([1,1]);
    this.cell.addCell([1,0]);
    this.cell.addCell([2,2]);

    this.cell.addCell([5,4]);
    this.cell.addCell([5,5]);
    this.cell.addCell([5,6]);
    this.cell.addCell([4,5]);
    this.cell.addCell([6,5]);

  }

  setupFirstEntities(): void {
    const gentity = this.world.createEntity({
      id: 'gentity',
      components: [
        {
          type: 'Game',
          key: 'game',
          width: this.options.width,
          height: this.options.height,
          layers: {
            'main': this
          }
        }
      ]
    });
    this.gamec = gentity.c.game;


  }

  debugEntities(): void {
    const game = this.gamec;
    let x = 40;

    const entity = this.world.createEntity({
        tags: ['New', 'Station'],
        components: [
          {
            type: 'Sprite',
            frame: 'x',
            container: game.layers.main,
            scale: 3,
            color: 0xffffff
          },
          {
            type: 'Position',
            x,
            y: game.height - 20,
            angle: -Math.PI / 2
          }
        ]
      });
  }

  setupSystems(): void {
    this.sprite     = this.world.registerSystem('sprite', new SpriteSystem(this.world, this));
    this.board      = this.world.registerSystem('board',  new BoardSystem(this.world, this));
    this.cell       = this.world.registerSystem('cell',   new CellSystem(this.world, this));
  }

  registerComponents(): void {
    for (const name of Object.keys(ComponentExports)) {
      this.world.registerComponent(ComponentExports[name]);
      // this.world.registerComponent(GlobalState, 10);
    }
  }

  registerTags(): void {
    let tags: string[] = [];

    tags.push('New');
    tags.push('Station');

    this.world.registerTags(...tags);
  }

}

export {
WorldParent,
}