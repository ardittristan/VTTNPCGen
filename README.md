![GitHub All Releases](https://img.shields.io/github/downloads/ardittristan/VTTNPCGen/total)
[![Donate](https://img.shields.io/badge/Donate-PayPal-Green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TF3LJHWV9U7HN)

# Not Enough NPCs

This module adds a customizable NPC Generator to Foundry.

## Installation

To install, import this [Manifest](https://raw.githubusercontent.com/ardittristan/VTTNPCGen/master/module.json) into your module browser.

## Usage

### General Usage

A new button should've been added to the bottom of the Actors tab named Generate NPC. This button opens a window where you can select what you want to include in the generation. If you're satisfied with your generation, click Accept to save the NPC to a NPC sheet.

### Custom Images

On the generator application there is an image settings button. Clicking this button will pop up the image setting list, any folder and it's you put in here will be used with it's subdirectories for searching icons. Make sure you don't have too many subdirectories in the folder or it might take a while to generate a npc. To select a folder with the filepicker, just select any file in the folder and it'll automatically remove the filename from the textbox once closed.

### Custom Data

It is possible to import custom data into the generator. The data get's loaded from JSON. In the settings there is an option to open a JSON editor where you can add your own entries. For some formatting examples you can look at [__Examples__](https://github.com/ardittristan/VTTNPCGen/blob/master/examples.md), or double click on a tab in the editor to see the default data.

If you don't want to use the default data but only your custom data. You can toggle the default data on and off at the bottom of the editor.

## Changelog

Check the [Changelog](https://github.com/ardittristan/VTTNPCGen/blob/master/CHANGELOG.md)

## Credits

A lot of the generator data comes from [Cellule/dndGenerator](https://github.com/Cellule/dndGenerator)

&nbsp;

#### Api usage

Though not recommended there is an api that can be used to generate npcs.

<details>

<summary>API info</summary>

&nbsp;  
`npcGen.generateNPC(amount = 1, options = npcGen.defaultApiOptions, fillDefault = false);`

* `amount` is amount of npcs to generate
* `options` is an object with all the options for the generator, how this object looks can be found in the console when clicking generate in the npc generator. If no options are provided everything default is enabled.
* `fillDefault` makes missing options default to true if enabled (otherwise they default to false)

</details>
