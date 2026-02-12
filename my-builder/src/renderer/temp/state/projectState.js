import observerModule from "../../../services/observerModule.js";
import fetchData from "../../../services/fetchData.js";
import componentFileService from "../../../services/componentFileService.js";
import componentsData from "../../modules/componentManager/mock/componentMockData.js";
/**
 * component:changed
 * Disparado quando um componente tem seu estado alterado (ativado/desativado), ou quando seu modelo ou versão são modificados.
 *
 * @param {string} type - O tipo de mudança: 'activation', 'deactivation', 'modelChanged', 'versionChanged'.
 * @param {string} id - O ID do componente que foi alterado.
 * @param {string} [key] - A chave que foi alterada (usada para 'modelChanged' e 'versionChanged').
 * @param {string} [value] - O novo valor associado à chave alterada (usado para 'modelChanged' e 'versionChanged').
 */

let DEV_MODE = true; // Variável global para controle do modo de desenvolvimento

class ProjectState {
  #state = {
    "course-name": "",
    "course-time": "",
    "course-encapsulation-class": "",
    colorScheme: {
      "base1-light": "#014ff1",
      "base1-dark": "#013ebc",
      "base2-light": "#338fe5",
      "base2-dark": "#1a76cc",
      "intermediaria1-light": "#00b0c1",
      "intermediaria1-bg-light": "#00dff5",
      "intermediaria1-dark": "#00828f",
      "intermediaria1-bg-dark": "#00b1c2",
      "intermediaria2-light": "#999999",
      "intermediaria2-dark": "#777777",
      "intermediaria2-bg-light": "#e0e0e0",
      "intermediaria2-bg-dark": "#3c3c3c",
      "intermediaria3-light": "#666666",
      "intermediaria3-dark": "#aaaaaa",
      "intermediaria3-bg-light": "#d0d0d0",
      "intermediaria3-bg-dark": "#4c4c4c",
      "active-light": "#0d6efd",
      "active-dark": "#0d6efd",
      "active-hover-light": "#0b5ed7",
      "active-hover-dark": "#0b5ed7",
    },
    assets: {
      images: [],
    },
    components: [],
    /**
     * Lista de parametros de um componente disponível no projeto
     * {
     *   id: string,
     *   name: string,
     *   models: array,
     *   versions: array,
     *   focused: boolean,
     *   isActive: boolean,
     *   selectedModel: string || null,
     *   selectedVersion: string || null,
     *   alias: string,
     * }
     */
    actualMode: "preview",
  };

  constructor() {}

  // =======================
  // Getters
  // =======================

  get() {
    return structuredClone(this.#state);
  }

  #findComponent(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  #findComponentByAlias(alias) {
    return this.#state.components.find((comp) => comp.alias === alias);
  }

  getFocusedComponent() {
    return this.#state.components.find((comp) => comp.focused === true);
  }

  // ============================================
  // NOTIFICAÇÃO UNIFICADA
  // ============================================

  #notify(type, payload = {}) {
    observerModule.sendNotify("state:changed", { type, ...payload });
  }

  // ============================================
  // HANDLERS: COURSE INFO
  // ============================================

  #handleCourseInfoChange({ id, value }) {
    if (this.#state[id] === undefined) return;

    this.#state[id] = value;
    this.#notify("courseInfo:updated", { id, value });
  }

  // ============================================
  // HANDLERS: COLORS
  // ============================================

  #handleColorChange = ({ colorKey, colorValue }) => {
    if (this.#state.colorScheme[colorKey] === undefined) return;

    this.#state.colorScheme[colorKey] = colorValue;
    this.#notify("color:updated", { colorKey, colorValue });
  };

  // ============================================
  // HANDLERS: COMPONENTS
  // ============================================

  #handleComponentActivation = async ({ id, value }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.isActive = value;

    if (component.isActive) {
      console.log("component.isActive", component.isActive);
      // Fetch files from server and create temp files
      const filesData = await fetchData(component);
      const result = await componentFileService.create(component.alias, {
        html: filesData.html,
        css: filesData.css,
        js: filesData.js,
      });

      if (result.success) {
        this.#setFocusedComponent(id);
        this.#notify("component:activated", {
          id,
          alias: component.alias,
          files: {
            html: filesData.html,
            css: filesData.css,
            js: filesData.js,
          },
        });
      }
    } else {
      // Delete temp files
      await componentFileService.delete(component.alias);
      component.focused = false;
      this.#notify("component:deactivated", { id, alias: component.alias });
    }
  };

  #handleComponentFocus = ({ id, value }) => {
    const component = this.#findComponent(id);
    if (!component || !component.isActive) return;

    this.#setFocusedComponent(id);
  };

  #handleModelChange = async ({ id, value: selectedModel }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedModel = selectedModel;

    // Fetch new files and overwrite temp files
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:modelChanged", {
      id,
      alias: component.alias,
      selectedModel,
      files: { html: filesData.html, css: filesData.css, js: filesData.js },
    });
  };

  #handleVersionChange = async ({ id, value: selectedVersion }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedVersion = selectedVersion;

    // Fetch new files and overwrite temp files
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:versionChanged", {
      id,
      alias: component.alias,
      selectedVersion,
      files: { html: filesData.html, css: filesData.css, js: filesData.js },
    });
  };

  #handleComponentEdit = async ({ alias, fileType, content }) => {
    const result = await componentFileService.update(alias, fileType, content);

    if (result.success) {
      // Read updated files to notify
      const filesResult = await componentFileService.read(alias);
      if (filesResult.success && component.isActive) {
        this.#notify("component:edited", {
          alias,
          fileType,
          files: filesResult.files,
        });
      }
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  #setFocusedComponent(id) {
    // Remove focus from all
    this.#state.components.forEach((comp) => {
      comp.focused = false;
    });

    // Set focus on specific component
    const component = this.#findComponent(id);
    if (!component) return;

    component.focused = true;

    // Notify with file data
    componentFileService.read(component.alias).then((result) => {
      if (result.success && component.isActive) {
        this.#notify("component:focused", {
          id,
          alias: component.alias,
          files: result.files,
        });
      }
    });
  }

  #fillStateWithMockData() {
    componentsData.forEach((component) => {
      this.#state.components.push({
        id: component.id,
        name: component.name,
        alias: component.alias,
        models: component.models,
        versions: component.versions,
        focused: component.focused,
        isActive: component.isActive,
        selectedModel: component.selectedModel,
        selectedVersion: component.selectedVersion,
      });
    });
  }

  // ============================================
  // EVENT REGISTRATION
  // ============================================

  #registerEventHandlers() {
    observerModule.subscribeTo(
      "form:inputChanged",
      this.#handleCourseInfoChange,
    );
    observerModule.subscribeTo("color:changed", this.#handleColorChange);
    observerModule.subscribeTo(
      "component:setActivation",
      this.#handleComponentActivation,
    );
    observerModule.subscribeTo(
      "component:setFocus",
      this.#handleComponentFocus,
    );
    observerModule.subscribeTo("component:setModel", this.#handleModelChange);
    observerModule.subscribeTo(
      "component:setVersion",
      this.#handleVersionChange,
    );
    observerModule.subscribeTo("component:edit", this.#handleComponentEdit);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  init() {
    // Desenvolvimento: usa mock local
    if (DEV_MODE) {
      this.#fillStateWithMockData();
    }
    // Produção: busca de API
    else {
      // this.#loadComponentsFromAPI();
    }

    this.#registerEventHandlers();
  }
}

const projectState = new ProjectState();
export default projectState;
