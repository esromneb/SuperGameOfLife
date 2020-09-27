import {WorldParent} from './WorldParent'
import {Scene} from './Scene'
import {Manager} from './Manager'
import {load} from './Load'


import * as Pixi from 'pixi.js';


const defaultOptions = {
  width: 1920,
  height: 1080,
  transparent: false,
  backgroundColor: 0x000000,
  initialCellPattern: 5,
};


// Pixi.BaseTexture.scaleMode = Pixi.SCALE_MODES.NEAREST;
Pixi.settings.SCALE_MODE = Pixi.SCALE_MODES.NEAREST;

class BrowserInterface {

  options: any;
  renderer: any;
  stage: any;
  lastTime: any;
  scenes: any;
  manager: any;
  map: any;
  container: any;
  wp: WorldParent;

  constructor(options) {
    this.options = {};
    Object.assign(this.options, defaultOptions, options);
    console.log(this.options.width);
    this.renderer = Pixi.autoDetectRenderer(this.options);
    this.options.container.appendChild(this.renderer.view);
    this.stage = new Pixi.Container();

    this.start();
    this.lastTime = 0;
  }

  async start() {
    await load();
    console.log('loaded', this.options.width, this.options.height, this.options.container);
    this.manager = new Manager(this, this.stage);
    this.wp = new WorldParent(this, this.options);
    this.manager.addScene('mainscene', this.wp);

    window.requestAnimationFrame(this.update.bind(this));
    return Promise.resolve();
  }

  update(time) {
    const deltaTime = Math.min(time - this.lastTime, 500);
    const deltaFrame = deltaTime / 16.6666667;
    this.lastTime = time;

    this.wp.update(deltaTime, deltaFrame, time);
    this.renderer.render(this.stage);
    window.requestAnimationFrame(this.update.bind(this));
  }
}

const inst = new BrowserInterface({
  container: document.getElementById('container')
});


export {
inst,
WorldParent,
BrowserInterface,
}