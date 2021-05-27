// import * as acemodule from "./lib/ace/ace.js";
import { registerJSONEditorSettings, registerSettings } from "./modules/settings.js";
import { registerHelpers } from "./modules/handlebars.js";
import NPCGenerator from "./modules/applications/NPCGenerator.js";
import generateNPC from "./modules/api.js";
import defaultApiOptions from "./data/defaultApiOptions.js";

/* -------------< Ace >------------ */

Hooks.once("init", () => {
  ["ace/mode/json", "ace/ext/language_tools", "ace/ext/error_marker", "ace/theme/twilight", "ace/snippets/json"].forEach((s) => ace.config.loadModule(s));
});

/* -------------< End Ace >------------ */

export let classesJSON = {};
export let personalityTraitsJSON = {};
export let plotHooksJSON = {};
export let professionsJSON = {};
export let racesJSON = {};
export let sexJSON = {};
export let listJSON = {};
export let languagesJSON = [];
export let namesJSON = {};
initJSON();

async function initJSON() {
  jQuery.getJSON("modules/npcgen/data/classes.json", (json) => (classesJSON = json));
  jQuery.getJSON("modules/npcgen/data/personalitytraits.json", (json) => (personalityTraitsJSON = json));
  jQuery.getJSON("modules/npcgen/data/plothooks.json", (json) => (plotHooksJSON = json));
  jQuery.getJSON("modules/npcgen/data/professions.json", (json) => (professionsJSON = json));
  jQuery.getJSON("modules/npcgen/data/races.json", (json) => (racesJSON = json));
  jQuery.getJSON("modules/npcgen/data/sex.json", (json) => (sexJSON = json));
  jQuery.getJSON("modules/npcgen/data/lists.json", (json) => (listJSON = json));
  jQuery.getJSON("modules/npcgen/data/languages.json", (json) => (languagesJSON = json));
  jQuery.getJSON("modules/npcgen/data/names.json", (json) => (namesJSON = json));
}

// add button to side menu
Hooks.on("renderActorDirectory", (_app, html) => {
  if (game.user.isGM) {
    const generateButton = jQuery(`<button class="npc-generator-btn"><i class="fas fa-fire"></i> Generate NPC</button>`);
    html.find(".npc-generator-btn").remove();

    html.find(".directory-footer").append(generateButton);

    generateButton.on("click", (ev) => {
      ev.preventDefault();
      let generator = new NPCGenerator({
        classesJSON: classesJSON,
        languagesJSON: languagesJSON,
        namesJSON: namesJSON,
        personalityTraitsJSON: personalityTraitsJSON,
        plotHooksJSON: plotHooksJSON,
        professionsJSON: professionsJSON,
        racesJSON: racesJSON,
        sexJSON: sexJSON,
        listJSON: listJSON,
      });
      generator.render(true);
    });
  }
});

Hooks.once("init", () => {
  console.log("NPC Generator | initializing");

  // handlebars helper that keeps disabled checkboxes off
  registerHelpers();

  // init variable for unsaved watcher
  window.npcGen = window.npcGen || {};

  // register settings for json editor
  registerJSONEditorSettings();

  // register settings
  registerSettings();

  // register api
  window.npcGen.generateNPC = generateNPC;
  window.npcGen.defaultApiOptions = defaultApiOptions;
  window.npcGen.NPCGenerator = NPCGenerator;
  window.npcGen.data = {
    classesJSON: classesJSON,
    languagesJSON: languagesJSON,
    namesJSON: namesJSON,
    personalityTraitsJSON: personalityTraitsJSON,
    plotHooksJSON: plotHooksJSON,
    professionsJSON: professionsJSON,
    racesJSON: racesJSON,
    sexJSON: sexJSON,
    listJSON: listJSON,
  };
});
