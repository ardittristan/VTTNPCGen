export default class ExportSettings extends FormApplication {
  constructor() {
    super({}, {});
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "npcGen-export-settings",
      classes: ["sheet"],
      template: "modules/npcgen/templates/exportSettings.html",
      resizable: false,
      minimizable: false,
      title: "",
      width: 230
    });
  }

  async getData(options) {
    const data = super.getData(options);

    data.settings = JSON.stringify(this.getSettings());

    return data;
  }

  getSettings() {
    return {
      disabledBoxes: game.settings.get("npcgen", "disabledBoxes"),
      weights: game.settings.get("npcgen", "weights"),
      imageLocations: game.settings.get("npcgen", "imageLocations"),
      classesJSON: game.settings.get("npcgen", "classesJSON"),
      languagesJSON: game.settings.get("npcgen", "languagesJSON"),
      namesJSON: game.settings.get("npcgen", "namesJSON"),
      traitsJSON: game.settings.get("npcgen", "traitsJSON"),
      plothooksJSON: game.settings.get("npcgen", "plothooksJSON"),
      professionJSON: game.settings.get("npcgen", "professionJSON"),
      racesJSON: game.settings.get("npcgen", "racesJSON"),
      sexJSON: game.settings.get("npcgen", "sexJSON"),
      onlyClassesJSON: game.settings.get("npcgen", "onlyClassesJSON"),
      onlyLanguagesJSON: game.settings.get("npcgen", "onlyLanguagesJSON"),
      onlyNamesJSON: game.settings.get("npcgen", "onlyNamesJSON"),
      onlyTraitsJSON: game.settings.get("npcgen", "onlyTraitsJSON"),
      onlyPlothooksJSON: game.settings.get("npcgen", "onlyPlothooksJSON"),
      onlyProfessionJSON: game.settings.get("npcgen", "onlyProfessionJSON"),
      onlyRacesJSON: game.settings.get("npcgen", "onlyRacesJSON"),
      onlySexJSON: game.settings.get("npcgen", "onlySexJSON"),
      compatMode: game.settings.get("npcgen", "compatMode"),
    };
  }

  setSettings(input) {
    if (input.disabledBoxes?.[0]) game.settings.set("npcgen", "disabledBoxes", input.disabledBoxes[0]);
    if (input.weights) game.settings.set("npcgen", "weights", input.weights);
    if (input.imageLocations) game.settings.set("npcgen", "imageLocations", input.imageLocations);
    if (input.classesJSON) game.settings.set("npcgen", "classesJSON", input.classesJSON);
    if (input.languagesJSON) game.settings.set("npcgen", "languagesJSON", input.languagesJSON);
    if (input.namesJSON) game.settings.set("npcgen", "namesJSON", input.namesJSON);
    if (input.traitsJSON) game.settings.set("npcgen", "traitsJSON", input.traitsJSON);
    if (input.plothooksJSON) game.settings.set("npcgen", "plothooksJSON", input.plothooksJSON);
    if (input.professionJSON) game.settings.set("npcgen", "professionJSON", input.professionJSON);
    if (input.racesJSON) game.settings.set("npcgen", "racesJSON", input.racesJSON);
    if (input.sexJSON) game.settings.set("npcgen", "sexJSON", input.sexJSON);
    if (input.onlyClassesJSON) game.settings.set("npcgen", "onlyClassesJSON", input.onlyClassesJSON);
    if (input.onlyLanguagesJSON) game.settings.set("npcgen", "onlyLanguagesJSON", input.onlyLanguagesJSON);
    if (input.onlyNamesJSON) game.settings.set("npcgen", "onlyNamesJSON", input.onlyNamesJSON);
    if (input.onlyTraitsJSON) game.settings.set("npcgen", "onlyTraitsJSON", input.onlyTraitsJSON);
    if (input.onlyPlothooksJSON) game.settings.set("npcgen", "onlyPlothooksJSON", input.onlyPlothooksJSON);
    if (input.onlyProfessionJSON) game.settings.set("npcgen", "onlyProfessionJSON", input.onlyProfessionJSON);
    if (input.onlyRacesJSON) game.settings.set("npcgen", "onlyRacesJSON", input.onlyRacesJSON);
    if (input.onlySexJSON) game.settings.set("npcgen", "onlySexJSON", input.onlySexJSON);
    if (input.compatMode) game.settings.set("npcgen", "compatMode", input.compatMode);
  }

  /**
   * @param {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find("button#cancelButton").on("click", () => {
      this.close();
    });
  }

  /**
   * @param {Event} event
   * @param {Object} formData
   */
  async _updateObject(event, formData) {
    this.setSettings(JSON.parse(formData.settingsText));
  }
}
