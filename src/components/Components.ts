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


export class GraphicsSprite extends Component {

  static properties = {
    layer: '',
    // anchorX: .5,
    // anchorY: .5,
    scale: 1,
    sprite: null,
    container: null,
    color: 0xffffff
  }

  init() {

  }

  preDestroy() {

    if (this.sprite) {
      this.sprite.destroy();
    }
    this.container = null;
    this.sprite = null;
  }

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

    if (this.sprite) {
      this.sprite.destroy();
    }
    this.container = null;
    this.sprite = null;
  }

};


export class Tile extends Component {
  static properties = {
    x: 0,
    y: 0,
    angle: 0
  }
};

export class Position extends Component {
  static properties = {
    x: 0,
    y: 0,
    angle: 0
  }
};


export class Game extends Component {
  static properties = {
    deltaTime: 0,
    deltaFrame: 0,
    width: 0,
    height: 0,
    layers: null
  }
}


export class GameBoard extends Component {
  static properties = {
    x: 0,
    y: 0,
    sizex: 40,
    sizey: 40,
  }
}

export class Cell extends Component {
  static properties = {
    tickAdded: 0,
    sprite: EntityRef,
  }
}
