# SuperGameOfLife
This is an example application using [Ape-ECS](https://github.com/fritzy/ape-ecs) Entity Component System.  This is a spin on Conways Game of Life where cells can pick up potions that give them bufs and nerfs.

# Design

## Board System
* [BoardSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/BoardSystem.ts)
This file has a few helpers for mouse handlers

## Input System
* [BoardSystem.ts](https://github.com/esromneb/SuperGameOfLife/blob/master/src/systems/InputSystem.ts)


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

