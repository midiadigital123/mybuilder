import observerModule from "../../../../services/observerModule.js";
import fetchData from "../../../../services/fetchData.js";

/**
 * component:changed
 * Disparado quando um componente tem seu estado alterado (ativado/desativado), ou quando seu modelo ou versão são modificados.
 *
 * @param {string} type - O tipo de mudança: 'activation', 'deactivation', 'modelChanged', 'versionChanged'.
 * @param {string} id - O ID do componente que foi alterado.
 * @param {string} [key] - A chave que foi alterada (usada para 'modelChanged' e 'versionChanged').
 * @param {string} [value] - O novo valor associado à chave alterada (usado para 'modelChanged' e 'versionChanged').
 */

class ProjectState {
  #state = {
    "course-name": "",
    "course-time": "",
    "course-moodle-id": "",
    "course-moodle-url": "",
    "course-encapsulation-class": "",
    colorScheme: {
      "primary-color-light": "#000000",
      "primary-color-dark": "#000000",
      "secondary-color-light": "#ffffff",
      "secondary-color-dark": "#ffffff",
      "intermediate-color-1-light": "#cccccc",
      "intermediate-color-2-light": "#999999",
      "intermediate-color-3-light": "#666666",
      "intermediate-color-1-bg-light": "#f0f0f0",
      "intermediate-color-2-bg-light": "#e0e0e0",
      "intermediate-color-3-bg-light": "#d0d0d0",
      "intermediate-color-1-dark": "#444444",
      "intermediate-color-2-dark": "#777777",
      "intermediate-color-3-dark": "#aaaaaa",
      "intermediate-color-1-bg-dark": "#2c2c2c",
      "intermediate-color-2-bg-dark": "#3c3c3c",
      "intermediate-color-3-bg-dark": "#4c4c4c",
      "active-light": "#0d6efd",
      "active-dark": "#0d6efd",
      "active-hover-light": "#0b5ed7",
      "active-hover-dark": "#0b5ed7",
    },
    assets: {
      images: [],
      videos: [],
      documents: [],
    },
    components: [
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
       *   html: string,
       *   css: string,
       *   js: string
       * }
       */
    ],
    actualMode: "preview", // edit | preview
  };

  constructor() {}

  get() {
    return structuredClone(this.#state);
  }

  #updateAvailableComponents(
    id,
    name,
    models,
    versions,
    focused,
    isActive,
    selectedModel,
    selectedVersion,
    alias,
    html,
    css,
    js,
  ) {
    if (!this.#state.components.includes(id)) {
      this.#state.components.push({
        id: id,
        name: name,
        models: models,
        versions: versions,
        focused: focused,
        isActive: isActive,
        selectedModel: selectedModel,
        selectedVersion: selectedVersion,
        alias: alias,
        html: html,
        css: css,
        js: js,
      });
      observerModule.sendNotify("state:changed", {
        type: "possibleComponents",
        components: this.#state.components,
      });
    }
  }

  #updateCourseInfo(field, value) {
    if (this.#state[field] !== undefined) {
      this.#state[field] = value;
      observerModule.sendNotify("state:changed", {
        type: "courseInfo",
        field,
        value,
      });
    }
  }

  #updateColor(colorKey, colorValue) {
    if (this.#state.colorScheme[colorKey] !== undefined) {
      this.#state.colorScheme[colorKey] = colorValue;
      observerModule.sendNotify("state:changed", {
        type: "colorScheme",
        colorKey,
        colorValue,
      });
      // Update shadowDOM
      observerModule.sendNotify('shadowDOM:dataChanged', {
        colorKey,
        colorValue
      });
    }
  }

  #updateInitialData(initialData) {
    for (const key of [
      "course-name",
      "course-time",
      "course-moodle-id",
      "course-moodle-url",
      "course-encapsulation-class",
    ]) {
      if (initialData[key] !== undefined) {
        this.#state[key] = initialData[key];
      }
    }

    // Atualiza o esquema de cores
    if (initialData.colorScheme) {
      for (const [colorKey, colorValue] of Object.entries(
        initialData.colorScheme,
      )) {
        if (this.#state.colorScheme[colorKey] !== undefined) {
          this.#state.colorScheme[colorKey] = colorValue;
        }
      }
    }
    observerModule.sendNotify("state:initialized", this.get());
  }

  /**
   * 
   * Toda vez que #reloadComponentFiles é chamado, ele busca os arquivos do componente no backend
   * e atualiza o estado do projeto com os novos conteúdos.
   * 
   * Também dispara notificações específicas para que o shadow DOM e outras partes do sistema
   * possam reagir às mudanças.
   * 
   */
  #reloadComponentFiles = async (componentId) => {
    try {
      const component = this.#find(componentId);
      if (!component) {
        console.warn(
          `[ProjectState] Componente com ID ${componentId} não encontrado para recarregar arquivos.`,
        );
        return;
      }
      const newData = await fetchData(component);

      // Atualiza o estado para cada tipo de arquivo de forma dinâmica
      const fileTypes = ["html", "css", "js"];
      fileTypes.forEach((fileType) => {
        if (newData[fileType] !== undefined) {
          this.#updateComponentState(
            "component:filesLoaded",
            componentId,
            fileType,
            newData[fileType],
          );
        }

      });
    } catch (error) {
      console.error(
        `[ProjectState] Falha ao recarregar arquivos para o componente ${componentId}:`,
        error,
      );
    }
  };

  #updateComponenteTempData(componentName, html, css, js) {
    // if (this.#state.colorScheme[colorKey] !== undefined) {
    //   this.#state.colorScheme[colorKey] = colorValue;
    //   observerModule.sendNotify('state:changed', { type: 'colorScheme', colorKey, colorValue });
    // }
  }

  #updateFocusedComponente() {
    // if (this.#state.colorScheme[colorKey] !== undefined) {
    //   this.#state.colorScheme[colorKey] = colorValue;
    //   observerModule.sendNotify('state:changed', { type: 'colorScheme', colorKey, colorValue });
    // }
  }

  #find(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  /**
   *
   * @param {*} type : string
   * @param {*} id : string
   * @param {*} key : string
   * @param {*} value : any
   */
  #updateComponentState(type, id, key, value) {
    const component = this.#find(id);
    if (!component) return;
    component[key] = value;
    observerModule.sendNotify("state:changed", {
      type: type,
      id: id,
      key: key,
      value: value,
    });
    console.log(this.#state);
  }

  #updateShadowDOMForComponent(id) {

  }

  // #loadComponentFilesToTemp(id) {
  //   window.api.loadComponentFilesToTemp(id);
  // }

  // O método init onde a classe se inscreve para ouvir eventos do MUNDO EXTERNO
  init() {
    console.log("[ProjectState] Inicializando e ouvindo eventos...");

    observerModule.subscribeTo("form:inputChanged", (data) => {
      const { field, value } = data;
      console.log(`[ProjectState] Ouvi 'form:inputChanged':`, data);
      this.#updateCourseInfo(field, value);
    });

    observerModule.subscribeTo("color:changed", (data) => {
      console.log(`[ProjectState] Ouvi 'color:changed':`, data);
      this.#updateColor(data.colorKey, data.colorValue);
    });

    observerModule.subscribeTo("form:initialDataLoaded", (initialData) => {
      console.log(
        "[ProjectState] Recebendo carga inicial de dados:",
        initialData,
      );
      this.#updateInitialData(initialData);
    });

    observerModule.subscribeTo("component:updateInEditMode", (data) => {
      // Servirá para enviar ao backend os arquivos do componente já com a modificação.
      // Depois que o usuário clicou em Salvar(dentro do customizar código), o renderer vai disparar
      // algo como observerModule.sendNotify('component:updateInEditMode', { component: componentName ,html: html, css: css, js: js })
      this.#updateComponenteTempData(
        data.componentName,
        data.html,
        data.css,
        data.js,
      );
    });

    observerModule.subscribeTo("component:setFocus", (data) => {
      // Servirá para enviar ao shadowDom(visualização e edit) a informação de qual componente mostrar.
      this.#updateFocusedComponente();
    });

    observerModule.subscribeTo("component:availableComponentAdded", (data) => {
      const {
        id,
        name,
        models,
        versions,
        focused,
        isActive,
        selectedModel,
        selectedVersion,
        alias,
        html,
        css,
        js,
      } = data;
      // É executado apenas uma vez, na inicialização do sistema.
      // Serve para atualizar a lista de componentes possíveis no estado do projeto
      this.#updateAvailableComponents(
        id,
        name,
        models,
        versions,
        focused,
        isActive,
        selectedModel,
        selectedVersion,
        alias,
        html,
        css,
        js,
      );
    });
    observerModule.subscribeTo("component:changed", (data) => {
      const { type, id, key, value } = data;
      this.#updateComponentState(type, id, key, value);
    });

    observerModule.subscribeTo("state:changed", async (data) => {
      // Para debug
      const { type, id, key, value } = data;

      if (type === "activation" && value === true) {
        await this.#reloadComponentFiles(id);
      }

      if (type === "versionChanged" || type === "modelChanged") {
        await this.#reloadComponentFiles(id);
      }

      // if (type === "component:filesLoaded") {
      //   this.#updateShadowDOMForComponent(id);
      // }
    });

    // Update shadowDOM
    observerModule.subscribeTo('shadowDOM:dataChanged', (data) => {
      
    });

    // ... outras inscrições
  }
}

const projectState = new ProjectState();
export default projectState;
