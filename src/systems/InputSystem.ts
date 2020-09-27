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


// istanbul ignore next
class InputSystem extends ApeECS.System {

  // spriteQuery: Query;
  // posQuery: Query;
  // graphicsSpriteQuery: Query;
  game: any;
  wp: WorldParent;

  buttonQ: Query;
  changedQ: Query;

  constructor(world, worldParent) {
    super(world);
    this.wp = worldParent;

  }

  // matrix.x.left will only be called inside these bounds

  clickBounds: [Vec2,Vec2];

  matrix: any = {
    normal: {
      left: {
        up:   this.leftMouseUpNormal.bind(this),
        down: this.leftMouseDownNormal.bind(this),
        drag: null,//this.leftMouseDragNormal.bind(this),
      },
      hover: this.updateMouseHoverTextNormal.bind(this),
      enter: this.enterNormalMode.bind(this),
      exit:  null,
      buttons: this.handleNormalButton.bind(this),
      changed: this.boardChangedMudate.bind(this),
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
      changed: null,
    },
    mutate: {
      left: {
        up:   null,
        down: this.leftMouseUpMutate.bind(this),
        drag: null,
      },
      hover: this.mutateHover.bind(this),
      enter: this.enterMutateMode.bind(this),
      exit:  null,
      buttons: this.handleMutateButton.bind(this),
      changed: this.boardChangedMudate.bind(this),
    }
  };

  init() {
    this.game = this.world.getEntity('gentity').c.game;

    // do not call .persist()
    // see comment below
    this.buttonQ = this.createQuery()
      .fromAll('ButtonPress');

    this.changedQ = this.createQuery()
      .fromAll('CellStateChanged');


  }

  update(tick) {
    const mode = this.wp.gentity.c.ui.mode;
    this.handleButtonUpdate(mode);
    this.handleCellStateChanged(mode);
  }

  handleButtonUpdate(mode: string): void {

    // ButtonPress gets created in the callback which is bound to pixi/the browser
    // because of this, We assume that the ButtonPress gets created after
    // WorldParent.tick()
    // Here we would like to react to this as fast as possible
    // If we were to used a persisted query, it would only be updated at tick()
    // so instead we call .refresh().execute() every time.
    // we could also use `world.updateIndexes().` but this adds extra overhead

    const q = this.buttonQ.refresh().execute();
    // const q = this
    // .createQuery()
    // .fromAll('ButtonPress')
    // .execute();
    for(const e of q) {
      // console.log('aaaaaaaaaaaaa');
      console.log("this button clicked in mode " + mode);
      // console.log(e);
      // console.log(e.c.button.number);

      const nrow = this.matrix[mode];
      if(nrow.buttons) {
        // console.log('found button fn');
        nrow.buttons(e.c.button.number);
        // nrow.bu
        // nrow.buttons
      }

      this.world.removeEntity(e);
    }
    // this.updateGraphicSprites(tick);
    // this.updateSprites(tick);
  }

  handleCellStateChanged(mode: string): void {
    // see comment in handleButtonUpdate()

    let anyChanges: boolean = false;

    const q = this.changedQ.refresh().execute();
    for(const e of q) {
      // console.log("cells changed in " + mode);

      const nrow = this.matrix[mode];
      if(nrow.changed) {
        // console.log('found button fn');
        nrow.changed();
        // nrow.bu
        // nrow.buttons
      }

      anyChanges = true;
      this.world.removeEntity(e);
    }

    if( anyChanges ) {
      this.dispatchHoverUpdate();
    }
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


  supressTap = 0;

  updateMouse() {

    let xypos: VecXY;

    // a bunch of hacks, I don't understand pixi.js mobile
    // seems like activeInteractionData has a new value forever with each touch
    let data = this.wp.game.renderer.plugins.interaction.activeInteractionData;
    let gotTouch: boolean = false;
    if( 2 in data ) {
      let i;
      for(i = 2;;i++) {
        if( i in data ) {

        } else {
          break;
        }
      }

      if( (i-1) === this.supressTap ) {
        return; // dont update mouse at all
      } else {

        xypos = data[i-1].global;

        let ppos: Vec2 = [xypos.x, xypos.y]

        this.handleMouseUpDown('left', false, ppos);
        this.handleMouseUpDown('left', true, ppos);

        this.supressTap = i-1;
      }
    } else {
      // handle desktop mouse
      xypos = this.wp.game.renderer.plugins.interaction.mouse.global;
    }

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
      this.dispatchHoverUpdate();
    }
  }

  private dispatchHoverUpdate(): void {
      const mode = this.wp.gentity.c.ui.mode;
      // console.log(this.wp.game.renderer.plugins.interaction.mouse.buttons);
      // console.log(pos);
      const row = this.matrix[mode];
      if(row.hover) {
        row.hover(this.wp.mouse.c.now.pos);
      }
  }

  private updateMouseButtons(pos: Vec2) {
    // console.log(this.wp.game.renderer.plugins.interaction.activeInteractionData);
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

  pixelInsideClickBounds(pos: Vec2): boolean {
    const b = this.clickBounds;
    const ul = b[0];
    const br = b[1];
    if(pos[0] < ul[0] || pos[1] < ul[1] || pos[0] > br[0] || pos[1] > br[1]) {
      return false;
    }
    return true;
  }

  private handleMouseUpDown(button: string, down: boolean, pos: Vec2): void {
    const row = this.matrix[this.wp.gentity.c.ui.mode];


    // drop "down" if they are outside the bounds
    if(down) {
      if(!this.pixelInsideClickBounds(pos)) {
        return;
      }
    }

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

  finalInit(): void {
    this.drawButtons();
    this.changeUIMode('normal');
    this.clickBounds = this.wp.board.getClickBounds();
  }

  drawButtons() {

    const startX = 40;
    const startY = 700;

    const s = 100;

    let x = startX - s;
    let n = 0;
    const dimensions: Vec2 = [60+20,40+20];


    // this code adds buttons and increments n as well as shifting the x
    // position to the right
    this.buttons[n] = this.addButton(n, [(x+=s),startY], dimensions); n++;
    this.buttons[n] = this.addButton(n, [(x+=s),startY], dimensions); n++;
    this.buttons[n] = this.addButton(n, [(x+=s),startY], dimensions); n++;
    this.buttons[n] = this.addButton(n, [(x+=s),startY], dimensions); n++;

    // for(let i = 0; i < 4; i++) {
    //   console.log(this.buttons[i]);
    // }

    // console.log(this.buttons[2].text.c.position);
    // this.buttons[2].text.c.position.x = 60;

    // setup the hover text that tracks the mouse
    this.hoverText = this.wp.sprite.addText('plce', [600,600], textStyle);
  }

  setButtonText(n: number, t: string): void {
    if( n >= this.buttons.length ) {
      throw new Error(`setButtonText: ${n} is larger than the number of buttons (${this.buttons.length})`);
    }

    this.buttons[n].text.c.s0.text = t;
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

    // console.log("adding button n " + n);

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
    ret.text = this.wp.sprite.addText(`button ${n} default text`, pos, buttonTextStyle);
    // let text = new Pixi.Text('Step',{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
    // this.wp.addChild(text);

    // text.position.set(ox,oy);
    return ret;
  }


  private leftMouseDragNormal(m: Vec2, start: Vec2): void {
    console.log(`drag from [${start[0]},${start[1]}]  to  [${m[0]},${m[1]}]`);
  }

  private leftMouseUpNormal(px: Vec2): void {
    // console.log('leftMouseUpMutate');
  }
  private leftMouseDownNormal(px: Vec2): void {
    console.log('leftMouseDownNormal');
    const tile: Vec2 = this.wp.board.pixelToTile(px);

    this.wp.cell.mutateCellFlip(tile);
    this.wp.cell.notifyCellStateChanged();
  }
  // private updateMouseHoverTextNormal(v: Vec2): void {
  //   // console.log(v);
  //   this.hoverText.c.position.x = v[0]+10;
  //   this.hoverText.c.position.y = v[1]+10;
  //   // this.text.position.set(...this.wp.mouse.c.now);
  // }

  private updateMouseHoverTextNormal(px: Vec2): void {
    this.hoverText.c.position.x = px[0]+10;
    this.hoverText.c.position.y = px[1]+10;

    const tile: Vec2 = this.wp.board.pixelToTile(px);

    const t0 = `Normal: ${px[0]},${px[1]}`;

    let t1 = '';
    if( this.pixelInsideClickBounds(px) ) {

      let description = this.wp.cell.getDescription(tile);


      t1 = `: Tile, ${tile[0]},${tile[1]} ${description}`;
    }

    const tf = t0 + t1;

    this.setHoverText(tf);

  }


  private enterNormalMode(): void {
    // console.log("entering normal mode");
    this.updateStepBackButtonText();
    this.setHoverText('normal');
    this.setButtonText(1, 'Step');
    this.setButtonText(2, '-');
    this.setButtonText(3, 'Mutate');
  }

  private handleNormalButton(n: number): void {
    console.log("handle normal button " + n + " on frame " + this.world.currentTick);
    switch(n) {
      case 0:
        this.world.createEntity({c:{StepSimulation:{forward:false}}});
        break;
      case 1:
        // this.world.createEntity({components: [{type: 'StepSimulation'}]});
        this.world.createEntity({c:{StepSimulation:{}}});
        break;
      // case 1:
      //   this.changeUIMode('drop');
      //   break;
      case 3:
        this.changeUIMode('mutate');
        break;
      default:
        console.log(`Unhandled ${n} in handleNormalButton()`);
        break;
    }
  }

  private enterDropMode(): void {
    console.log("entering enterDropMode mode");
    this.setHoverText('drop');
  }

  private updateStepBackButtonText(): void {

    const len = this.wp.history.cellHistoryLength();

    let text;
    if( len === 0 ) {
      text = ' -';
    } else {
      text = `Step Back\n1 of ${len}`;
    }


    this.setButtonText(0, text);
  }

  private enterMutateMode(): void {
    this.updateStepBackButtonText();
    this.setButtonText(1, 'Step');
    this.setButtonText(2, 'Exit Mode');
    this.setButtonText(3, '-');
  }

  private handleMutateButton(n: number): void {
    console.log("handle normal button " + n + " on frame " + this.world.currentTick);
    switch(n) {
      case 0:
        this.world.createEntity({c:{StepSimulation:{forward:false}}});
        break;
      case 1:
        this.world.createEntity({c:{StepSimulation:{}}});
        break;
      case 2:
        this.changeUIMode('normal');
        break;
      case 3:
        break;
      default:
        console.log(`Unhandled ${n} in handleNormalButton()`);
        break;
    }
  }

  private leftMouseUpMutate(px: Vec2): void {
    console.log('leftMouseUpMutate');
    const tile: Vec2 = this.wp.board.pixelToTile(px);

    this.wp.cell.mutateCell(tile);
    this.wp.cell.notifyCellStateChanged();
  }

  private mutateHover(px: Vec2): void {
    this.hoverText.c.position.x = px[0]+10;
    this.hoverText.c.position.y = px[1]+10;

    const tile: Vec2 = this.wp.board.pixelToTile(px);

    const t0 = `Mutate: ${px[0]},${px[1]}`;

    let t1 = '';
    if( this.pixelInsideClickBounds(px) ) {

      let description = this.wp.cell.getDescription(tile);


      t1 = `: Tile, ${tile[0]},${tile[1]} ${description}`;
    }

    const tf = t0 + t1;

    this.setHoverText(tf);

  }

  private boardChangedMudate(): void {
    this.updateStepBackButtonText();
  }

  // ecs.createEntity({
  //     c: {
  //       Health: { hp: 10 }
  //     }
  //   });



}

export {
InputSystem,
}
