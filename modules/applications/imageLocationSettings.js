export default class ImageLocationSettings extends FormApplication {
  /**
   * @param {{races: String[], genders: String[]}} options
   */
  constructor(options) {
    super({}, {});

    this.races = options.races;
    this.genders = options.genders;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "npcGen-image-location-settings",
      classes: ["sheet"],
      template: "modules/npcgen/templates/imageSettings.html",
      resizable: true,
      minimizable: false,
      title: "",
    });
  }

  async getData(options) {
    const data = super.getData(options);

    data.races = this.races;
    data.genders = this.genders;
    data.settings = game.settings.get("npcgen", "imageLocations");

    return data;
  }

  /**
   * @param {JQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".npcGenTextInput").on("change", (ev) => {
      if (ev.originalEvent.isTrusted) return;
      /** @type {HTMLInputElement} */
      const target = ev.target;
      target.value = target.value.replace(/([^/]+$)/, "");
    });

    html.find("button#cancelButton").on("click", () => {
      this.close();
    });
  }

  /**
   * @param {Event} event
   * @param {Object} formData
   */
  async _updateObject(event, formData) {
    game.settings.set("npcgen", "imageLocations", formData);
  }
}
