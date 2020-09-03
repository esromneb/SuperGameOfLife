const FMS = 1000/60;

class Manager {

  [name: string]: any;


  constructor(game, parent) {

    this.game = game;

    this.scenes = {};
    this.sceneList = [];
    this.stage = parent;

    this.paused = false;
    this.lastTime = 0;
  }

  addScene(name, scene) {

    this.stage.addChild(scene);
    scene.standUp();
    //scene.setParent(this);
    this.scenes[name] = scene;
    this.sceneList.push(scene);
  }

  removeScene(name) {

    const scene = this.scenes[name];
    scene.tearDown();
    //scene.setParent(null);
    this.stage.removeChild(scene);
    this.sceneList.splice(this.sceneList.indexOf(scene), 1);
    delete this.scenes[name];
  }

  start() {

    if (!this.paused)
      return this.update(0);
  }

  pause() {

    this.paused = true;
  }

  unpause() {

    this.paused = false;
  }

  togglePause() {

    this.paused = !this.paused;
  }

  update(ts) {

    window.requestAnimationFrame(this.update.bind(this));
    let dt = this.lastTime ? Math.min(ts - this.lastTime, 64): 0;
    let du = dt / FMS;
    this.lastTime = ts;

    if (this.paused) return;

    for(const scene of this.sceneList) {
      scene.update(dt, du, ts);
    }

  }
}

export {
Manager
}
