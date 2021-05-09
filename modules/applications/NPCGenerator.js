import { pick, sample, has, difference, filter } from "../../lib/underscore.min.js";
import merge from "../../lib/lodash-merge.min.js";
import ImageLocationSettings from "./imageLocationSettings.js";

export default class NPCGenerator extends FormApplication {
  constructor(
    jsonOptions = {
      classesJSON: {},
      languagesJSON: [],
      namesJSON: {},
      personalityTraitsJSON: {},
      plotHooksJSON: {},
      professionsJSON: {},
      racesJSON: {},
      sexJSON: {},
      listJSON: {},
    }
  ) {
    super({}, {});

    this.jsonOptions = jsonOptions;

    this.done = false;

    this.generateNPC = this.generateNPC.bind(this);
    this._apiSave = this._apiSave.bind(this);

    /* -------------< Combine with user JSON if enabled >--------------- */

    if (game.settings.get("npcgen", "onlyClassesJSON")) {
      this.classesJSON = JSON.parse(game.settings.get("npcgen", "classesJSON"));
    } else {
      this.classesJSON = merge(this.jsonOptions.classesJSON, JSON.parse(game.settings.get("npcgen", "classesJSON")));
    }

    if (game.settings.get("npcgen", "onlyLanguagesJSON")) {
      this.languagesJSON = JSON.parse(game.settings.get("npcgen", "languagesJSON"));
    } else {
      this.languagesJSON = merge(this.jsonOptions.languagesJSON, JSON.parse(game.settings.get("npcgen", "languagesJSON")));
    }

    if (game.settings.get("npcgen", "onlyNamesJSON")) {
      this.namesJSON = JSON.parse(game.settings.get("npcgen", "namesJSON"));
    } else {
      this.namesJSON = merge(this.jsonOptions.namesJSON, JSON.parse(game.settings.get("npcgen", "namesJSON")));
    }

    if (game.settings.get("npcgen", "onlyTraitsJSON")) {
      this.personalityTraits = JSON.parse(game.settings.get("npcgen", "traitsJSON"));
    } else {
      this.personalityTraitsJSON = merge(this.jsonOptions.personalityTraitsJSON, JSON.parse(game.settings.get("npcgen", "traitsJSON")));
    }

    if (game.settings.get("npcgen", "onlyPlothooksJSON")) {
      this.plotHooksJSON = JSON.parse(game.settings.get("npcgen", "plothooksJSON"));
    } else {
      this.plotHooksJSON = merge(this.jsonOptions.plotHooksJSON, JSON.parse(game.settings.get("npcgen", "plothooksJSON")));
    }

    if (game.settings.get("npcgen", "onlyProfessionJSON")) {
      this.professionsJSON = JSON.parse(game.settings.get("npcgen", "professionJSON"));
    } else {
      this.professionsJSON = merge(this.jsonOptions.professionsJSON, JSON.parse(game.settings.get("npcgen", "professionJSON")));
    }

    if (game.settings.get("npcgen", "onlyRacesJSON")) {
      this.racesJSON = JSON.parse(game.settings.get("npcgen", "racesJSON"));
    } else {
      this.racesJSON = merge(this.jsonOptions.racesJSON, JSON.parse(game.settings.get("npcgen", "racesJSON")));
    }

    if (game.settings.get("npcgen", "onlySexJSON")) {
      this.sexJSON = JSON.parse(game.settings.get("npcgen", "sexJSON"));
    } else {
      this.sexJSON = merge(this.jsonOptions.sexJSON, JSON.parse(game.settings.get("npcgen", "sexJSON")));
    }

    this.listJSON = this.jsonOptions.listJSON;

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

    this.useMinMaxStats = false;

    this.disabledBoxes = game.settings.get("npcgen", "disabledBoxes");

    this.weights = game.settings.get("npcgen", "weights");

    /* -------------< New Races? >--------------- */

    window.npcGen.globalRacesList = this.races;

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

    // icon
    this.genIcon = "icons/svg/mystery-man.svg";
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "npcgenerator-menu",
      title: "NPC Generator",
      template: "modules/npcgen/templates/generator.html",
      classes: ["sheet"],
      closeOnSubmit: false,
      resizable: true,
      width: 1205,
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
    data.useMinMaxStats = this.useMinMaxStats;

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

    // icon
    data.genIcon = this.genIcon;

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
    console.info("%cINFO | Entries in npc generator:", "color: #fff; background-color: #444; padding: 2px 4px; border-radius: 2px;", removeGenFromObj(d));
    if (!this.done) {
      this.updateFormValues(d);
      this.generateNPC(d);
    } else {
      this.saveNPC(d);
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".npc-generator-header").on("click", (e) => {
      var panel = e.currentTarget.nextElementSibling;
      var indicator = e.currentTarget.querySelector(".indicator");
      if (panel.style.display !== "none") {
        panel.style.display = "none";
        indicator.innerText = "+";
      } else {
        panel.style.display = "block";
        indicator.innerText = "-";
      }
    });

    html.find(".npc-generator-bottom-button[name='cancel']").on("click", (e) => {
      e.preventDefault();
      this.close();
    });

    html.find(".npc-generator-bottom-button[name='generate']").on("click", (e) => {
      e.preventDefault();
      jQuery(e.target.form).trigger("submit");
    });

    html.find(".npc-generator-bottom-button[name='accept']").on("click", (e) => {
      e.preventDefault();
      this.done = true;
      jQuery(e.target.form).trigger("submit");
      this.close();
    });

    html
      .find(".npc-generator-big-box")
      .find("input")
      .each((_, e) => {
        jQuery(e).on("input", (e) => {
          e.originalEvent.target.size = e.originalEvent.target.value.length * 1.05 + 1;
        });
        e.size = e.value.length * 1.05 + 1;
      });

    html.find('.npc-generator-box.header input[type="text"]').each((_, e) => {
      jQuery(e).on("input", (e) => {
        e.originalEvent.target.size = e.originalEvent.target.value.length * 1.15 + 1.5;
      });
      e.size = e.value.length * 1.15 + 1.5;
    });

    html
      .find(".npc-generator-big-box")
      .find("textarea")
      .each(function () {
        setTimeout(() => {
          this.style.height = "auto";
          this.style.height = this.scrollHeight - 18 + "px";
        }, 50);
      })
      .on("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight - 18 + "px";
      });
  }

  setupInput(d) {
    const genders = this.getEnabledValues(d, "Gender");
    /** @type {String[]} */
    let gendersOut = [];
    genders.forEach((gender) => {
      for (let i = 0; i < (this.getProbValue(d, "Gender", gender) || 1); i++) {
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
      for (let i = 0; i < (this.getProbValue(d, "Profession", profession) || 1); i++) {
        professionsOut.push(profession);
      }
    });

    const relationshipStatus = this.getEnabledValues(d, "RelationshipStatus");
    /** @type {String[]} */
    let relationshipStatusOut = [];
    relationshipStatus.forEach((relationshipStatus) => {
      for (let i = 0; i < (this.getProbValue(d, "RelationshipStatus", relationshipStatus) || 1); i++) {
        relationshipStatusOut.push(relationshipStatus);
      }
    });

    const orientations = this.getEnabledValues(d, "Orientation");
    /** @type {String[]} */
    let orientationsOut = [];
    orientations.forEach((orientation) => {
      for (let i = 0; i < (this.getProbValue(d, "Orientation", orientation) || 1); i++) {
        orientationsOut.push(orientation);
      }
    });

    const races = this.getEnabledValues(d, "Race", "NameForced");
    /** @type {String[]} */
    let racesOut = [];
    races.forEach((race) => {
      for (let i = 0; i < (this.getProbValue(d, "Race", race) || 1); i++) {
        racesOut.push(race);
      }
    });

    const classes = this.getEnabledValues(d, "Class");
    /** @type {String[]} */
    let classesOut = [];
    classes.forEach((klass) => {
      for (let i = 0; i < (this.getProbValue(d, "Class", klass) || 1); i++) {
        classesOut.push(klass);
      }
    });

    const returnvalue = [gendersOut, traitsOut, professionsOut, relationshipStatusOut, orientationsOut, racesOut, classesOut];

    console.log(returnvalue);

    return returnvalue;
  }

  /**
   * generates info on npc
   * @param  {Object} d
   */
  async generateNPC(d) {
    this.resetValues();

    const [genders, traits, professions, relationshipStatus, orientations, races, classes] = this.setupInput(d);

    // Gender
    this.generateGender(genders);

    // Traits
    this.generateTraits(d, traits);

    // Profession
    const professionArea = this.generateProfession(professions);

    // Relationship Status
    this.generateRelationship(relationshipStatus);

    // Sexual Orientation
    this.generateOrientation(orientations);

    // Main Race
    this.generateMainRace(races);

    // Main Class
    this.generateMainClass(classes);

    // Plothook
    this.generatePlothook(professionArea);

    // Level

    this.generateLevel(d);

    // proficiencies
    this.generateProficiencies();

    // saving throws
    this.generateSavingThrows();

    // skills
    this.generateSkills();

    // Race info
    // age
    this.generateAge();

    // languages
    this.generateLanguages();

    // height
    let heightMod = this.generateHeight();

    // weight
    this.generateWeight(heightMod);

    // speed
    this.generateSpeed();

    // Ability Scores
    // modifiers
    this.generateAbilityModifiers();

    // total
    this.generateAbilityTotals(d);

    // Class info
    // hp
    this.generateHp();

    // Sub Class
    this.generateSubclass(d);

    // First Name
    this.generateFirstName();

    // Last Name
    this.generateLastName();

    await this.generateIcon(this.genRace, this.genGender, this.genClass);

    this.render();
  }

  /**
   * saves npc to actor
   * @param {Object} d
   * @param {boolean} [isApi=false]
   */
  async saveNPC(d, isApi = false) {
    // set abilities
    let abilities = this.getAbilities(d);

    // set biography
    let biography = this.getBiography(d);

    // set skills
    let [skills, classSkills] = this.getSkills(d);

    // set class
    let classItem = this.getClassItem(d, classSkills);

    console.log(classItem);

    let actorOptions = this.getActorOptions(d, abilities, biography, skills, classItem);

    if (!game.settings.get("npcgen", "compatMode")) {
      actorOptions.type = "npc";
      actorOptions.data.details.type = d.genRace;
      actorOptions.data.details.biography.value =
        `<p>${game.i18n.localize("npcGen.proficiencies")}: ` +
        d.genProficiencies.trim().slice(0, -1).replace(/\r?\n/g, ", ") +
        "\n</p>" +
        "<p>&nbsp;\n</p>" +
        `<p>${game.i18n.localize("npcGen.profession")}: ${d.genProfession}</p>\n` +
        biography;
    }

    if (!isApi) {
      let actor = await CONFIG.Actor.documentClass.create(foundry.utils.deepClone(actorOptions));
      actor.sheet.render(true);
    } else {
      return actorOptions;
    }
  }

  /**
   * @param {String} race
   * @param {String} gender
   * @param {String} Class
   */
  async generateIcon(race, gender, Class) {
    const defaultReturn = "icons/svg/mystery-man.svg";

    let locations = game.settings.get("npcgen", "imageLocations");
    let path = locations?.[game.settings.get("npcgen", "roleSpecificImages") && locations?.[race + gender + Class]?.length > 0 ? race + gender + Class : race + gender];
    if (!path || path.length === 0) return defaultReturn;

    /** @type {String[]} */
    let iconList = [];

    try {
      let fileObject = await FilePicker.browse("public", path);

      if (fileObject.target && fileObject.target !== ".") {
        iconList = iconList.concat(await this._getIcons(fileObject, "public"));
      }
    } catch {}

    try {
      let fileObject = await FilePicker.browse("data", path);

      if (fileObject.target && fileObject.target !== ".") {
        iconList = iconList.concat(await this._getIcons(fileObject, "data"));
      }
    } catch {}

    if (iconList.length === 0) return defaultReturn;

    this.genIcon = sample(iconList);

    return;
  }

  /**
   * @param {Object} fileObject
   * @param {String} source
   */
  async _getIcons(fileObject, source) {
    /** @type {String[]} */
    let iconList = [];

    /** @type {String[]} */
    let files = fileObject?.files;
    if (Array.isArray(files)) {
      iconList = iconList.concat(files);
    }

    /** @type {String[]} */
    let folderList = fileObject?.dirs;
    if (Array.isArray(folderList)) {
      await asyncForEach(folderList, async (folderPath) => {
        let newFileObject = await FilePicker.browse(source, folderPath);
        let folderContent = await this._getIcons(newFileObject, source);

        iconList = iconList.concat(folderContent);
      });
    }

    return iconList;
  }

  /**
   * @param {String[]} genders
   */
  generateGender(genders) {
    if (genders.length != 0) {
      this.genGender = sample(genders);
    }
  }

  /**
   * @param {Object} d
   * @param {String[]} traits
   */
  generateTraits(d, traits) {
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
  }

  /**
   * @param {String[]} professions
   */
  generateProfession(professions) {
    let professionArea = "";
    if (professions.length != 0) {
      professionArea = sample(professions);
      this.genProfession = sample(this.professionsJSON[professionArea]);
    }
    return professionArea;
  }

  /**
   * @param {String[]} relationshipStatus
   */
  generateRelationship(relationshipStatus) {
    if (relationshipStatus.length != 0) {
      this.genRelationship = sample(relationshipStatus);
    }
  }

  /**
   * @param {String[]} orientations
   */
  generateOrientation(orientations) {
    if (orientations.length != 0) {
      this.genOrientation = sample(orientations);
    }
  }

  /**
   * @param {String[]} races
   */
  generateMainRace(races) {
    if (races.length != 0) {
      this.genRace = sample(races);
    } else {
      this.genRace = sample(this.races);
    }
  }

  /**
   * @param {String[]} classes
   */
  generateMainClass(classes) {
    if (classes.length != 0) {
      this.genClass = sample(classes);
    } else {
      this.genClass = sample(this.classes);
    }
  }

  /**
   * @param {String} professionArea
   */
  generatePlothook(professionArea) {
    this.genPlotHook = sample(this.plotHooksJSON.All.concat(this.plotHooksJSON[professionArea]));
  }

  /**
   * @param {Object} d
   */
  generateLevel(d) {
    this.level = Number(d.level);
  }

  generateHp(object = this.classesJSON[this.genClass]) {
    let hp = Number(object.hp.split("d")[1]);
    for (let i = 0; i < this.level - 1; i++) {
      hp += rollDiceString(object.hp);
    }

    hp += this.genConMod * this.level;
    this.genHp = String(hp);
  }

  generateProficiencies(object = this.classesJSON[this.genClass]) {
    let proficiencies = [];
    if (has(object.proficiencies, "Armor")) {
      object.proficiencies.Armor.forEach((value) => {
        proficiencies.push(value);
      });
    }
    if (has(object.proficiencies, "Weapons")) {
      object.proficiencies.Weapons.forEach((value) => {
        proficiencies.push(value);
      });
    }
    if (has(object.proficiencies, "Tools")) {
      object.proficiencies.Tools.forEach((value) => {
        proficiencies.push(value);
      });
    }
    this.genProficiencies = proficiencies;
  }

  generateSavingThrows(object = this.classesJSON[this.genClass]) {
    this.genSaveThrows = object.proficiencies["Saving Throws"];
  }

  generateSkills(object = this.classesJSON[this.genClass]) {
    let skills = [];
    object.proficiencies.Skills.forEach((array) => {
      let working = true;
      let samp = "";
      while (working) {
        if (array[0] === "Any") {
          samp = sample(this.skillList);
          if (!skills.includes(samp)) {
            working = false;
          }
        } else {
          samp = sample(array);
          if (!skills.includes(samp)) {
            working = false;
          }
        }
      }
      skills.push(samp);
    });
    this.genSkills = skills;
  }

  generateAge() {
    this.genAge = Math.floor(weightedRandom(this.racesJSON[this.genRace].age, 3));
  }

  generateLanguages() {
    let languages = [];
    this.racesJSON[this.genRace].languages.forEach((value) => {
      if (value === "Any") {
        let working = true;
        let samp = "";
        while (working) {
          samp = sample(this.languages);
          if (!languages.includes(samp)) {
            working = false;
          }
        }
        languages.push(samp);
      } else {
        languages.push(value);
      }
    });
    this.genLanguages = languages;
  }

  generateHeight() {
    const baseHeight = Number(this.racesJSON[this.genRace].height.base);
    const heightMod = rollDiceString(this.racesJSON[this.genRace].height.mod);
    this.genHeight = inchesToFeet(baseHeight + heightMod);
    return heightMod;
  }

  /**
   * @param {Number} heightMod
   */
  generateWeight(heightMod) {
    const baseWeight = Number(this.racesJSON[this.genRace].weight.base);
    const weightMod = rollDiceString(this.racesJSON[this.genRace].weight.mod);
    this.genWeight = baseWeight + heightMod * weightMod;
  }

  generateSpeed() {
    this.genSpeed = this.racesJSON[this.genRace].speed;
  }

  generateAbilityModifiers() {
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
          if (this[`gen${mod}Mod`] === 0) {
            working = false;
          }
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
              if (this[`gen${mod}Mod`] === 0) {
                working = false;
              }
            }
            this[`gen${mod}Mod`] += amount;
          }
        });
      }
    }
  }

  generateAbilityTotals(d) {
    if (d.useMinMaxStats) {
      this.generateAbilityTotalsMinMax();
    } else {
      this.genStr = String(rollDiceString("4d6kh3") + this.genStrMod);
      this.genDex = String(rollDiceString("4d6kh3") + this.genDexMod);
      this.genCon = String(rollDiceString("4d6kh3") + this.genConMod);
      this.genInt = String(rollDiceString("4d6kh3") + this.genIntMod);
      this.genWis = String(rollDiceString("4d6kh3") + this.genWisMod);
      this.genCha = String(rollDiceString("4d6kh3") + this.genChaMod);
    }
  }

  generateAbilityTotalsMinMax() {
    let scoreList = [];

    for (let i = 0; i < 6; i++) {
      scoreList.push(rollDiceString("4d6kh3"));
    }

    scoreList.sort(ascending_sort);

    let attributeSortOrder = [];
    var object = this.classesJSON[this.genClass];
    object.attributeSortOrder.forEach((value) => {
      attributeSortOrder.push(value);
    });

    let fullAttributeList = {};
    fullAttributeList["Str"] = 0;
    fullAttributeList["Dex"] = 0;
    fullAttributeList["Con"] = 0;
    fullAttributeList["Int"] = 0;
    fullAttributeList["Wis"] = 0;
    fullAttributeList["Cha"] = 0;

    attributeSortOrder.forEach((value) => {
      fullAttributeList[value] = scoreList.pop();
    });

    scoreList.sort(random_sort);

    for (var key in fullAttributeList) {
      if (fullAttributeList[key] === 0) {
        fullAttributeList[key] = scoreList.pop();
      }
    }

    this.genStr = String(fullAttributeList["Str"] + this.genStrMod);
    this.genDex = String(fullAttributeList["Dex"] + this.genDexMod);
    this.genCon = String(fullAttributeList["Con"] + this.genConMod);
    this.genInt = String(fullAttributeList["Int"] + this.genIntMod);
    this.genWis = String(fullAttributeList["Wis"] + this.genWisMod);
    this.genCha = String(fullAttributeList["Cha"] + this.genChaMod);
  }

  generateSubclass(d) {
    if (d.useSubclass) {
      if (has(this.classesJSON[this.genClass], "subclasses")) {
        this.genSubclass = sample(Object.keys(this.classesJSON[this.genClass].subclasses));
        const subclassJSON = this.classesJSON[this.genClass].subclasses[this.genSubclass];

        // hp
        if (has(subclassJSON, "hp")) {
          this.generateHp(subclassJSON);
        }

        if (has(subclassJSON, "proficiencies")) {
          // proficiencies
          this.generateProficiencies(subclassJSON);

          // saving throws
          if (has(subclassJSON.proficiencies, "Saving Throws")) {
            this.generateSavingThrows(subclassJSON);
          }

          // skills
          if (has(subclassJSON.proficiencies, "Skills")) {
            this.generateSkills(subclassJSON);
          }
        }
      }
    }
  }

  generateFirstName() {
    let firstNames = [];
    if (Object.keys(this.namesJSON.First).includes(this.genGender)) {
      /** @type {String[]} */
      let nameForced = difference(
        game.settings.get("npcgen", "registeredRaces").map((string) => `Race${string}FirstNameForced`),
        filter(this.disabledBoxes, (string) => {
          return string.includes("FirstNameForced");
        })
      );
      if (nameForced.length !== 0) {
        nameForced.forEach((raceDirty) => {
          firstNames = firstNames.concat(this.namesJSON.First[this.genGender][raceDirty.replace("Race", "").replace("FirstNameForced", "")]);
        });
      } else {
        if (this.namesJSON.First[this.genGender].All) {
          firstNames = firstNames.concat(this.namesJSON.First[this.genGender].All);
        }
        if (this.namesJSON.First[this.genGender][this.genRace]) {
          firstNames = firstNames.concat(this.namesJSON.First[this.genGender][this.genRace]);
        }
        if (this.namesJSON.First[this.genGender][this.racesJSON[this.genRace].mainRace]) {
          firstNames = firstNames.concat(this.namesJSON.First[this.genGender][this.racesJSON[this.genRace].mainRace]);
        }
      }
    } else {
      Object.keys(this.namesJSON.First).forEach((gender) => {
        /** @type {String[]} */
        let nameForced = difference(
          game.settings.get("npcgen", "registeredRaces").map((string) => `Race${string}FirstNameForced`),
          filter(this.disabledBoxes, (string) => {
            return string.includes("FirstNameForced");
          })
        );
        if (nameForced.length !== 0) {
          nameForced.forEach((raceDirty) => {
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
  }

  generateLastName() {
    let lastNames = [];
    /** @type {String[]} */
    let nameForced = difference(
      game.settings.get("npcgen", "registeredRaces").map((string) => `Race${string}LastNameForced`),
      filter(this.disabledBoxes, (string) => {
        return string.includes("LastNameForced");
      })
    );
    if (nameForced.length !== 0) {
      nameForced.forEach((raceDirty) => {
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
  }

  /**
   * @param {Object} d
   */
  getBiography(d) {
    let biography = "";

    // gender
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.gender")}: ${d.genGender}</p>\n`);
    // relationship
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.relationship")}: ${d.genRelationship}</p>\n`);
    // orientation
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.orientation")}: ${d.genOrientation}</p>\n`);
    // age
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.age")}: ${d.genAge}</p>\n`);
    // height
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.height")}: ${d.genHeight}</p>\n`);
    // weight
    biography = biography.concat(`<p>${game.i18n.localize("npcGen.weight")}: ${d.genWeight}</p>\n`);
    // static line
    biography = biography.concat(`<p>&nbsp;</p>\n<p><strong>${game.i18n.localize("npcGen.traits")}:</strong></p>\n`);
    // traits
    d.genTraits.split(/\r?\n/).forEach((trait) => {
      biography = biography.concat(`<p>${trait}</p>\n`);
    });
    // static line
    biography = biography.concat("<p>&nbsp;</p>");
    // plot hook
    biography = biography.concat(`<p><strong>${game.i18n.localize("npcGen.plotHook")}:</strong> ${d.genPlotHook}</p>`);

    return biography;
  }

  /**
   * @param {Object} d
   */
  getAbilities(d) {
    let abilities = {};
    this.listJSON.Abilities.forEach((/** @type {String} */ ability) => {
      abilities[ability.toLowerCase()] = { value: Number(d[`gen${ability}`]) };
    });

    // saving throws
    d.genSaveThrows
      .trim()
      .slice(0, -1)
      .split(", ")
      .forEach((/** @type {String} */ ability) => {
        if (abilities[ability.toLowerCase()] !== undefined) {
          abilities[ability.toLowerCase()].proficient = 1;
        }
      });

    return abilities;
  }

  /**
   * @param {Object} d
   */
  getSkills(d) {
    let skills = {};
    let classSkills = [];
    d.genSkills
      .trim()
      .slice(0, -1)
      .split(", ")
      .forEach((/** @type {String} */ skill) => {
        if (this.listJSON.Skills[skill]) {
          classSkills.push(this.listJSON.Skills[skill]);
          skills[this.listJSON.Skills[skill]] = { value: 1 };
        }
      });

    return [skills, classSkills];
  }

  /**
   * @param {Object} d
   * @param {Array} classSkills
   */
  getClassItem(d, classSkills) {
    let config = {
      name: d.genClass,
      type: "class",
      data: {
        source: this.classesJSON[d.genClass].source,
        levels: d.level,
        subclass: d.genSubclass,
        skills: {
          number: classSkills.length,
          value: classSkills,
        },
      },
    };
    let item = new CONFIG.Item.documentClass(foundry.utils.deepClone(config));
    console.log(item);
    return item;
  }

  /**
   * @param {Object} d
   * @param {Object} abilities
   * @param {String} biography
   * @param {Object} skills
   * @param {Entity<any>} classItem
   */
  getActorOptions(d, abilities, biography, skills, classItem) {
    return {
      name: `${d.genFirstName} ${d.genLastName}`,
      permission: {
        default: 0,
      },
      data: {
        abilities: abilities,
        attributes: {
          ac: {
            value: 10 + calculateAbilityMod(Number(d.genDex)),
          },
          hp: {
            value: Number(d.genHp),
            max: Number(d.genHp),
          },
          speed: {
            value: Number(d.genSpeed),
          },
        },
        details: {
          biography: {
            value: biography,
          },
          race: d.genRace,
          background: d.genProfession,
          level: Number(d.level),
        },
        skills: skills,
        traits: {
          size: this.listJSON.Sizes[this.racesJSON[d.genRace].height.size],
          languages: {
            custom: d.genLanguages.trim().slice(0, -1).replace(",", ";"),
          },
          weaponProf: {
            custom: d.genProficiencies.trim().slice(0, -1).replace(/\r?\n/g, ";"),
          },
        },
      },
      img: d.genIcon,
      type: "character",
      items: [duplicate(classItem.data)],
    };
  }

  updateFormValues(d) {
    if (d.useSubclass) {
      this.useSubclass = true;
    }
    if (d.level) {
      this.level = d.level;
    }

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

  /**
   * @param {Object} d
   * @param {String} name
   * @param {string} [excludeEnd=""]
   */
  getEnabledValues(d, name, excludeEnd = "") {
    const filteredObject = pick(d, function (value, key) {
      if (value && key.startsWith(name) && (!key.endsWith(excludeEnd) || excludeEnd.length === 0)) {
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
    this.genIcon = "icons/svg/mystery-man.svg";
  }

  _getHeaderButtons() {
    return [
      ...[
        {
          label: "Image Settings",
          class: "setting",
          icon: "fas fa-cog",
          onclick: (ev) => {
            new ImageLocationSettings({
              races: this.races,
              genders: this.gender,
              classes: this.classes,
            }).render(true);
          },
        },
      ],
      ...super._getHeaderButtons(),
    ];
  }

  async _apiSave() {
    let data = this;
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key]) && key.startsWith("gen")) data[key] = data[key].join(", ");
    });

    return await this.saveNPC(data, true);
  }
}

/**
 * @param {Number} raw
 */
function calculateAbilityMod(raw) {
  return Math.ceil(raw / 2) - 5;
}

/**
 * @param  {Number} inches
 * @returns feet string
 */
function inchesToFeet(inches) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
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
 * @param  {String} diceString
 */
function rollDiceString(diceString) {
  let diceStringMatch = diceString.match(/(?<numberOfDice>[\d]+)d(?<diceType>[\d]+)(?<keep>k(?<highOrLow>[hl])(?<keepAmount>[\d]+))?/i);
  let numberOfDice = diceStringMatch.groups.numberOfDice;
  let diceType = diceStringMatch.groups.diceType;
  let keep = diceStringMatch.groups.keep;
  let highOrLow = diceStringMatch.groups.highOrLow;
  let keepAmount = diceStringMatch.groups.keepAmount;

  if (keep === undefined) {
    // if we don't have keep, we can use the same logic by setting the keep amount to be the same number as the total number of dice
    // and it'll be the same result
    keep = "k";
    highOrLow = "h";
    keepAmount = numberOfDice;
  }

  let [count, dice] = diceString.split("d");
  let total = 0;
  let diceResults = [];

  for (let i = 0; i < numberOfDice; i++) {
    diceResults.push(Math.ceil(Math.random() * diceType));
  }

  if (highOrLow === "h") {
    diceResults.sort(descending_sort);
  } else {
    diceResults.sort(ascending_sort);
  }

  for (let i = 0; i < keepAmount; i++) {
    total += diceResults[i];
  }

  console.info("%cINFO | NPC Dice String Request:", "color: #fff; background-color: #444; padding: 2px 4px; border-radius: 2px;", removeGenFromObj(diceString));
  console.info("%cINFO | NPC generator rolls:", "color: #fff; background-color: #444; padding: 2px 4px; border-radius: 2px;", removeGenFromObj(diceResults));
  console.info("%cINFO | NPC generator total:", "color: #fff; background-color: #444; padding: 2px 4px; border-radius: 2px;", removeGenFromObj(total));

  return total;
}

/**
 * @param {Array} arr
 * @param {Function} callback
 */
async function asyncForEach(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    await callback(arr[i], i, arr);
  }
}

/**
 * @param {Object} obj
 */
function removeGenFromObj(obj) {
  let newObj = duplicate(obj);
  Object.keys(newObj).forEach((key) => {
    if (key.startsWith("gen")) {
      delete newObj[key];
    }
  });
  return newObj;
}

/**
 * Function to help perform a random sort of an array
 * @param {*} a
 * @param {*} b
 */
function random_sort(a, b) {
  return Math.random() - 0.5;
}

/**
 * Function to help perform a ascending sort of an array
 * @param {*} a
 * @param {*} b
 */
function ascending_sort(a, b) {
  return a - b;
}

/**
 * Function to help perform a descending sort of an array
 * @param {*} a
 * @param {*} b
 */
function descending_sort(a, b) {
  return b - a;
}
