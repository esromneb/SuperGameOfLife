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

  spriteQuery: Query;
  posQuery: Query;
  graphicsSpriteQuery: Query;
  game: any;
  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

    // @ts-ignore
    this.spriteQuery = this.createQuery()
      .fromAll('Sprite', 'New')
      .persist();

    // @ts-ignore
    this.posQuery = this.createQuery()
      .fromAll('Sprite', 'Position')
      .persist();

    // @ts-ignore
    this.graphicsSpriteQuery = this.createQuery()
      .fromAll('GraphicsSprite', 'New')
      .persist();

    this.game = this.world.getEntity('gentity').c.game;
  }

  update(tick) {
    this.updateGraphicSprites(tick);
    this.updateSprites(tick);
  }

  updateSprites(tick) {
    const sentities = this.spriteQuery.execute();
    for (const entity of sentities) {
      for (const sprite of entity.getComponents('Sprite')) {

        sprite.sprite = Pixi.Sprite.from(sprite.frame);
        sprite.sprite.anchor.set(.5);
        sprite.sprite.scale.set(sprite.scale);
        sprite.sprite.tint = sprite.color;
        if (!sprite.container) {
          sprite.container = this.game.layers[sprite.layer];
        }
        if (sprite.container)
          sprite.container.addChild(sprite.sprite);
      }
      entity.removeTag('New');
    }

    const pentities = this.posQuery.execute();
    for (const entity of pentities) {
      for (const pos of entity.getComponents('Position')) {
        for (const sprite of entity.getComponents('Sprite')) {
          sprite.sprite.position.set(pos.x, pos.y);
          sprite.sprite.rotation = pos.angle + Math.PI / 2;
        }
      }
    }
  }

  updateGraphicSprites(tick) {
    const q = this.graphicsSpriteQuery.execute();
    for (const entity of q) {
      for (const sprite of entity.getComponents('Sprite')) {
        sprite.sprite = new Pixi.Graphics();

      //   sprite.sprite = Pixi.Sprite.from(sprite.frame);
        // sprite.sprite.anchor.set(.5);
        sprite.sprite.scale.set(sprite.scale);
      //   sprite.sprite.tint = sprite.color;
        if (!sprite.container) {
          sprite.container = this.game.layers[sprite.layer];
        }
        if (sprite.container) {
          sprite.container.addChild(sprite.sprite);
        }

        sprite.sprite.lineStyle(2, 0xffffff)
           .moveTo(0, 0)
           .lineTo(10, 0)
           .lineTo(10, 0)
           ;



      }
      // entity.removeTag('New');
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
    const tilex = this.wp.eboard.c.board.x;
    const tiley = this.wp.eboard.c.board.y;

    const sizex = this.wp.eboard.c.board.sizex;
    const sizey = this.wp.eboard.c.board.sizey;

    const ul = 20;

    // these are the start
    let nowx = ul;
    let nowy = ul;

    const maxx = nowx + (tilex*(sizex));
    const maxy = nowy + (tiley*(sizey));

    for(let i = 0; i < (tilex+1) ; i++) {
      cells
        .moveTo(nowx, nowy)
        .lineTo(nowx, maxy);

      nowx += sizex;
    }

    nowx = ul;


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
