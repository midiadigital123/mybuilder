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
    // console.log(this.get());
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
      observerModule.sendNotify("shadowDOM:color:changed", {
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

 

  #fetchComponentFiles = async (componentId, value) => {
    if (value == false) {
      this.#updateComponentState(
            "component:cleanFiles",
            componentId,
            "html", "",
          );
      this.#updateComponentState(
            "component:cleanFiles",
            componentId,
            "css",
            "",
          );
      this.#updateComponentState(
            "component:cleanFiles",
            componentId,
            "js",
            "",
          );
    }
    // console.log(
    //   "[ProjectState] Buscando arquivos para o componente:",
    //   componentId,
    // );
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

  #updateFocusedComponente(componentId, value) {
    // Pega todos os componentes
    const allComponents = this.#state.components;
    // Define focused como false para todos
    allComponents.forEach((comp) => {
      comp.focused = false;
    });

    // Define focused como true para o componente específico
    const component = this.#find(componentId);
    if (!component) return;
    component.focused = value;
    observerModule.sendNotify("shadowDOM:updatePreview", {
      componentId: componentId,
      html: component.html,
      css: component.css,
      js: component.js,
    });
  }

  #find(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  #updateComponentState(type, id, key, value) {
    // console.log(type, id, key, value);
    const component = this.#find(id);
    if (!component) return;
    component[key] = value;
    observerModule.sendNotify("state:changed", {
      type: type,
      id: id,
      key: key,
      value: value,
    });
    // console.log(this.#state);
  }

  #updateData() {}

  #updateShadowDOMForComponent(id) {}

  // #loadComponentFilesToTemp(id) {
  //   window.api.loadComponentFilesToTemp(id);
  // }

  #getContentFiles(id) {
    const component = this.#find(id);
    if (!component) return;
    return {
      html: component.html,
      css: component.css,
      js: component.js,
    };
  }

  // O método init onde a classe se inscreve para ouvir eventos do MUNDO EXTERNO
  init() {
    // console.log("[ProjectState] Inicializando e ouvindo eventos...");

    /**
     * Preenche o estado com dados mockados no início do programa
     */
    this.#fillStateWithMockData();

    /**
     * Ouve mudanças nos inputs do formulário principal
     */
    observerModule.subscribeTo("form:inputChanged", (data) => {
      const { id, value } = data;
      // console.log(`[ProjectState] Ouvi 'form:inputChanged':`, data);
      this.#updateCourseInfo(id, value);
    });

    /**
     * Ouve mudanças nas cores do tema
     */
    observerModule.subscribeTo("color:changed", (data) => {
      // console.log(`[ProjectState] Ouvi 'color:changed':`, data);
      this.#updateColor(data.colorKey, data.colorValue);
      // Atualiza o shadow DOM com as novas cores
      // TODO: Colocar aqui o update do shadow DOM.
      // FIXME:
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


    // observerModule.subscribeTo("component:changed", (data) => {
    //   const { type, id, key, value } = data;
    //   this.#updateComponentState(type, id, key, value);
    //   if (
    //     type === "modelChanged" ||
    //     type === "versionChanged" ||
    //     type === "activation"
    //   ) {
    //     this.#reloadComponentFiles(id, value);
    //   }

    //   if (type === "focused") {
    //     this.#updateFocusedComponente(id, value);
    //   }
    // });

    /**
     * Na ativação do componente preciso:
     * 1) atualizar o estado isActive do componente
     * 2) atualizar o estado focused do componente
     * 3) buscar os arquivos da versão ativa 
     * e carregá-los no shadowDOM.
     * 
     * No setFocus apenas atualizo o shadowDOM com o conteúdo do componente focado.
     * 
     * Na mudança de modelo ou versão, preciso buscar os arquivos correspondentes
     * e atualizar o shadowDOM.
     */

    observerModule.subscribeTo("component:setActivation", async (data) => {
      // console.log("setActivation")
      // Atualiza o estado isActive do componente
      this.#updateComponentState(
        "setActivation",
        data.id,
        "isActive",
        data.value,
      );

      // console.log(data.id, data.value)
      // Atualiza o state com os arquivos do componente
      await this.#fetchComponentFiles(data.id, data.value);
      if (data.value === false) {
        observerModule.sendNotify("shadowDOM:cleanPreview", {});
      } else {
        // console.log("caiu aquii!!")
        this.#updateFocusedComponente(data.id, data.value);
      }
    });

    observerModule.subscribeTo("component:setFocus", (data) => {
      // console.log("setFocus")
      this.#updateComponentState(
        "setFocus",
        data.id,
        "focused",
        data.value,
      );
      this.#updateFocusedComponente(data.id, data.value);
    });

    observerModule.subscribeTo("component:setModel", async (data) => {
      // console.log("setModel")
      // Atualiza o estado focused do componente
      this.#updateComponentState(
        "setModel",
        data.id,
        "selectedModel",
        data.value,
      );

      // Atualiza o state com os arquivos do componente
      await this.#fetchComponentFiles(data.id, data.value);
      
    });

    observerModule.subscribeTo("component:setVersion", async (data) => {
      //  console.log("setVersion")
      // Atualiza o estado focused do componente
      this.#updateComponentState(
        "setVersion",
        data.id,
        "selectedVersion",
        data.value,
      );

      // Atualiza o state com os arquivos do componente
      await this.#fetchComponentFiles(data.id, data.value);
      
      });
     

    // ... outras inscrições
  }
}

const projectState = new ProjectState();
export default projectState;
