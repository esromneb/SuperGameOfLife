# SuperGameOfLife


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

