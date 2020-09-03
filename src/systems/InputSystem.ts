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

class InputSystem extends ApeECS.System {

  // spriteQuery: Query;
  // posQuery: Query;
  // graphicsSpriteQuery: Query;
  game: any;
  wp: WorldParent;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;
  }

  init() {

    this.game = this.world.getEntity('gentity').c.game;
  }

  update(tick) {
    // this.updateGraphicSprites(tick);
    // this.updateSprites(tick);
  }

  // border: any;
  cells: any;

  drawButtons() {
    let button = new Pixi.Graphics();
    // this.border = button;

    this.wp.addChild(button);

    // const {width,height} = this.wp.gamec;

    let [ox,oy] = [400,400];

    let width  =  90;
    let height =  40;


    // Move it to the top left
    button.position.set(ox, oy);

    button.beginFill(0x444444);

    button.drawRect(0,0, width, height );


    button.buttonMode = true;
    button.interactive = true;

    let onButtonDown = (x) => {
      console.log(x);
    }

    let onButtonUp = (x) => {
      this.wp.cell.calculateLife();
      console.log(x);
    }

    let onButtonOver = (x) => {
      console.log(x);
    }

    let onButtonOut = (x) => {
      console.log(x);
    }

    button
        // set the mousedown and touchstart callback...
        .on('mousedown', onButtonDown)
        .on('touchstart', onButtonDown)

        // set the mouseup and touchend callback...
        .on('mouseup', onButtonUp)
        .on('touchend', onButtonUp)
        .on('mouseupoutside', onButtonUp)
        .on('touchendoutside', onButtonUp)

        // set the mouseover callback...
        .on('mouseover', onButtonOver)

        // set the mouseout callback...
        .on('mouseout', onButtonOut)


    let text = new Pixi.Text('Step',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
    this.wp.addChild(text);

    text.position.set(ox,oy);



  }
}

export {
InputSystem,
}
