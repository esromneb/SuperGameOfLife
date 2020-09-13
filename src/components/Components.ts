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

  // istanbul ignore next
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

  // istanbul ignore next
  preDestroy() {

    if (this.sprite) {
      this.sprite.destroy();
    }
    this.container = null;
    this.sprite = null;
  }

};

export class TextSprite extends Component {

  static properties = {
    text: '',
    layer: '',
    style: {},
    sprite: null,
    container: null,
  }

  init() {

  }

  // istanbul ignore next
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

export class UIState extends Component {
  static properties = {
    mode: '__init',
  }
}


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
    ctype: 'cell',
  }
}

export class GMouse extends Component {
static properties = {
    pos: [0,0],
    moved: true,
  };
};


export class GMouseState extends Component {
  static properties = {
    leftWasDown: false,
    leftDragStart: [0,0],
    rightWasDown: false,    // Not used
    rightDragStart: [0,0],  // Not used
    middleWasDown: false,   // Not used
    middleDragStart: [0,0], // Not used
  };
};

export class ButtonPress extends Component {
static properties = {
    number: 0,
  };
};

export class StepSimulation extends Component {
static properties = {
    forward: true, // set to false to step back
  };
};

// created whenever a cell changes and or the board steps
export class CellStateChanged extends Component {
static properties = {
  };
};


export class PotionEffect extends Component {
static properties = {
    crowdProtection: undefined,
    aloneProtection: undefined,
  };
};

export class CellHistory extends Component {
static properties = {
    snapshots: []
  };
};
