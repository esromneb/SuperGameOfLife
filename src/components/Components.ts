import {
  Component,
  EntityRef,
  EntitySet,
} from 'ape-ecs';

export class GlobalState extends Component {
  static properties = {
    nextUnitId: 0,
    nextPathRequestId: 2000,
  };
};
 
export class Sprite extends Component {

  static properties = {
    frame: '',
    layer: '',
    anchorX: .5,
    anchorY: .5,
    scale: 1,
    sprite: null,
    container: null,
    color: 0xffffff
  }

  init() {

  }

  preDestroy() {

    if (this.sprite)
      this.sprite.destroy();
    this.container = null;
    this.sprite = null;
  }

};


export class Position extends Component {

  static properties = {
    x: 0,
    y: 0,
    angle: 0
  }
};
