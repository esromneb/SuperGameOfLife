import {WorldParent} from '../WorldParent'

import {
Vec2,
VecXY
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

import * as Pixi from 'pixi.js';

const textStyle = {fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'};
const buttonTextStyle = textStyle;


class InputSystem extends ApeECS.System {

  // spriteQuery: Query;
  // posQuery: Query;
  // graphicsSpriteQuery: Query;
  game: any;
  wp: WorldParent;

  buttonQ: Query;

  constructor(world, worldParent) {
    this.wp = worldParent;
    super(world);
    this.changeUIMode('normal');
  }

  matrix: any = {
    normal: {
      left: {
        up:   this.leftMouseUpNormal.bind(this),
        down: this.leftMouseDownNormal.bind(this),
        drag: this.leftMouseDragNormal.bind(this),
      },
      hover: this.updateMouseHoverTextNormal.bind(this),
      enter: this.enterNormalMode.bind(this),
      exit:  null,
      buttons: this.handleNormalButton.bind(this),
    },
    drop: {
      left: {
        up:   this.leftMouseUpNormal.bind(this),
        down: this.leftMouseDownNormal.bind(this),
        drag: this.leftMouseDragNormal.bind(this),
      },
      hover: this.updateMouseHoverTextNormal.bind(this),
      enter: this.enterDropMode.bind(this),
      exit:  null,
      buttons: null,
    }
  }

  init() {
    this.game = this.world.getEntity('gentity').c.game;

    // @ts-ignore
    this.buttonQ = this.createQuery()
      .fromAll('ButtonPress')
      .persist();


  }

  update(tick) {
    const mode = this.wp.gentity.c.ui.mode;
    const q = this.buttonQ.execute();
    for(const e of q) {
      // console.log('aaaaaaaaaaaaa');
      console.log("this button clicked in mode " + mode);
      // console.log(e);
      // console.log(e.c.button.number);

      const nrow = this.matrix[mode];
      if(nrow.buttons) {
        console.log('found button fn');
        nrow.buttons(e.c.button.number);
        // nrow.bu
        // nrow.buttons
      }

      this.world.removeEntity(e);
    }
    // this.updateGraphicSprites(tick);
    // this.updateSprites(tick);
  }


  changeUIMode(m: string): void {

    // asked to change into mode we are already in
    if( m === this.wp.gentity.c.ui.mode ) {
      return;
    }

    const prev = this.wp.gentity.c.ui.mode;
    let next;

    if( m in this.matrix ) {
      next = m;
    } else {
      next = 'normal';
    }

    if( prev !== next ) {
      this.wp.gentity.c.ui.mode = next;


      const orow = this.matrix[prev];
      if(prev !== '__init' && orow.exit) {
        orow.exit(next);
      }

      const nrow = this.matrix[next];
      if(nrow.enter) {
        nrow.enter(prev);
      }
    }
  }



  updateMouse() {
    const xypos: VecXY = this.wp.game.renderer.plugins.interaction.mouse.global;
    const pos: Vec2 = [xypos.x, xypos.y]; // fresh

    this.updateMousePosition(pos);
    this.updateMouseButtons(pos);
  }
  private updateMousePosition(pos: Vec2) {
    // input pos is fresh value

    // previous (pos/moved) gets set to now
    this.wp.mouse.c.prev.pos = this.wp.mouse.c.now.pos;
    this.wp.mouse.c.prev.moved = this.wp.mouse.c.now.moved;

    // we compare fresh to now
    const moved = (pos[0] != this.wp.mouse.c.now.pos[0]) || (pos[1] != this.wp.mouse.c.now.pos[1]);

    // now gets set to fresh values
    this.wp.mouse.c.now.pos = pos;
    this.wp.mouse.c.now.moved = moved;

    if( this.wp.mouse.c.now.moved ) {
      // console.log(this.wp.game.renderer.plugins.interaction.mouse.buttons);
      // console.log(pos);
    }
  }

  private updateMouseButtons(pos: Vec2) {
    const buttons = this.wp.game.renderer.plugins.interaction.mouse.buttons;
    const state = this.wp.mouse.c.state;

    const left = buttons & 0x1;
    if( state.leftWasDown && !left ) {
      state.leftWasDown = false;
      this.handleMouseUpDown('left', false, pos);
    } else if( !state.leftWasDown && left ) {
      state.leftWasDown = true;
      state.leftDragStart = pos;
      this.handleMouseUpDown('left', true, pos);
    }

    if( state.leftWasDown ) {
      this.handleMouseDrag('left', pos, state.leftDragStart);
    }
  }


  private handleMouseUpDown(button: string, down: boolean, pos: Vec2) {
    const row = this.matrix[this.wp.gentity.c.ui.mode];
    const key = down?'down':'up';
    if(row.left[key]) {
      row.left[key](pos);
    }
  }
  private handleMouseDrag(button: string, pos: Vec2, start: Vec2) {
    const row = this.matrix[this.wp.gentity.c.ui.mode];
    if(row.left.drag) {
      row.left.drag(pos, start);
    }
  }

  buttons: any[] = [];


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
      // console.log(x.data.originalEvent.which);
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


    let text = new Pixi.Text(
      'Step',
      {fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'}
      );
    this.wp.addChild(text);

    text.position.set(ox,oy);



    this.drawButton2();
    this.buttons[0] = this.addButton(0, [700,400], [40,40]);
    this.buttons[1] = this.addButton(1, [780,400], [40,40]);

    this.hoverText = this.wp.sprite.addText('plce', [600,600], textStyle);
  }

  hoverText: Entity;


  buttonWasPressed(number: number): void {
    console.log("Button " + number + " press on frame " + this.wp.world.currentTick);
    const s = this.world.createEntity({
      components: [
        {
          type: 'ButtonPress',
          key: 'button',
          number,
        },
      ]
    });
  }

  setHoverText(t: string): void {
    this.hoverText.c.s0.text = t;
  }

  addButton(n: number, pos: Vec2, size: Vec2): any {
    let ret: any = {};
    let button = new Pixi.Graphics();
    // this.border = button;

    this.wp.addChild(button);

    // const {width,height} = this.wp.gamec;

    let [ox,oy] = pos;

    let [width, height] = size;


    // Move it to the top left
    button.position.set(ox, oy);

    button.beginFill(0x444444);

    button.drawRect(0,0, width, height );


    button.buttonMode = true;
    button.interactive = true;

    let onButtonUp = (x) => {
      console.log(x);
    }


    button
      .on('mouseup',  this.buttonWasPressed.bind(this, n))
      .on('touchend', this.buttonWasPressed.bind(this, n));


    ret.button = button;
    ret.text = this.wp.sprite.addText('but 0', pos, buttonTextStyle);
    // let text = new Pixi.Text('Step',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
    // this.wp.addChild(text);

    // text.position.set(ox,oy);
    return ret;
  }


  drawButton2(): any {
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

  private leftMouseDragNormal(m: Vec2, start: Vec2): void {
    console.log(`drag from [${start[0]},${start[1]}]  to  [${m[0]},${m[1]}]`);
  }

  private leftMouseUpNormal(m: Vec2): void {
    console.log('leftMouseUpNormal');
  }
  private leftMouseDownNormal(m: Vec2): void {
    console.log('leftMouseDownNormal');
  }
  private updateMouseHoverTextNormal(v: Vec2): void {

  }

  private enterNormalMode(): void {
    console.log("entering normal mode");
  }

  private enterDropMode(): void {
    console.log("entering normal mode");
  }

  private handleNormalButton(n: number): void {
    console.log("handle normal button " + n);
  }



}

export {
InputSystem,
}
