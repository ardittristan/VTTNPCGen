export default class GeneratorWindow extends FormApplication {
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
      height: 600,
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
    html.find('.header-button[name="classesJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "classesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/classes.json");
      this.resetHidden(html, "classesJSON");
      this.setTitle(game.i18n.localize("npcGen.classes"));
    });
    html.find('.header-button[name="languagesJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "languagesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/languages.json");
      this.resetHidden(html, "languagesJSON");
      this.setTitle(game.i18n.localize("npcGen.language"));
    });
    html.find('.header-button[name="namesJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "namesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/names.json");
      this.resetHidden(html, "namesJSON");
      this.setTitle(game.i18n.localize("npcGen.names"));
    });
    html.find('.header-button[name="traitsJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "traitsJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/personalitytraits.json");
      this.resetHidden(html, "traitsJSON");
      this.setTitle(game.i18n.localize("npcGen.traits"));
    });
    html.find('.header-button[name="plothooksJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "plothooksJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/plothooks.json");
      this.resetHidden(html, "plothooksJSON");
      this.setTitle(game.i18n.localize("npcGen.plotHook"));
    });
    html.find('.header-button[name="professionJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "professionJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/professions.json");
      this.resetHidden(html, "professionJSON");
      this.setTitle(game.i18n.localize("npcGen.professions"));
    });
    html.find('.header-button[name="racesJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "racesJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/races.json");
      this.resetHidden(html, "racesJSON");
      this.setTitle(game.i18n.localize("npcGen.races"));
    });
    html.find('.header-button[name="sexJSON"]').on("click", (e) => {
      e.preventDefault();
      this.checkPopup(html, "sexJSON", "https://github.com/ardittristan/VTTNPCGen/blob/master/data/sex.json");
      this.resetHidden(html, "sexJSON");
      this.setTitle(game.i18n.localize("npcGen.relationship"));
    });

    // bottom button row
    html.find("button.toggle-button").on("click", (event) => {
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

    html.find("button.save-json-button").on("click", () => {
      this.sendToSettings();
    });
    html.find("button.reset-current-json").on("click", () => {
      this.resetSettings(html);
    });
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
    html.find('.header-button[name="classesJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="classesJSON"]').css("display", "none");

    html.find('.editor[id="languagesJSON"]').css("display", "none");
    html.find('.header-button[name="languagesJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="languagesJSON"]').css("display", "none");

    html.find('.editor[id="namesJSON"]').css("display", "none");
    html.find('.header-button[name="namesJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="namesJSON"]').css("display", "none");

    html.find('.editor[id="traitsJSON"]').css("display", "none");
    html.find('.header-button[name="traitsJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="traitsJSON"]').css("display", "none");

    html.find('.editor[id="plothooksJSON"]').css("display", "none");
    html.find('.header-button[name="plothooksJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="plothooksJSON"]').css("display", "none");

    html.find('.editor[id="professionJSON"]').css("display", "none");
    html.find('.header-button[name="professionJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="professionJSON"]').css("display", "none");

    html.find('.editor[id="racesJSON"]').css("display", "none");
    html.find('.header-button[name="racesJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="racesJSON"]').css("display", "none");

    html.find('.editor[id="sexJSON"]').css("display", "none");
    html.find('.header-button[name="sexJSON"]').css({ outline: "unset", "box-shadow": "unset" });
    html.find('.toggle-button[id="sexJSON"]').css("display", "none");

    html.find(`.editor[id="${visibleEditor}"]`).css("display", "block");
    html.find(`.header-button[name="${visibleEditor}"]`).css({ outline: "none", "box-shadow": "0 0 5px red" });
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
    jQuery("#json-editor-menu header.window-header.flexrow.draggable.resizable h4.window-title")[0].textContent = title;
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
        onclick: (ev) => {
          if (this.unsaved) {
            Dialog.confirm({
              title: game.i18n.localize("npcGen.confirmCloseTitle"),
              content: `<p>${game.i18n.localize("npcGen.confirmCloseDesc")}</p>`,
              yes: () => {
                jQuery("#json-editor.json-code-editor button.save-json-button").trigger("click");
                setTimeout(() => {
                  this.close();
                }, 50);
              },
              no: () => this.close(),
              defaultYes: false,
            });
          } else {
            this.close();
          }
        },
      },
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
    ui.notifications.notify("Saved!");
    this.unsaved = false;
  }

  createEditor(name) {
    this.editorArray[name] = ace.edit(name);
    this.editorArray[name].setOptions({
      mode: "ace/mode/json",
      theme: "ace/theme/twilight",
      showPrintMargin: false,
      enableLiveAutocompletion: true,
    });
    this.editorArray[name].setValue(game.settings.get("npcgen", name), -1);
    this.editorArray[name].commands.addCommand({
      name: "Save",
      bindKey: { win: "Ctrl-S", mac: "Command-S" },
      exec: this.sendToSettings,
    });
    this.editorArray[name].getSession().on("change", () => {
      if (this.unsaved === false) {
        this.unsaved = true;
      }
    });
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
    html.find(".editor").each(function (_index, element) {
      if (element.style.display === "block") {
        let defaultVal = game.settings.settings.get(`npcgen.${element.id}`).default;
        _this.editorArray[element.id].setValue(defaultVal, -1);
      }
    });
  }
}

/**
 * @param  {String} string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
