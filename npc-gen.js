import * as acemodule from "./lib/ace/ace.js";
import { registerJSONEditorSettings, registerSettings } from "./modules/settings.js";
import { registerHelpers } from "./modules/handlebars.js";
import NPCGenerator from "./modules/applications/NPCGenerator.js";
import generateNPC from "./modules/api.js"
import defaultApiOptions from "./data/defaultApiOptions.js";

/* -------------< Ace multi module compat >------------ */

/** @type {String} */
const scriptLocation = getRunningScript()().replace("npc-gen.js", "");

setAceModules([
  ["ace/mode/json", "lib/ace/mode-json.js"],
  ["ace/ext/language_tools", "lib/ace/ext-language_tools.js"],
  ["ace/mode/json_worker", "lib/ace/worker-json.js"],
  ["ace/ext/error_marker", "lib/ace/ext-error_marker.js"],
  ["ace/theme/twilight", "lib/ace/theme-twilight.js"],
  ["ace/snippets/json", "lib/ace/snippets/json.js"],
]);

/**
 * @returns {String} script location
 */
function getRunningScript() {
  return () => {
    return new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/gi)[0];
  };
}

function loadScript(path) {
  const s = document.createElement("script");
  s.src = path;
  $(document.head).append(s);
}

/**
 * @param  {String[]} stringArray
 */
function setAceModules(stringArray) {
  stringArray.forEach((data) => {
    ace.config.setModuleUrl(data[0], scriptLocation.concat(data[1]));
    // ace.config.loadModule(data[0])
    // firefox workaround
    loadScript(ace.config.moduleUrl(data[0]).replace("getRunningScript/<@", ""));
  });
}

/* -------------< End Ace multi module compat >------------ */

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
});
