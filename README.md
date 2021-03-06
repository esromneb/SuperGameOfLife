[![Build Status](https://travis-ci.com/esromneb/SuperGameOfLife.svg?branch=master)](https://travis-ci.com/esromneb/SuperGameOfLife)
# SuperGameOfLife [Play Now!](https://esromneb.github.io/SuperGameOfLife/build/)
This is an example application using [Ape-ECS](https://github.com/fritzy/ape-ecs) Entity Component System.  This is a my take on Conways Game of Life; cells can pick up potions that give them bufs and nerfs.

## Screenshot
![A Screenshot](https://github.com/esromneb/SuperGameOfLife/raw/master/assets/screenshot01.png)

# Instructions
```bash
git clone https://github.com/esromneb/SuperGameOfLife.git
cd SuperGameOfLife
npm install
npm run dev
```

Or just [play now in your browser.](https://esromneb.github.io/SuperGameOfLife/build/)

# Design

## World Parent
* [WorldParent.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/WorldParent.ts)
* This is a class called `WorldParent`
* This class holds the `World` instance of [Ape-ECS](https://github.com/fritzy/ape-ecs)
* This class has an `update()` which ticks the systems and `Ape-ECS` in the desired order
* This file builds global `Entites` during constructions
  * These `Entites` have things like the mouse position, ui mode, and board dimensions.

## Cell System
* [CellSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/CellSystem.ts)
* This is the core game logic
* Every tick a query is run which searches for `Entites` with the `StepSimulation` `Component` on them.
  * In order to step the simulation, create an `Entity` like this anywhere in the application and on the next `tick` it sill step.
  * The simulation can also be stepped backwards, this is done by the `HistorySystem`
* `calculateLife()` is the main function, a bit complicated
  * Depending on the `PotionEffect` `Components` that are added to cells, original or modified "Game of Life" rules are followed
  * Cells which are spawned from parents that have effects will inherit a portion of the effect.  The parents are then diluted.
* The color of cells is calculated by `cellColor()`

## Board System
* [BoardSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/BoardSystem.ts)
* This file has a few helpers for mouse handlers.

## Input System
* [InputSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/InputSystem.ts)
* One of the more complicated files.  This controls the `mode` property on the `UIState` `Component` which is on the `gentity` Entity.
* The `mode` controls what the mouse does
  * `normal` clicking will add or remove a cell
  * `mutate` clicking will cycle through cell types

## History System
* [HistorySystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/HistorySystem.ts)
* Keeps a history log of step.  This can be undone just like an "undo" feature
* This shows example code of how you might write a save/load game.

## Sprite System
* [SpriteSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/SpriteSystem.ts)
* Drives [pixi.js](https://github.com/pixijs/pixi.js) do display sprites
* When tint or other attributes of sprites are changed, this system will update `pixi.js` in the `update()` function
* This is a really basic / bad example of using Ape-ECS/pixi.js

## Components
* [Components.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/components/Components.ts)
* Components has all the components used in this game.

## Boilerplate
* These files are boilerplate
* `Load.ts`
* `Manager.ts`
* `Scene.ts`
* `main.ts`

# Game Rules
* Any dead cell which becomes a live cell will inherit effects from it's parents.
* The full effect of the potion is applied to all neighbor cells at the next step, there is no dilution.

# Game Order of Operations
* Cells which will consume potions are recorded but not consumed.
* Cell spawn/kill rules apply based on current effects
* Cells that still exist will consume potions.

# Assets
Assets are from
* https://kyrise.itch.io/kyrises-free-16x16-rpg-icon-pack
And the loose icon files were generated into a sprite sheet with
* https://github.com/krzysztof-o/spritesheet.js

