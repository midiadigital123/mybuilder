import observerModule from "../../../services/observerModule.js";
import fetchData from "../../../services/fetchData.js";
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

class ProjectState {
  #state = {
    "course-name": "",
    "course-time": "",
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

  // Preenche o estado com dados mockados no início do programa
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
        html: component.html,
        css: component.css,
        js: component.js,
      });
    });
    console.log(this.get());
  }

  // Função para retornar uma cópia do estado atual
  get() {
    return structuredClone(this.#state);
  }

  // Método para atualizar os dados básicos do formulário
  // É chamado sempre que o formulário notifica uma mudança
  #updateCourseInfo(id, value) {
    if (this.#state[id] !== undefined) {
      this.#state[id] = value;
      observerModule.sendNotify("state:changed", {
        type: "courseInfo",
        id,
        value,
      });
    }
  }

  // Método para atualizar o esquema de cores
  // É chamado sempre que o seletor de cores notifica uma mudança
  #updateColor(colorKey, colorValue) {
    if (this.#state.colorScheme[colorKey] !== undefined) {
      this.#state.colorScheme[colorKey] = colorValue;
      observerModule.sendNotify("state:changed", {
        type: "colorScheme",
        colorKey,
        colorValue,
      });
      // Update shadowDOM
      observerModule.sendNotify("shadowDOM:dataChanged", {
        colorKey,
        colorValue,
      });
    }
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

  #reloadComponentFiles = async (componentId, value) => {
    console.log(
      "[ProjectState] Recarregando arquivos para o componente:",
      componentId,
    );
    if (value === false) {
      // Se o componente foi desativado, limpamos os arquivos do estado e notificamos o shadow DOM para limpar a visualização.
      this.#updateComponentState(
        "component:filesLoaded",
        componentId,
        "html",
        "",
      );
      observerModule.sendNotify("shadowDOM:componentDataChanged", {
        componentId,
        value: false,
      });
      return;
    }
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
      observerModule.sendNotify("shadowDOM:componentDataChanged", {
        componentId,
        html: newData.html,
        css: newData.css,
        js: newData.js,
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

  #updateComponentState(type, id, key, value) {
    console.log(type, id, key, value);
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

  #updateData() {}

  #updateShadowDOMForComponent(id) {}

  // #loadComponentFilesToTemp(id) {
  //   window.api.loadComponentFilesToTemp(id);
  // }

  // O método init onde a classe se inscreve para ouvir eventos do MUNDO EXTERNO
  init() {
    // console.log("[ProjectState] Inicializando e ouvindo eventos...");
    // Preencher state com dados mockados
    this.#fillStateWithMockData();

    observerModule.subscribeTo("form:inputChanged", (data) => {
      const { id, value } = data;
      console.log(`[ProjectState] Ouvi 'form:inputChanged':`, data);
      this.#updateCourseInfo(id, value);
    });

    observerModule.subscribeTo("color:changed", (data) => {
      console.log(`[ProjectState] Ouvi 'color:changed':`, data);
      this.#updateColor(data.colorKey, data.colorValue);
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

    observerModule.subscribeTo("component:changed", (data) => {
      const { type, id, key, value } = data;
      this.#updateComponentState(type, id, key, value);
      if (
        type === "modelChanged" ||
        type === "versionChanged" ||
        type === "activation"
      ) {
        this.#reloadComponentFiles(id, value);
      }
    });

    // ... outras inscrições
  }
}

const projectState = new ProjectState();
export default projectState;
