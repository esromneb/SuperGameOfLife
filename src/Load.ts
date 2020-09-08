import * as Pixi from 'pixi.js';
const loader = Pixi.Loader.shared;

const loadTexture = (name) => {

  const texture = Pixi.utils.TextureCache[name];
  for (let col = 0; col < texture.width / 16; ++col) {
    for (let row = 0; row < texture.height / 16; ++row) {
      const t = new Pixi.Texture(texture);
      t.frame = new Pixi.Rectangle(col * 16, row * 16, 16, 16);
      Pixi.Texture.addToCache(t, `${name}-${col}x${row}`);
    }
  }
};


const load = async () => {

  return new Promise((resolve, reject) => {

    loader.add('x', 'assets/x.png');
    loader.add('ss', 'assets/spritesheet.json');
    loader.add('ice_01', 'assets/ice_01.png');

    loader.load((loader, resources) => {
      resolve(loader);
    });
  });
};

export {
load,
loadTexture,
}
