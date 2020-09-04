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

import {
Vec2,
VecXY
} from '../Types'

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


  updateMouse() {
    const xypos: VecXY = this.wp.game.renderer.plugins.interaction.mouse.global;
    const pos: Vec2 = [xypos.x, xypos.y]; // fresh

    // previous (pos/moved) gets set to now
    this.wp.mouse.c.prev.pos = this.wp.mouse.c.now.pos;
    this.wp.mouse.c.prev.moved = this.wp.mouse.c.now.moved;

    // we compare fresh to now
    const moved = pos[0] != this.wp.mouse.c.now.pos[0] || pos[1] != this.wp.mouse.c.now.pos[1];

    // now gets set to fresh values
    this.wp.mouse.c.now.pos = pos;
    this.wp.mouse.c.now.moved = moved;

    // if( this.wp.mouse.c.now.moved ) {
    //   console.log(pos);
    // }
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



    this.drawButton2();
  }


  drawButton2() {
    let button = new Pixi.Graphics();
    // this.border = button;

    this.wp.addChild(button);

    // const {width,height} = this.wp.gamec;

    let [ox,oy] = [500,400];

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
        // .on('mouseover', onButtonOver)

        // set the mouseout callback...
        // .on('mouseout', onButtonOut)


    let text = new Pixi.Text('Step',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
    this.wp.addChild(text);

    text.position.set(ox,oy);



  }
}

export {
InputSystem,
}
