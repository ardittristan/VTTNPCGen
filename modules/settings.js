import ExportSettings from "./applications/exportSettings.js";
import GeneratorWindow from "./applications/jsonEditor.js";

/**
 * register settings
 */
export function registerSettings() {
  // helper for checking for new races
  game.settings.register("npcgen", "registeredRaces", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  // settings for saving unchecked boxes
  game.settings.register("npcgen", "disabledBoxes", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  // setting for saving weights
  game.settings.register("npcgen", "weights", {
    scope: "client",
    config: false,
    type: Object,
    default: {},
  });

  // settings for token images
  game.settings.register("npcgen", "imageLocations", {
    scope: "world",
    config: false,
    type: Object,
    default: {},
  });

  // settings for class bound token images
  game.settings.register("npcgen", "roleSpecificImages", {
    name: game.i18n.localize("npcGen.roleSpecificImages"),
    hint: game.i18n.localize("npcGen.roleSpecificImagesHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    restricted: true
  })

  // register json editor
  game.settings.registerMenu("npcgen", "jsonEditor", {
    name: game.i18n.localize("npcGen.settingsTitle"),
    label: game.i18n.localize("npcGen.settingsLabel"),
    hint: game.i18n.localize("npcGen.settingsHint"),
    icon: "far fa-file-code",
    type: GeneratorWindow,
    restricted: true,
  });

  // register settings export
  game.settings.registerMenu("npcgen", "exportSettings", {
    name: game.i18n.localize("npcGen.exportTitle"),
    label: game.i18n.localize("npcGen.exportLabel"),
    hint: game.i18n.localize("npcGen.exportHint"),
    icon: "fas fa-exchange-alt",
    type: ExportSettings,
    restricted: true
  })
}

/**
 *  registers settings for json editor
 */
export function registerJSONEditorSettings() {
  // editor content settings

  game.settings.register("npcgen", "classesJSON", {
    scope: "world",
    config: false,
    type: String,
    default: "{\n    \n}",
  });

  game.settings.register("npcgen", "languagesJSON", {
    scope: "world",
    config: false,
    type: String,
    default: "[\n    \n]",
  });

  game.settings.register("npcgen", "namesJSON", {
    scope: "world",
    config: false,
    type: String,
    default: '{\n    "First": {\n        "Male": {\n            \n        },\n        "Female": {\n            \n        }\n    },\n    "Last": {\n    \n    }\n}',
  });

  game.settings.register("npcgen", "traitsJSON", {
    scope: "world",
    config: false,
    type: String,
    default: '{\n    "Good Traits": [\n        \n    ],\n    "Bad Traits": [\n        \n    ]\n}',
  });

  game.settings.register("npcgen", "plothooksJSON", {
    scope: "world",
    config: false,
    type: String,
    default: "{\n    \n}",
  });

  game.settings.register("npcgen", "professionJSON", {
    scope: "world",
    config: false,
    type: String,
    default:
      '{\n    "Learned": [\n        \n    ],\n    "Lesser Nobility": [\n        \n    ],\n    "Professional": [\n        \n    ],\n    "Working Class": [\n        \n    ],\n    "Martial": [\n        \n    ],\n    "Underclass": [\n        \n    ],\n    "Entertainer": [\n        \n    ]\n}',
  });

  game.settings.register("npcgen", "racesJSON", {
    scope: "world",
    config: false,
    type: String,
    default: "{\n    \n}",
  });

  game.settings.register("npcgen", "sexJSON", {
    scope: "world",
    config: false,
    type: String,
    default: '{\n    "Orientation": [\n        \n    ],\n    "Gender": [\n        \n    ],\n    "Relationship Status": [\n        \n    ]\n}',
  });

  // only custom settings

  game.settings.register("npcgen", "onlyClassesJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyLanguagesJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyNamesJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyTraitsJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyPlothooksJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyProfessionJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlyRacesJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "onlySexJSON", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("npcgen", "compatMode", {
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    name: game.i18n.localize("npcGen.saveCharacter"),
    hint: game.i18n.localize("npcGen.saveCharacterHint"),
    restricted: true,
  });
}
