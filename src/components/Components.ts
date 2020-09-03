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
    vec2: [0,0],
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
    tiles: [0,0], // how many tile in the x and y direction [x,y]
    tileOffset: [20,20], // how many pixels from 0,0 does the board start, in pixels [x,y]
    gsize: [40,40] // graphics size of each tile in pixels, [x,y]
  }
}

export class Cell extends Component {
  static properties = {
    tickAdded: 0,
    sprite: EntityRef,
  }
}
