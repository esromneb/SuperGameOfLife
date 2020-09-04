import {WorldParent} from '../WorldParent'

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

import * as Pixi from 'pixi.js';

class SpriteSystem extends ApeECS.System {

  newSpritesQ: Query;
  posQuery: Query;
  newGraphicsQ: Query;
  game: any;
  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

    // @ts-ignore
    this.newSpritesQ = this.createQuery()
      .fromAll('Sprite', 'New')
      .persist();

    // @ts-ignore
    this.posQuery = this.createQuery()
      .fromAny('Sprite', 'GraphicsSprite')
      .fromAll('Position')
      .persist();

    // @ts-ignore
    this.newGraphicsQ = this.createQuery()
      .fromAll('GraphicsSprite', 'New')
      .persist();

    this.game = this.world.getEntity('gentity').c.game;
  }

  update(tick) {
    this.updateGraphicSprites(tick);
    this.updateSprites(tick);
  }

  updateSprites(tick) {
    const sentities = this.newSpritesQ.execute();
    for (const entity of sentities) {
      for (const sprite of entity.getComponents('Sprite')) {

        sprite.sprite = Pixi.Sprite.from(sprite.frame);
        sprite.sprite.anchor.set(0,1);
        sprite.sprite.scale.set(sprite.scale);
        sprite.sprite.tint = sprite.color;
        if (!sprite.container) {
          sprite.container = this.game.layers[sprite.layer];
        }
        if (sprite.container)
          sprite.container.addChild(sprite.sprite);
      }
      entity.removeTag('New');
      console.log('New Sprite');
    }

    const q = this.posQuery.execute();
    for (const e of q) {
      for (const pos of e.getComponents('Position')) {
        for (const sprite of [...e.getComponents('Sprite'), ...e.getComponents('GraphicsSprite')]) {
          sprite.sprite.position.set(pos.x, pos.y);
          sprite.sprite.rotation = pos.angle + Math.PI / 2;
        }
      }
    }
  }

  updateGraphicSprites(tick) {
    // grab the gboard entity 
    const gboard = this.world.getEntity('gboard');
    const sz = gboard.c.board.gsize;

    const q = this.newGraphicsQ.execute();
    for (const entity of q) {
      for (const sprite of entity.getComponents('GraphicsSprite')) {
        sprite.sprite = new Pixi.Graphics();

      //   sprite.sprite = Pixi.Sprite.from(sprite.frame);
        // sprite.sprite.anchor.set(.5);
        sprite.sprite.scale.set(sprite.scale);
      //   sprite.sprite.tint = sprite.color;
        if (!sprite.container) {
          sprite.container = this.game.layers[sprite.layer];
          // console.log('set container');
        }
        if (sprite.container) {
          sprite.container.addChild(sprite.sprite);
          // console.log('add child');
        }

        // sprite.sprite.position.set(40,40);

        sprite.sprite.scale.set(1);

        sprite.sprite.beginFill(sprite.color).lineStyle(0,0x000000);

        // -1 is because the grid occupies a single pixel
        // sprite.sprite.drawRect(0,0, sz[0]-1, -39);
        // drawRect really seems backwards, seems like x and y are switched
        // just fudged this till it worked
        sprite.sprite.drawRect(0,0, (sz[1]-1) , -(sz[0]-1));

        // sprite.sprite.lineStyle(2, 0xffffff)
        //    .moveTo(0, 0)
        //    .lineTo(10, 0)
        //    .lineTo(10, 0)
        //    ;



      }
      entity.removeTag('New');
      // console.log("Adding new Graphics Sprite");
    }
  }

  border: any;
  cells: any;

  drawBoundaries() {
    let myGraph = new Pixi.Graphics();
    this.border = myGraph;

    this.wp.addChild(myGraph);

    const {width,height} = this.wp.gamec;

    // Move it to the top left
    myGraph.position.set(0, 0);

    
    myGraph.lineStyle(2, 0xffffff)
           .moveTo(0, 0)
           .lineTo(width, 0);

    myGraph.lineTo(width, height);
    myGraph.lineTo(0, height);
    myGraph.lineTo(0, 0);

    this.drawCellBoundaries();
  }

  drawCellBoundaries() {
    const cells = this.cells = new Pixi.Graphics();
    this.wp.addChild(cells);
    cells.position.set(0, 0);
    cells.lineStyle(1, 0xaaaaaa)
           .moveTo(0, 0);


    const wpx = this.wp.gamec.width;
    const hpx = this.wp.gamec.height;
    const [tilex,tiley] = this.wp.eboard.c.board.tiles;
    // const  = this.wp.eboard.c.board.y;

    const [sizex,sizey] = this.wp.eboard.c.board.gsize;

    const [startx,starty] = this.wp.eboard.c.board.tileOffset;

    // these are the start
    let nowx = startx;
    let nowy = starty;

    const maxx = nowx + (tilex*(sizex));
    const maxy = nowy + (tiley*(sizey));

    // draw vertical lines
    for(let i = 0; i < (tilex+1) ; i++) {
      cells
        .moveTo(nowx, nowy)
        .lineTo(nowx, maxy);

      nowx += sizex;
    }

    nowx = startx;
    nowy = starty;


    for(let j = 0; j < (tiley+1) ; j++) {
      cells
        .moveTo(nowx, nowy)
        .lineTo(maxx, nowy);

      nowy += sizey;
    }

    // console.log(tilex + ' ' + tiley)


    
  }
}

export {
SpriteSystem,
}
