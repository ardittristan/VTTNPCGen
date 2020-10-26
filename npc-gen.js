import { pick, sample, has, difference, filter } from './lib/underscore.min.js';
import merge from './lib/lodash-merge.min.js';
import * as acemodule from "./lib/ace/ace.js";

/* -------------< Ace multi module compat >------------ */

/** @type {String} */
const scriptLocation = getRunningScript()().replace("npc-gen.js", "");


setAceModules([
    ["ace/mode/json", "lib/ace/mode-json.js"],
    ["ace/ext/language_tools", "lib/ace/ext-language_tools.js"],
    ["ace/mode/json_worker", "lib/ace/worker-json.js"],
    ["ace/ext/error_marker", "lib/ace/ext-error_marker.js"],
    ["ace/theme/twilight", "lib/ace/theme-twilight.js"],
    ["ace/snippets/json", "lib/ace/snippets/json.js"]
]);

/**
 * @returns {String} script location
 */
function getRunningScript() {
    return () => {
        return new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0];
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


let classesJSON = {};
let personalityTraitsJSON = {};
let plotHooksJSON = {};
let professionsJSON = {};
let racesJSON = {};
let sexJSON = {};
let listJSON = {};
let languagesJSON = [];
let namesJSON = {};
initJSON();

let globalRacesList = [];



class NPCGenerator extends FormApplication {

    constructor(object = {}, options = {}) {
        super(object, options);

        this.done = false;


        /* -------------< Combine with user JSON if enabled >--------------- */

        if (game.settings.get("npcgen", "onlyClassesJSON")) {
            this.classesJSON = JSON.parse(game.settings.get("npcgen", "classesJSON"));
        } else {
            this.classesJSON = merge(classesJSON, JSON.parse(game.settings.get("npcgen", "classesJSON")));
        }

        if (game.settings.get("npcgen", "onlyLanguagesJSON")) {
            this.languagesJSON = JSON.parse(game.settings.get("npcgen", "languagesJSON"));
        } else {
            this.languagesJSON = merge(languagesJSON, JSON.parse(game.settings.get("npcgen", "languagesJSON")));
        }

        if (game.settings.get("npcgen", "onlyNamesJSON")) {
            this.namesJSON = JSON.parse(game.settings.get("npcgen", "namesJSON"));
        } else {
            this.namesJSON = merge(namesJSON, JSON.parse(game.settings.get("npcgen", "namesJSON")));
        }

        if (game.settings.get("npcgen", "onlyTraitsJSON")) {
            this.personalityTraits = JSON.parse(game.settings.get("npcgen", "traitsJSON"));
        } else {
            this.personalityTraitsJSON = merge(personalityTraitsJSON, JSON.parse(game.settings.get("npcgen", "traitsJSON")));
        }

        if (game.settings.get("npcgen", "onlyPlothooksJSON")) {
            this.plotHooksJSON = JSON.parse(game.settings.get("npcgen", "plothooksJSON"));
        } else {
            this.plotHooksJSON = merge(plotHooksJSON, JSON.parse(game.settings.get("npcgen", "plothooksJSON")));
        }

        if (game.settings.get("npcgen", "onlyProfessionJSON")) {
            this.professionsJSON = JSON.parse(game.settings.get("npcgen", "professionJSON"));
        } else {
            this.professionsJSON = merge(professionsJSON, JSON.parse(game.settings.get("npcgen", "professionJSON")));
        }

        if (game.settings.get("npcgen", "onlyRacesJSON")) {
            this.racesJSON = JSON.parse(game.settings.get("npcgen", "racesJSON"));
        } else {
            this.racesJSON = merge(racesJSON, JSON.parse(game.settings.get("npcgen", "racesJSON")));
        }

        if (game.settings.get("npcgen", "onlySexJSON")) {
            this.sexJSON = JSON.parse(game.settings.get("npcgen", "sexJSON"));
        } else {
            this.sexJSON = merge(sexJSON, JSON.parse(game.settings.get("npcgen", "sexJSON")));
        }

        this.listJSON = listJSON;


        /* -------------< Input Data >--------------- */

        this.classes = Object.keys(this.classesJSON);

        this.personalityTraits = Object.keys(this.personalityTraitsJSON);

        this.plotHooks = Object.keys(this.plotHooksJSON);

        this.professions = Object.keys(this.professionsJSON);

        this.races = Object.keys(this.racesJSON);

        this.orientation = this.sexJSON["Orientation"];

        this.gender = this.sexJSON["Gender"];

        this.relationshipStatus = this.sexJSON["Relationship Status"];

        this.skillList = Object.keys(this.listJSON.Skills);

        this.abilityList = this.listJSON.Abilities;
        this.languages = this.languagesJSON;

        this.useSubclass = false;

        this.disabledBoxes = game.settings.get("npcgen", "disabledBoxes")[0];

        this.weights = game.settings.get("npcgen", "weights");


        /* -------------< New Races? >--------------- */

        globalRacesList = this.races;


        /* -------------< Generator Data >--------------- */

        // ability score
        this.genStr = "";
        this.genDex = "";
        this.genCon = "";
        this.genInt = "";
        this.genWis = "";
        this.genCha = "";

        this.genStrMod = "";
        this.genDexMod = "";
        this.genConMod = "";
        this.genIntMod = "";
        this.genWisMod = "";
        this.genChaMod = "";

        // relationship
        this.genGender = "";
        this.genRelationship = "";
        this.genOrientation = "";

        // race
        this.genRace = "";
        this.genAge = "";
        this.genLanguages = [];
        this.genHeight = "";
        this.genWeight = "";
        this.genSpeed = "";

        // profession
        this.genProfession = "";

        // plothook
        this.genPlotHook = "";

        // traits
        this.genTraits = [];

        // class
        this.genClass = "";
        this.genHp = "";
        this.genProficiencies = [];
        this.genSaveThrows = [];
        this.genSkills = [];
        this.genSubclass = "None";

        // level
        this.level = "1";

        // name
        this.genFirstName = "First Name";
        this.genLastName = "Last Name";

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "npcgenerator-menu",
            title: "NPC Generator",
            template: "modules/npcgen/templates/generator.html",
            classes: ["sheet"],
            closeOnSubmit: false,
            resizable: true,
            width: 1205
        });
    }

    /**
    * Default Options for this FormApplication
    */
    getData(options) {
        const data = super.getData(options);

        // I hate this, but it works

        /* -------------< Input Data >--------------- */

        data.classes = this.classes;
        data.personalityTraits = this.personalityTraits;
        data.plotHooks = this.plotHooks;
        data.professions = this.professions;
        data.races = this.races;
        data.orientation = this.orientation;
        data.gender = this.gender;
        data.relationshipStatus = this.relationshipStatus;
        data.useSubclass = this.useSubclass;

        /* -------------< Generator Data >--------------- */

        // ability score
        data.genStr = this.genStr;
        data.genDex = this.genDex;
        data.genCon = this.genCon;
        data.genInt = this.genInt;
        data.genWis = this.genWis;
        data.genCha = this.genCha;

        data.genStrMod = this.genStrMod;
        data.genDexMod = this.genDexMod;
        data.genConMod = this.genConMod;
        data.genIntMod = this.genIntMod;
        data.genWisMod = this.genWisMod;
        data.genChaMod = this.genChaMod;

        // relationship
        data.genGender = this.genGender;
        data.genRelationship = this.genRelationship;
        data.genOrientation = this.genOrientation;

        // race
        data.genRace = this.genRace;
        data.genAge = this.genAge;
        data.genLanguages = this.genLanguages;
        data.genHeight = this.genHeight;
        data.genWeight = this.genWeight;
        data.genSpeed = this.genSpeed;

        // profession
        data.genProfession = this.genProfession;

        // plothook
        data.genPlotHook = this.genPlotHook;

        // traits
        data.genTraits = this.genTraits;

        // class
        data.genClass = this.genClass;
        data.genHp = this.genHp;
        data.genProficiencies = this.genProficiencies;
        data.genSaveThrows = this.genSaveThrows;
        data.genSkills = this.genSkills;
        data.genSubclass = this.genSubclass;

        // level
        data.level = this.level;

        // name
        data.genFirstName = this.genFirstName;
        data.genLastName = this.genLastName;

        /* -------------< disabled boxes >--------------- */

        data.disabledBoxes = this.disabledBoxes;

        /* -------------< weights >--------------- */

        data.weights = this.weights;

        return data;
    }

    /**
     * Executes on form submission.
     * @param {Event} _e - the form submission event
     * @param {Object} d - the form data
     *
     *  'name': entry.metadata.label+' ['+entry.metadata.package+']',
     *  'type':'pack',
     *  'submenu':submenu.toLowerCase(),
     *  'key':entry.metadata.package+'.'+entry.metadata.name
     */
    async _updateObject(_e, d) {

        if (!this.done) {
            this.updateFormValues(d);
            this.generateNPC(d);
        } else {
            this.saveNPC(d);
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".npc-generator-bottom-button[name='cancel']").on('click', (e) => {
            e.preventDefault();
            this.close();
        });

        html.find(".npc-generator-bottom-button[name='generate']").on('click', (e) => {
            e.preventDefault();
            jQuery(e.target.form).trigger('submit');
        });

        html.find(".npc-generator-bottom-button[name='accept']").on('click', (e) => {
            e.preventDefault();
            this.done = true;
            jQuery(e.target.form).trigger('submit');
            this.close();
        });

        html.find('.npc-generator-big-box').find('input').each((_, e) => {
            jQuery(e).on('input', (e) => {
                e.originalEvent.target.size = e.originalEvent.target.value.length * 1.05 + 1;
            });
            e.size = e.value.length * 1.05 + 1;
        });

        html.find('.npc-generator-box.header input[type="text"]').each((_, e) => {
            jQuery(e).on('input', (e) => {
                e.originalEvent.target.size = e.originalEvent.target.value.length * 1.15 + 1.5;
            });
            e.size = e.value.length * 1.15 + 1.5;
        });

        html.find('input[type="number"]').each((_, e) => {
            jQuery(e).on('input', (e) => {
                e.originalEvent.target.style.width = (e.originalEvent.target.value.length + 1.2) + 'em';
            });
            e.style.width = (e.value.length + 1.2) + 'em';
        });

        html.find('.npc-generator-big-box').find('textarea').each(function () {
            setTimeout(() => {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight - 18) + 'px';
            }, 50);
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight - 18) + 'px';
        });

    }

    setupInput(d) {
        const genders = this.getEnabledValues(d, "Gender");
        /** @type {String[]} */
        let gendersOut = [];
        genders.forEach((gender) => {
            for (let i = 0; i < this.getProbValue(d, "Gender", gender); i++) {
                gendersOut.push(gender);
            }
        });

        const traits = this.getEnabledValues(d, "Trait");
        /** @type {String[]} */
        let traitsOut = [];
        traits.forEach((trait) => {
            traitsOut.push(trait);
        });

        const professions = this.getEnabledValues(d, "Profession");
        /** @type {String[]} */
        let professionsOut = [];
        professions.forEach((profession) => {
            for (let i = 0; i < this.getProbValue(d, "Profession", profession); i++) {
                professionsOut.push(profession);
            }
        });

        const relationshipStatus = this.getEnabledValues(d, "RelationshipStatus");
        /** @type {String[]} */
        let relationshipStatusOut = [];
        relationshipStatus.forEach((relationshipStatus) => {
            for (let i = 0; i < this.getProbValue(d, "RelationshipStatus", relationshipStatus); i++) {
                relationshipStatusOut.push(relationshipStatus);
            }
        });

        const orientations = this.getEnabledValues(d, "Orientation");
        /** @type {String[]} */
        let orientationsOut = [];
        orientations.forEach((orientation) => {
            for (let i = 0; i < this.getProbValue(d, "Orientation", orientation); i++) {
                orientationsOut.push(orientation);
            }
        });

        const races = this.getEnabledValues(d, "Race");
        /** @type {String[]} */
        let racesOut = [];
        races.forEach((race) => {
            for (let i = 0; i < this.getProbValue(d, "Race", race); i++) {
                racesOut.push(race);
            }
        });

        const classes = this.getEnabledValues(d, "Class");
        /** @type {String[]} */
        let classesOut = [];
        classes.forEach((klass) => {
            for (let i = 0; i < this.getProbValue(d, "Class", klass); i++) {
                classesOut.push(klass);
            }
        });

        const returnvalue = [
            gendersOut,
            traitsOut,
            professionsOut,
            relationshipStatusOut,
            orientationsOut,
            racesOut,
            classesOut
        ];

        console.log(returnvalue);

        return returnvalue;
    }


    /**
     * generates info on npc
     * @param  {Object} d
     */
    generateNPC(d) {

        this.resetValues();

        const [
            genders,
            traits,
            professions,
            relationshipStatus,
            orientations,
            races,
            classes
        ] = this.setupInput(d);


        // Gender
        if (genders.length != 0) {
            this.genGender = sample(genders);
        }

        // Traits
        if (traits.length != 0) {
            let traitList = [];
            traits.forEach((type) => {
                traitList = traitList.concat(sample(this.personalityTraitsJSON[type], this.getProbValue(d, "Trait", type)));
            });
            traitList.forEach((trait, index) => {
                traitList[index] = "•" + trait;
            });
            this.genTraits = traitList;
        }

        // Profession
        let professionArea = "";
        if (professions.length != 0) {
            professionArea = sample(professions);
            this.genProfession = sample(this.professionsJSON[professionArea]);
        }

        // Relationship Status
        if (relationshipStatus.length != 0) {
            this.genRelationship = sample(relationshipStatus);
        }

        // Sexual Orientation
        if (orientations.length != 0) {
            this.genOrientation = sample(orientations);
        }

        // Main Race
        if (races.length != 0) {
            this.genRace = sample(races);
        } else {
            this.genRace = sample(this.races);
        }

        // Main Class
        if (classes.length != 0) {
            this.genClass = sample(classes);
        } else {
            this.genClass = sample(this.classes);
        }

        // Plothook
        this.genPlotHook = sample(this.plotHooksJSON.All.concat(this.plotHooksJSON[professionArea]));


        // Level

        this.level = Number(d.level);

        // Class info
        // hp
        let hp = Number(this.classesJSON[this.genClass].hp.split("d")[1]);
        for (let i = 0; i < this.level - 1; i++) {
            hp += rollDiceString(this.classesJSON[this.genClass].hp);
        }
        this.genHp = String(hp);

        // proficiencies
        let proficiencies = [];
        if (has(this.classesJSON[this.genClass].proficiencies, "Armor")) {
            this.classesJSON[this.genClass].proficiencies.Armor.forEach((value) => {
                proficiencies.push(value);
            });
        }
        if (has(this.classesJSON[this.genClass].proficiencies, "Weapons")) {
            this.classesJSON[this.genClass].proficiencies.Weapons.forEach((value) => {
                proficiencies.push(value);
            });
        }
        if (has(this.classesJSON[this.genClass].proficiencies, "Tools")) {
            this.classesJSON[this.genClass].proficiencies.Tools.forEach((value) => {
                proficiencies.push(value);
            });
        }
        this.genProficiencies = proficiencies;

        // saving throws
        this.genSaveThrows = this.classesJSON[this.genClass].proficiencies["Saving Throws"];

        // skills
        let skills = [];
        this.classesJSON[this.genClass].proficiencies.Skills.forEach((array) => {
            let working = true;
            let samp = "";
            while (working) {
                if (array[0] === "Any") {
                    samp = sample(this.skillList);
                    if (!skills.includes(samp)) { working = false; }
                } else {
                    samp = sample(array);
                    if (!skills.includes(samp)) { working = false; }
                }
            }
            skills.push(samp);
        });
        this.genSkills = skills;


        // Race info
        // age
        this.genAge = Math.floor(weightedRandom(this.racesJSON[this.genRace].age, 3));

        // languages
        let languages = [];
        this.racesJSON[this.genRace].languages.forEach((value) => {
            if (value === "Any") {
                let working = true;
                let samp = "";
                while (working) {
                    samp = sample(this.languages);
                    if (!languages.includes(samp)) { working = false; }
                }
                languages.push(samp);
            } else {
                languages.push(value);
            }
        });
        this.genLanguages = languages;

        // height
        const baseHeight = Number(this.racesJSON[this.genRace].height.base);
        const heightMod = rollDiceString(this.racesJSON[this.genRace].height.mod);
        this.genHeight = inchesToFeet(baseHeight + heightMod);

        // weight
        const baseWeight = Number(this.racesJSON[this.genRace].weight.base);
        const weightMod = rollDiceString(this.racesJSON[this.genRace].weight.mod);
        this.genWeight = (baseWeight + heightMod * weightMod);

        // speed
        this.genSpeed = this.racesJSON[this.genRace].speed;


        // Ability Scores
        // modifiers
        if (this.racesJSON[this.genRace].abilityBonus) {
            this.genStrMod = this.racesJSON[this.genRace].abilityBonus.Con || 0;
            this.genDexMod = this.racesJSON[this.genRace].abilityBonus.Dex || 0;
            this.genConMod = this.racesJSON[this.genRace].abilityBonus.Con || 0;
            this.genIntMod = this.racesJSON[this.genRace].abilityBonus.Int || 0;
            this.genWisMod = this.racesJSON[this.genRace].abilityBonus.Wis || 0;
            this.genChaMod = this.racesJSON[this.genRace].abilityBonus.Cha || 0;
            if (this.racesJSON[this.genRace].abilityBonus.Any) {
                const amount = this.racesJSON[this.genRace].abilityBonus.Any;
                let working = true;
                let mod = "";
                while (working) {
                    mod = sample(this.abilityList);
                    if (this[`gen${mod}Mod`] === 0) { working = false; }
                }
                this[`gen${mod}Mod`] += amount;
            }
            if (this.racesJSON[this.genRace].abilityBonus.Choice) {
                this.racesJSON[this.genRace].abilityBonus.Choice.forEach((object) => {
                    if (!object.Any) {
                        const mod = sample(Object.keys(object));
                        const amount = object[mod];
                        this[`gen${mod}Mod`] += amount;

                    }
                    if (object.Any) {
                        const amount = object.Any;
                        let working = true;
                        let mod = "";
                        while (working) {
                            mod = sample(this.abilityList);
                            if (this[`gen${mod}Mod`] === 0) { working = false; }
                        }
                        this[`gen${mod}Mod`] += amount;
                    }
                });
            }
        }

        // total
        this.genStr = String(rollDiceString("3d6") + this.genStrMod);
        this.genDex = String(rollDiceString("3d6") + this.genDexMod);
        this.genCon = String(rollDiceString("3d6") + this.genConMod);
        this.genInt = String(rollDiceString("3d6") + this.genIntMod);
        this.genWis = String(rollDiceString("3d6") + this.genWisMod);
        this.genCha = String(rollDiceString("3d6") + this.genChaMod);



        // Sub Class
        if (d.useSubclass) {
            if (has(this.classesJSON[this.genClass], "subclasses")) {
                this.genSubclass = sample(Object.keys(this.classesJSON[this.genClass].subclasses));
                const subclassJSON = this.classesJSON[this.genClass].subclasses[this.genSubclass];

                // hp
                if (has(subclassJSON, "hp")) {
                    this.genHp = String(rollDiceString(subclassJSON.hp));
                }

                if (has(subclassJSON, "proficiencies")) {
                    // proficiencies
                    if (has(subclassJSON.proficiencies, "Armor")) {
                        subclassJSON.proficiencies.Armor.forEach((value) => {
                            proficiencies.push(value);
                        });
                    }
                    if (has(subclassJSON.proficiencies, "Weapons")) {
                        subclassJSON.proficiencies.Weapons.forEach((value) => {
                            proficiencies.push(value);
                        });
                    }
                    if (has(subclassJSON.proficiencies, "Tools")) {
                        subclassJSON.proficiencies.Tools.forEach((value) => {
                            proficiencies.push(value);
                        });
                    }
                    this.genProficiencies = proficiencies;

                    // saving throws
                    if (has(subclassJSON.proficiencies, "Saving Throws")) {
                        this.genSaveThrows = this.genSaveThrows.concat(subclassJSON.proficiencies["Saving Throws"]);
                    }

                    // skills
                    if (has(subclassJSON.proficiencies, "Skills")) {
                        subclassJSON.proficiencies.Skills.forEach((array) => {
                            if (array[0] === "Any") {
                                skills.push(sample(this.skillList));
                            } else {
                                skills.push(sample(array));
                            }
                        });
                        this.genSkills = skills;
                    }
                }
            }
        }

        console.log(this);

        // First Name
        let firstNames = [];
        if (Object.keys(this.namesJSON.First).includes(this.genGender)) {
            /** @type {String[]} */
            let nameForced =
                difference(
                    game.settings.get("npcgen", "registeredRaces")[0].map(string => `Race${string}FirstNameForced`),
                    filter(this.disabledBoxes, string => { return string.includes("FirstNameForced"); })
                );
            if (nameForced.length !== 0) {
                nameForced.forEach(raceDirty => {
                    firstNames = firstNames.concat(this.namesJSON.First[this.genGender][raceDirty.replace("Race", "").replace("FirstNameForced", "")]);
                });
            } else {
                if (this.namesJSON.First[this.genGender].All) {
                    firstNames = firstNames.concat(this.namesJSON.First[this.genGender].all);
                }
                if (this.namesJSON.First[this.genGender][this.genRace]) {
                    firstNames = firstNames.concat(this.namesJSON.First[this.genGender][this.genRace]);
                }
                if (this.namesJSON.First[this.genGender][this.racesJSON[this.genRace].mainRace]) {
                    firstNames = firstNames.concat(this.namesJSON.First[this.genGender][this.racesJSON[this.genRace].mainRace]);
                }
            }
        } else {
            Object.keys(this.namesJSON.First).forEach(gender => {
                /** @type {String[]} */
                let nameForced =
                    difference(
                        game.settings.get("npcgen", "registeredRaces")[0].map(string => `Race${string}FirstNameForced`),
                        filter(this.disabledBoxes, string => { return string.includes("FirstNameForced"); })
                    );
                if (nameForced.length !== 0) {
                    nameForced.forEach(raceDirty => {
                        firstNames = firstNames.concat(this.namesJSON.First[gender][raceDirty.replace("Race", "").replace("FirstNameForced", "")]);
                    });
                } else {
                    if (this.namesJSON.First[gender].All) {
                        firstNames = firstNames.concat(this.namesJSON.First[gender].All);
                    }
                    if (this.namesJSON.First[gender][this.genRace]) {
                        firstNames = firstNames.concat(this.namesJSON.First[gender][this.genRace]);
                    }
                    if (this.namesJSON.First[gender][this.racesJSON[this.genRace].mainRace]) {
                        firstNames = firstNames.concat(this.namesJSON.First[gender][this.racesJSON[this.genRace].mainRace]);
                    }
                }
            });
        }
        this.genFirstName = sample(firstNames);

        // Last Name
        let lastNames = [];
        /** @type {String[]} */
        let nameForced =
            difference(
                game.settings.get("npcgen", "registeredRaces")[0].map(string => `Race${string}LastNameForced`),
                filter(this.disabledBoxes, string => { return string.includes("LastNameForced"); })
            );
        if (nameForced.length !== 0) {
            nameForced.forEach(raceDirty => {
                lastNames = lastNames.concat(this.namesJSON.Last[raceDirty.replace("Race", "").replace("LastNameForced", "")]);
            });
        } else {
            if (this.namesJSON.Last.All) {
                lastNames = lastNames.concat(this.namesJSON.Last.All);
            }
            if (this.namesJSON.Last[this.genRace]) {
                lastNames = lastNames.concat(this.namesJSON.Last[this.genRace]);
            }
            if (this.namesJSON.Last[this.racesJSON[this.genRace].mainRace]) {
                lastNames = lastNames.concat(this.namesJSON.Last[this.racesJSON[this.genRace].mainRace]);
            }
        }
        this.genLastName = sample(lastNames);



        this.render();
    }

    /**
     * saves npc to actor
     * @param {Object} d
     */
    async saveNPC(d) {
        // set abilities
        let abilities = {};
        this.listJSON.Abilities.forEach((/** @type {String} */ability) => {
            abilities[ability.toLowerCase()] = { value: Number(d[`gen${ability}`]) };
        });

        // saving throws
        d.genSaveThrows.trim().slice(0, -1).split(", ").forEach((/** @type {String} */ability) => {
            if (abilities[ability.toLowerCase()] !== undefined) {
                abilities[ability.toLowerCase()].proficient = 1;
            }
        });

        // set biography
        let biography = "";
        {
            // gender
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.gender')}: ${d.genGender}</p>\n`);
            // relationship
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.relationship')}: ${d.genRelationship}</p>\n`);
            // orientation
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.orientation')}: ${d.genOrientation}</p>\n`);
            // age
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.age')}: ${d.genAge}</p>\n`);
            // height
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.height')}: ${d.genHeight}</p>\n`);
            // weight
            biography = biography.concat(`<p>${game.i18n.localize('npcGen.weight')}: ${d.genWeight}</p>\n`);
            // static line
            biography = biography.concat(`<p>&nbsp;</p>\n<p><strong>${game.i18n.localize('npcGen.traits')}:</strong></p>\n`);
            // traits
            d.genTraits.split(/\r?\n/).forEach((trait) => { biography = biography.concat(`<p>${trait}</p>\n`); });
            // static line
            biography = biography.concat("<p>&nbsp;</p>");
            // plot hook
            biography = biography.concat(`<p><strong>${game.i18n.localize('npcGen.plotHook')}:</strong> ${d.genPlotHook}</p>`);
        }

        // set skills
        let skills = {};
        let classSkills = [];
        d.genSkills.trim().slice(0, -1).split(", ").forEach((/** @type {String} */skill) => {
            if (this.listJSON.Skills[skill]) {
                classSkills.push(this.listJSON.Skills[skill]);
                skills[this.listJSON.Skills[skill]] = { value: 1 };
            }
        });

        // set class
        let classItem = await CONFIG.Item.entityClass.create({
            name: d.genClass,
            type: "class",
            data: {
                source: this.classesJSON[d.genClass].source,
                levels: d.level,
                subclass: d.genSubclass,
                skills: {
                    number: classSkills.length,
                    value: classSkills
                }
            }
        });

        let actorOptions = {
            name: `${d.genFirstName} ${d.genLastName}`,
            permission: {
                default: 0
            },
            data: {
                abilities: abilities,
                attributes: {
                    ac: {
                        value: 10 + calculateAbilityMod(Number(d.genDex))
                    },
                    hp: {
                        value: Number(d.genHp),
                        max: Number(d.genHp)
                    },
                    speed: {
                        value: Number(d.genSpeed)
                    }
                },
                details: {
                    biography: {
                        value: biography
                    },
                    race: d.genRace,
                    background: d.genProfession,
                    level: Number(d.level)
                },
                skills: skills,
                traits: {
                    size: this.listJSON.Sizes[this.racesJSON[d.genRace].height.size],
                    languages: {
                        custom: d.genLanguages.trim().slice(0, -1).replace(",", ";")
                    },
                    weaponProf: {
                        custom: d.genProficiencies.trim().slice(0, -1).replace(/\r?\n/g, ";")
                    }
                }
            },
            items: [
                classItem
            ]
        };

        if (game.settings.get("npcgen", "compatMode")) {
            actorOptions.type = "character";
        } else {
            actorOptions.type = "npc";
            actorOptions.data.details.type = d.genRace;
            actorOptions.data.details.biography.value =
                `<p>${game.i18n.localize('npcGen.proficiencies')}: ` +
                d.genProficiencies.trim().slice(0, -1).replace(/\r?\n/g, ", ") + "\n</p>" +
                "<p>&nbsp;\n</p>" +
                `<p>${game.i18n.localize('npcGen.profession')}: ${d.genProfession}</p>\n` +
                biography;
        }


        let actor = await CONFIG.Actor.entityClass.create(actorOptions);

        actor.sheet.render(true);
    }

    updateFormValues(d) {
        if (d.useSubclass) { this.useSubclass = true; }
        if (d.level) { this.level = d.level; }

        this.disabledBoxes = [];
        this.weights = {};
        for (let property in d) {
            if (d[property] === false && !property.startsWith("gen") && !property.startsWith("Prob")) {
                this.disabledBoxes.push(property);
            }
            if (d[property] !== "1" && property.startsWith("Prob")) {
                this.weights[property] = d[property];
            }
        }
        game.settings.set("npcgen", "disabledBoxes", this.disabledBoxes);
        game.settings.set("npcgen", "weights", this.weights);
    }

    getEnabledValues(d, name) {
        const filteredObject =
            pick(d, function (value, key) {
                if (value && key.startsWith(name)) {
                    return true;
                }
                return false;
            });

        /** @type {String[]} */
        let renamedArray = [];

        Object.keys(filteredObject).forEach((key) => {
            renamedArray.push(key.replace(name, ""));
        });

        return renamedArray;
    }
    /**
     * @param  {Object} d
     * @param  {String} prefix
     * @param  {String} suffix
     */
    getProbValue(d, prefix, suffix) {
        for (const key in d) {
            if (key === "Prob" + prefix + suffix) {
                return d[key];
            }
        }
    }

    resetValues() {
        this.genStr = "";
        this.genDex = "";
        this.genCon = "";
        this.genInt = "";
        this.genWis = "";
        this.genCha = "";
        this.genStrMod = "";
        this.genDexMod = "";
        this.genConMod = "";
        this.genIntMod = "";
        this.genWisMod = "";
        this.genChaMod = "";
        this.genGender = "";
        this.genRelationship = "";
        this.genOrientation = "";
        this.genRace = "";
        this.genAge = "";
        this.genLanguages = [];
        this.genHeight = "";
        this.genWeight = "";
        this.genSpeed = "";
        this.genProfession = "";
        this.genPlotHook = "";
        this.genTraits = [];
        this.genClass = "";
        this.genHp = "";
        this.genProficiencies = [];
        this.genSaveThrows = [];
        this.genSkills = [];
        this.genSubclass = "None";
        this.level = "1";
        this.genFirstName = "NPC";
        this.genLastName = "Generator";
    }

}




class GeneratorWindow extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);

        this.editorArray = {};
        this.unsaved = false;

        this.sendToSettings = this.sendToSettings.bind(this);
        this.resetSettings = this.resetSettings.bind(this);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "json-editor-menu",
            title: "JSON Editor",
            template: "modules/npcgen/templates/jsonEditor.html",
            classes: ["sheet"],
            closeOnSubmit: true,
            resizable: true,
            width: 602,
            height: 600
        });
    }

    /**
     * @param  {JQuery} html
     */
    activateListeners(html) {
        super.activateListeners(html);

        this.initEditorHtml();

        this.resetHidden(html, "classesJSON");
        this.setTitle(game.i18n.localize("npcGen.classes"));

        // top button row
        html.find('.header-button[name="classesJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "classesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/classes.json");
            this.resetHidden(html, "classesJSON");
            this.setTitle(game.i18n.localize("npcGen.classes"));
        });
        html.find('.header-button[name="languagesJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "languagesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/languages.json");
            this.resetHidden(html, "languagesJSON");
            this.setTitle(game.i18n.localize("npcGen.language"));
        });
        html.find('.header-button[name="namesJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "namesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/names.json");
            this.resetHidden(html, "namesJSON");
            this.setTitle(game.i18n.localize("npcGen.names"));
        });
        html.find('.header-button[name="traitsJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "traitsJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/personalitytraits.json");
            this.resetHidden(html, "traitsJSON");
            this.setTitle(game.i18n.localize("npcGen.traits"));
        });
        html.find('.header-button[name="plothooksJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "plothooksJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/plothooks.json");
            this.resetHidden(html, "plothooksJSON");
            this.setTitle(game.i18n.localize("npcGen.plotHook"));
        });
        html.find('.header-button[name="professionJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "professionJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/professions.json");
            this.resetHidden(html, "professionJSON");
            this.setTitle(game.i18n.localize("npcGen.professions"));
        });
        html.find('.header-button[name="racesJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "racesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/races.json");
            this.resetHidden(html, "racesJSON");
            this.setTitle(game.i18n.localize("npcGen.races"));
        });
        html.find('.header-button[name="sexJSON"]').on('click', (e) => {
            e.preventDefault();
            this.checkPopup(html, "sexJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/sex.json");
            this.resetHidden(html, "sexJSON");
            this.setTitle(game.i18n.localize("npcGen.relationship"));
        });

        // bottom button row
        html.find('button.toggle-button').on('click', (event) => {
            let buttonId = event.target.id;
            let currentSetting = game.settings.get("npcgen", `only${capitalizeFirstLetter(buttonId)}`);
            if (currentSetting) {
                event.target.textContent = game.i18n.localize("npcGen.defaultOn");
                game.settings.set("npcgen", `only${capitalizeFirstLetter(buttonId)}`, false);
            } else {
                event.target.textContent = game.i18n.localize("npcGen.defaultOff");
                game.settings.set("npcgen", `only${capitalizeFirstLetter(buttonId)}`, true);
            }
        });

        html.find('button.save-json-button').on('click', () => { this.sendToSettings(); });
        html.find('button.reset-current-json').on('click', () => { this.resetSettings(html); });
    }

    /**
    * Default Options for this FormApplication
    */
    getData(options) {
        const data = super.getData(options);

        data.onlyClassesJSON = game.settings.get("npcgen", "onlyClassesJSON");
        data.onlyLanguagesJSON = game.settings.get("npcgen", "onlyLanguagesJSON");
        data.onlyNamesJSON = game.settings.get("npcgen", "onlyNamesJSON");
        data.onlyTraitsJSON = game.settings.get("npcgen", "onlyTraitsJSON");
        data.onlyPlothooksJSON = game.settings.get("npcgen", "onlyPlothooksJSON");
        data.onlyProfessionJSON = game.settings.get("npcgen", "onlyProfessionJSON");
        data.onlyRacesJSON = game.settings.get("npcgen", "onlyRacesJSON");
        data.onlySexJSON = game.settings.get("npcgen", "onlySexJSON");

        return data;
    }

    /**
     * @param  {JQuery} html
     * @param  {String} visibleEditor
     */
    resetHidden(html, visibleEditor) {
        html.find('.editor[id="classesJSON"]').css("display", "none");
        html.find('.header-button[name="classesJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="classesJSON"]').css("display", "none");

        html.find('.editor[id="languagesJSON"]').css("display", "none");
        html.find('.header-button[name="languagesJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="languagesJSON"]').css("display", "none");

        html.find('.editor[id="namesJSON"]').css("display", "none");
        html.find('.header-button[name="namesJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="namesJSON"]').css("display", "none");

        html.find('.editor[id="traitsJSON"]').css("display", "none");
        html.find('.header-button[name="traitsJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="traitsJSON"]').css("display", "none");

        html.find('.editor[id="plothooksJSON"]').css("display", "none");
        html.find('.header-button[name="plothooksJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="plothooksJSON"]').css("display", "none");

        html.find('.editor[id="professionJSON"]').css("display", "none");
        html.find('.header-button[name="professionJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="professionJSON"]').css("display", "none");

        html.find('.editor[id="racesJSON"]').css("display", "none");
        html.find('.header-button[name="racesJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="racesJSON"]').css("display", "none");

        html.find('.editor[id="sexJSON"]').css("display", "none");
        html.find('.header-button[name="sexJSON"]').css({ "outline": "unset", "box-shadow": "unset" });
        html.find('.toggle-button[id="sexJSON"]').css("display", "none");




        html.find(`.editor[id="${visibleEditor}"]`).css("display", "block");
        html.find(`.header-button[name="${visibleEditor}"]`).css({ "outline": "none", "box-shadow": "0 0 5px red" });
        html.find(`.toggle-button[id="${visibleEditor}"]`).css("display", "");
    }

    checkPopup(html, name, url) {
        if (html.find(`.editor[id="${name}"]`).css("display") === "block") {
            window.open(url, "Example", "menubar=no,status=no,height=600,width=500");
        }
    }

    /**
     * @param  {String} title
     */
    setTitle(title) {
        jQuery('#json-editor-menu header.window-header.flexrow.draggable.resizable h4.window-title')[0].textContent = title;
    }

    /**
     * @override
     * @private
     */
    _getHeaderButtons() {
        return [
            {
                label: "Close",
                class: "close",
                icon: "fas fa-times",
                onclick: ev => {
                    if (this.unsaved) {
                        Dialog.confirm({
                            title: game.i18n.localize("npcGen.confirmCloseTitle"),
                            content: `<p>${game.i18n.localize("npcGen.confirmCloseDesc")}</p>`,
                            yes: () => {
                                jQuery('#json-editor.json-code-editor button.save-json-button').trigger('click');
                                setTimeout(() => {
                                    this.close();
                                }, 50);
                            },
                            no: () => this.close(),
                            defaultYes: false
                        });
                    } else {
                        this.close();
                    }
                }
            }
        ];
    }

    initEditorHtml() {
        this.createEditor("classesJSON");
        this.createEditor("languagesJSON");
        this.createEditor("namesJSON");
        this.createEditor("traitsJSON");
        this.createEditor("plothooksJSON");
        this.createEditor("professionJSON");
        this.createEditor("racesJSON");
        this.createEditor("sexJSON");
    }

    sendToSettings() {
        game.settings.set("npcgen", "classesJSON", this.editorArray["classesJSON"].getValue());
        game.settings.set("npcgen", "languagesJSON", this.editorArray["languagesJSON"].getValue());
        game.settings.set("npcgen", "namesJSON", this.editorArray["namesJSON"].getValue());
        game.settings.set("npcgen", "traitsJSON", this.editorArray["traitsJSON"].getValue());
        game.settings.set("npcgen", "plothooksJSON", this.editorArray["plothooksJSON"].getValue());
        game.settings.set("npcgen", "professionJSON", this.editorArray["professionJSON"].getValue());
        game.settings.set("npcgen", "racesJSON", this.editorArray["racesJSON"].getValue());
        game.settings.set("npcgen", "sexJSON", this.editorArray["sexJSON"].getValue());
        ui.notifications.notify('Saved!');
        this.unsaved = false;
    }

    createEditor(name) {
        this.editorArray[name] = ace.edit(name);
        this.editorArray[name].setOptions({
            mode: "ace/mode/json",
            theme: "ace/theme/twilight",
            showPrintMargin: false,
            enableLiveAutocompletion: true
        });
        this.editorArray[name].setValue(game.settings.get("npcgen", name), -1);
        this.editorArray[name].commands.addCommand({
            name: "Save",
            bindKey: { win: "Ctrl-S", mac: "Command-S" },
            exec: this.sendToSettings
        });
        this.editorArray[name].getSession().on('change', () => { if (this.unsaved === false) { this.unsaved = true; } });
        new ResizeObserver(() => {
            this.editorArray[name].resize();
            this.editorArray[name].renderer.updateFull();
        }).observe(this.editorArray[name].container);
    }
    /**
     * @param  {JQuery} html
     */
    resetSettings(html) {
        let _this = this;
        html.find('.editor').each(function (_index, element) {
            if (element.style.display === "block") {
                let defaultVal = game.settings.settings.get(`npcgen.${element.id}`).default;
                _this.editorArray[element.id].setValue(defaultVal, -1);
            }
        });
    }
}




async function initJSON() {
    jQuery.getJSON('modules/npcgen/data/classes.json', (json) => classesJSON = json);
    jQuery.getJSON('modules/npcgen/data/personalitytraits.json', (json) => personalityTraitsJSON = json);
    jQuery.getJSON('modules/npcgen/data/plothooks.json', (json) => plotHooksJSON = json);
    jQuery.getJSON('modules/npcgen/data/professions.json', (json) => professionsJSON = json);
    jQuery.getJSON('modules/npcgen/data/races.json', (json) => racesJSON = json);
    jQuery.getJSON('modules/npcgen/data/sex.json', (json) => sexJSON = json);
    jQuery.getJSON('modules/npcgen/data/lists.json', (json) => listJSON = json);
    jQuery.getJSON('modules/npcgen/data/languages.json', (json) => languagesJSON = json);
    jQuery.getJSON('modules/npcgen/data/names.json', (json) => namesJSON = json);
}

/**
 * @param  {String} string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param  {String} diceString
 */
function rollDiceString(diceString) {
    let [count, dice] = diceString.split("d");
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.ceil(Math.random() * dice);
    }
    return total;
}

/**
 * @param  {Number} max - max number
 * @param  {Number} numDice - number of rolls
 */
function weightedRandom(max, numDice) {
    let num = 0;
    for (let i = 0; i < numDice; i++) {
        num += Math.random() * (max / numDice);
    }
    return num;
}

/**
 * @param  {Number} inches
 * @returns feet string
 */
function inchesToFeet(inches) {
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

/**
 *
 * @param {Number} raw
 */
function calculateAbilityMod(raw) {
    return Math.ceil(raw / 2) - 5;
}

/**
 *  registers settings for json editor
 */
function registerJSONEditorSettings() {
    // editor content settings

    game.settings.register("npcgen", "classesJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    \n}'
    });

    game.settings.register("npcgen", "languagesJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '[\n    \n]'
    });

    game.settings.register("npcgen", "namesJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    "First": {\n        "Male": {\n            \n        },\n        "Female": {\n            \n        }\n    },\n    "Last": {\n    \n    }\n}'
    });

    game.settings.register("npcgen", "traitsJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    "Good Traits": [\n        \n    ],\n    "Bad Traits": [\n        \n    ]\n}'
    });

    game.settings.register("npcgen", "plothooksJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    \n}'
    });

    game.settings.register("npcgen", "professionJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    "Learned": [\n        \n    ],\n    "Lesser Nobility": [\n        \n    ],\n    "Professional": [\n        \n    ],\n    "Working Class": [\n        \n    ],\n    "Martial": [\n        \n    ],\n    "Underclass": [\n        \n    ],\n    "Entertainer": [\n        \n    ]\n}'
    });

    game.settings.register("npcgen", "racesJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    \n}'
    });

    game.settings.register("npcgen", "sexJSON", {
        scope: "world",
        config: false,
        type: String,
        default: '{\n    "Orientation": [\n        \n    ],\n    "Gender": [\n        \n    ],\n    "Relationship Status": [\n        \n    ]\n}'
    });


    // only custom settings

    game.settings.register("npcgen", "onlyClassesJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyLanguagesJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyNamesJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyTraitsJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyPlothooksJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyProfessionJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlyRacesJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "onlySexJSON", {
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register("npcgen", "compatMode", {
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        name: game.i18n.localize("npcGen.saveCharacter"),
        hint: game.i18n.localize("npcGen.saveCharacterHint"),
        restricted: true
    });
}


// add button to side menu
Hooks.on('renderActorDirectory', (_app, html) => {
    if (game.user.isGM) {
        const generateButton = jQuery(`<button class="npc-generator-btn"><i class="fas fa-fire"></i> Generate NPC</button>`);
        html.find('.npc-generator-btn').remove();

        html.find('.directory-footer').append(generateButton);

        generateButton.on('click', (ev) => {
            ev.preventDefault();
            let generator = new NPCGenerator();
            generator.render(true);
        });
    }
});


Hooks.once('init', () => {
    console.log("NPC Generator | initializing");

    // handlebars helper that keeps disabled checkboxes off
    Handlebars.registerHelper('ischeckboxon', function (name, data) {
        const prefixes = ["Gender", "Trait", "Profession", "RelationshipStatus", "Orientation", "Race", "Class"];

        for (let prefix of prefixes) {
            if (data.data.root.disabledBoxes.includes(prefix + name)) {
                return false;
            }
        }

        return true;
    });

    // handlebars helper that keeps disabled checkboxes off
    Handlebars.registerHelper('ischeckboxonextended', function (name, data) {
        const prefixes = ["Gender", "Trait", "Profession", "RelationshipStatus", "Orientation", "Race", "Class"];

        for (let prefix of prefixes) {
            if (data.data.root.disabledBoxes.includes(prefix + name)) {
                return false;
            }
        }

        if (difference(game.settings.get("npcgen", "registeredRaces")[0], globalRacesList).length !== 0) {
            setTimeout(() => game.settings.set("npcgen", "registeredRaces", globalRacesList), 1000);
            return false;
        }

        return true;
    });

    // handlebars helper for getting probability weight
    Handlebars.registerHelper('npcGenProbWeight', function (name, type, data) {
        if (Object.keys(data.data.root.weights).includes("Prob" + type + name)) {
            return data.data.root.weights["Prob" + type + name];
        } else if (type === "Trait") {
            return 3;
        } else {
            return 1;
        }
    });

    // init variable for unsaved watcher
    window.npcGen = window.npcGen || {};

    // helper for checking for new races
    game.settings.register("npcgen", "registeredRaces", {
        scope: "client",
        config: false,
        type: Array,
        default: []
    });

    // settings for saving unchecked boxes
    game.settings.register("npcgen", "disabledBoxes", {
        scope: "client",
        config: false,
        type: Array,
        default: []
    });

    // setting for saving weights
    game.settings.register("npcgen", "weights", {
        scope: "client",
        config: false,
        type: Object,
        default: {}
    });



    // register settings for json editor
    registerJSONEditorSettings();

    // register json editor
    game.settings.registerMenu("npcgen", "jsonEditor", {
        name: game.i18n.localize("npcGen.settingsTitle"),
        label: game.i18n.localize("npcGen.settingsLabel"),
        hint: game.i18n.localize("npcGen.settingsHint"),
        icon: "far fa-file-code",
        type: GeneratorWindow,
        restricted: true
    });
});
