/**
 * ProjectState - Gerenciador de estado e gerador de interface
 * 
 * Esta classe gerencia o estado do projeto e é responsável por:
 * - Armazenar dados do curso, cores, assets e componentes
 * - Gerar dinamicamente a estrutura HTML do formulário
 * - Sincronizar mudanças de estado com o DOM
 * - Coordenar a comunicação entre módulos via observer pattern
 */

class ProjectState {
  // Estado privado do projeto
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
    components: [],
    actualMode: "preview", // edit | preview
  };

  // Configuração das seções do formulário
  #formConfig = {
    sections: [
      {
        id: "general-info",
        title: "1. Informações Gerais",
        type: "text-inputs",
        fields: [
          {
            id: "course-name",
            label: "Nome do Curso",
            type: "text",
            required: true,
            placeholder: "",
          },
          {
            id: "course-time",
            label: "Carga Horária",
            type: "text",
            placeholder: "Ex: 40h",
          },
          {
            id: "course-encapsulation-class",
            label: "Classe de Encapsulamento",
            type: "text",
            placeholder: "Ex: CursoAlunoX",
          },
        ],
      },
      {
        id: "visual-identity",
        title: "2. Identidade Visual",
        type: "color-scheme",
        hint: {
          icon: "info",
          text: "<strong>Interação:</strong> Clique em qualquer cartão para colar o código Hex da sua área de transferência.",
        },
        groups: [
          {
            id: "base",
            title: "Base",
            colors: [
              {
                var: "base1-light",
                label: "Base 1 Light",
                field: "primary-color-light",
                default: "#014ff1",
              },
              {
                var: "base1-dark",
                label: "Base 1 Dark",
                field: "primary-color-dark",
                default: "#013ebc",
              },
              {
                var: "base2-light",
                label: "Base 2 Light",
                field: "secondary-color-light",
                default: "#338fe5",
              },
              {
                var: "base2-dark",
                label: "Base 2 Dark",
                field: "secondary-color-dark",
                default: "#1a76cc",
              },
            ],
          },
          {
            id: "intermediate-1",
            title: "Intermediária 1",
            colors: [
              {
                var: "intermediaria1-light",
                label: "Int 1 Light",
                field: "intermediate-color-1-light",
                default: "#00b0c1",
              },
              {
                var: "intermediaria1-dark",
                label: "Int 1 Dark",
                field: "intermediate-color-1-dark",
                default: "#00828f",
              },
              {
                var: "intermediaria1-background-light",
                label: "Int 1 Bg Light",
                field: "intermediate-color-1-bg-light",
                default: "#00dff5",
              },
              {
                var: "intermediaria1-background-dark",
                label: "Int 1 Bg Dark",
                field: "intermediate-color-1-bg-dark",
                default: "#00b1c2",
              },
            ],
          },
          {
            id: "intermediate-2",
            title: "Intermediária 2",
            colors: [
              {
                var: "intermediaria2-light",
                label: "Int 2 Light",
                field: "intermediate-color-2-light",
                default: "#d0d0d0",
              },
              {
                var: "intermediaria2-dark",
                label: "Int 2 Dark",
                field: "intermediate-color-2-dark",
                default: "#3a3a3a",
              },
              {
                var: "intermediaria2-background-light",
                label: "Int 2 Bg Light",
                field: "intermediate-color-2-bg-light",
                default: "#c5c5c5",
              },
              {
                var: "intermediaria2-background-dark",
                label: "Int 2 Bg Dark",
                field: "intermediate-color-2-bg-dark",
                default: "#404040",
              },
            ],
          },
          {
            id: "intermediate-3",
            title: "Intermediária 3",
            colors: [
              {
                var: "intermediaria3-light",
                label: "Int 3 Light",
                field: "intermediate-color-3-light",
                default: "#b0b0b0",
              },
              {
                var: "intermediaria3-dark",
                label: "Int 3 Dark",
                field: "intermediate-color-3-dark",
                default: "#4d4d4d",
              },
              {
                var: "intermediaria3-background-light",
                label: "Int 3 Bg Light",
                field: "intermediate-color-3-bg-light",
                default: "#a5a5a5",
              },
              {
                var: "intermediaria3-background-dark",
                label: "Int 3 Bg Dark",
                field: "intermediate-color-3-bg-dark",
                default: "#555555",
              },
            ],
          },
          {
            id: "active-states",
            title: "Active & Hover",
            colors: [
              {
                var: "active-light",
                label: "Active Light",
                field: "active-light",
                default: "#007bff",
              },
              {
                var: "active-dark",
                label: "Active Dark",
                field: "active-dark",
                default: "#0056b3",
              },
              {
                var: "active-hover-light",
                label: "Hover Light",
                field: "active-hover-light",
                default: "#0056b3",
              },
              {
                var: "active-hover-dark",
                label: "Hover Dark",
                field: "active-hover-dark",
                default: "#003d82",
              },
            ],
          },
        ],
      },
      {
        id: "assets",
        title: "3. Assets do Projeto",
        type: "file-upload",
        hint: {
          text: "Selecione as imagens dos cards do projeto.",
        },
        uploadZone: {
          id: "cardImages",
          accept: "image/*",
          multiple: true,
          maxFiles: 15,
          icon: "upload",
          label: "Clique para selecionar imagens",
          subLabel: "Máximo 15 imagens",
        },
      },
      {
        id: "components",
        title: "4. Componentes do Projeto",
        type: "component-builder",
        hint: {
          text: "Configure seus componentes aqui.",
        },
        layout: {
          type: "two-panel",
          leftPanel: {
            id: "components-section",
            class: "components-section",
          },
          rightPanel: {
            preview: {
              id: "preview",
              modes: ["light", "dark"],
            },
            codeEditor: {
              tabs: ["html", "css", "js"],
            },
          },
        },
      },
    ],
  };

  constructor() {}

  /**
   * Preenche o estado com dados iniciais (mock ou de API)
   */
  #fillStateWithMockData() {
    if (typeof componentsData !== "undefined") {
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
    }
  }

  /**
   * Retorna uma cópia profunda do estado atual
   */
  get() {
    return structuredClone(this.#state);
  }

  /**
   * ========================================
   * GERADORES DE HTML
   * ========================================
   */

  /**
   * Gera o HTML completo do formulário
   * @returns {string} HTML do formulário
   */
  generateFormHTML() {
    const sectionsHTML = this.#formConfig.sections
      .map((section) => this.#generateSection(section))
      .join("");

    return `
      <form id="project-form">
        ${sectionsHTML}
        <div class="form-actions">
          <button id="btnGerar" type="submit" class="btn-primary">
            Gerar Estrutura
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Gera HTML de uma seção baseada no seu tipo
   */
  #generateSection(section) {
    const generators = {
      "text-inputs": this.#generateTextInputsSection.bind(this),
      "color-scheme": this.#generateColorSchemeSection.bind(this),
      "file-upload": this.#generateFileUploadSection.bind(this),
      "component-builder": this.#generateComponentBuilderSection.bind(this),
    };

    const generator = generators[section.type];
    return generator ? generator(section) : "";
  }

  /**
   * Gera seção de inputs de texto
   */
  #generateTextInputsSection(section) {
    const fieldsHTML = section.fields
      .map(
        (field) => `
      <div class="input-group">
        <label for="${field.id}">${field.label}</label>
        <input 
          type="${field.type}" 
          id="${field.id}" 
          name="${field.id}" 
          data-field="${field.id}"
          ${field.placeholder ? `placeholder="${field.placeholder}"` : ""}
          ${field.required ? "required" : ""}
        />
      </div>
    `,
      )
      .join("");

    return `
      <section class="card">
        <h2>${section.title}</h2>
        <div class="form-grid">
          ${fieldsHTML}
        </div>
      </section>
    `;
  }

  /**
   * Gera seção de esquema de cores
   */
  #generateColorSchemeSection(section) {
    const hintHTML = section.hint
      ? `<p class="hint">${section.hint.text}</p>`
      : "";

    const groupsHTML = section.groups
      .map(
        (group) => `
      <h3>${group.title}</h3>
      <div class="color-grid">
        ${group.colors.map((color) => this.#generateColorCard(color)).join("")}
      </div>
    `,
      )
      .join("");

    return `
      <section class="card">
        <h2>${section.title}</h2>
        ${hintHTML}
        ${groupsHTML}
      </section>
    `;
  }

  /**
   * Gera um card de cor individual
   */
  #generateColorCard(color) {
    const hexValue = this.#state.colorScheme[color.field] || color.default;

    return `
      <div 
        class="color-card" 
        data-var="${color.var}" 
        data-hex="${hexValue}" 
        data-field="${color.field}"
      >
        <div class="color-preview" style="background-color: ${hexValue}"></div>
        <div class="color-details">
          <span class="label">${color.label}</span>
          <span class="hex">${hexValue}</span>
        </div>
      </div>
    `;
  }

  /**
   * Gera seção de upload de arquivos
   */
  #generateFileUploadSection(section) {
    const hintHTML = section.hint
      ? `<p class="hint">${section.hint.text}</p>`
      : "";
    const upload = section.uploadZone;

    const iconSVG = this.#getIconSVG(upload.icon);

    return `
      <section class="card">
        <h2>${section.title}</h2>
        ${hintHTML}
        <div class="upload-zone">
          <label for="${upload.id}">
            ${iconSVG}
            <span>${upload.label}</span>
            <small class="limit-warning">${upload.subLabel}</small>
          </label>
          <input
            type="file"
            id="${upload.id}"
            name="${upload.id}"
            ${upload.multiple ? "multiple" : ""}
            accept="${upload.accept}"
          />
        </div>
        <ul id="file-list" class="file-list"></ul>
      </section>
    `;
  }

  /**
   * Gera seção de construtor de componentes
   */
  #generateComponentBuilderSection(section) {
    const hintHTML = section.hint
      ? `<p class="hint">${section.hint.text}</p>`
      : "";

    return `
      <section class="card">
        <h2>${section.title}</h2>
        ${hintHTML}
        <div class="main-layout">
          <div class="left-panel">
            <div class="${section.layout.leftPanel.class}" id="${section.layout.leftPanel.id}">
              <!-- Componentes serão inseridos dinamicamente aqui -->
            </div>
          </div>
          
          <div class="right-panel">
            ${this.#generatePreviewPanel(section.layout.rightPanel.preview)}
            ${this.#generateCodeEditorPanel(section.layout.rightPanel.codeEditor)}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Gera painel de preview
   */
  #generatePreviewPanel(previewConfig) {
    return `
      <div class="preview" active-context>
        <div class="prev-header">
          <div class="eye-icon" title="Visualizar">
            ${this.#getIconSVG("eye")}
          </div>
          <span>Modo de Visualização</span>
          <button id="light-mode-btn" class="active" type="button">Light</button>
          <button id="dark-mode-btn" type="button">Dark</button>
        </div>
        <div class="prev-body">
          <div id="preview-shadow-host"></div>
        </div>
      </div>
    `;
  }

  /**
   * Gera painel de editor de código
   */
  #generateCodeEditorPanel(editorConfig) {
    const tabsHTML = editorConfig.tabs
      .map(
        (tab, index) => `
      <button 
        class="tab-button ${index === 0 ? "active" : ""}" 
        type="button" 
        data-lang="${tab}"
      >
        ${tab.toUpperCase()}
      </button>
    `,
      )
      .join("");

    return `
      <div class="code-edit">
        <div class="edit-header">
          <span>Modo de Edição</span>
          <div class="save">
            <button type="button" class="save-and-apply">Salvar e Aplicar</button>
          </div>
        </div>
        <div class="edit-tabs">
          ${tabsHTML}
        </div>
        <div class="edit-body">
          <textarea id="code-textarea"></textarea>
        </div>
      </div>
    `;
  }

  /**
   * Retorna SVG de ícones usados na interface
   */
  #getIconSVG(iconName) {
    const icons = {
      upload: `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      `,
      eye: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `,
      info: `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `,
    };

    return icons[iconName] || "";
  }

  /**
   * ========================================
   * MÉTODOS DE ATUALIZAÇÃO DE ESTADO
   * ========================================
   */

  /**
   * Atualiza informações básicas do curso
   */
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

  /**
   * Atualiza uma cor do esquema
   */
  #updateColor(colorKey, colorValue) {
    if (this.#state.colorScheme[colorKey] !== undefined) {
      this.#state.colorScheme[colorKey] = colorValue;
      observerModule.sendNotify("state:changed", {
        type: "colorScheme",
        colorKey,
        colorValue,
      });
      observerModule.sendNotify("shadowDOM:dataChanged", {
        colorKey,
        colorValue,
      });
    }
  }

  /**
   * Recarrega arquivos de um componente
   */
  #reloadComponentFiles = async (componentId) => {
    try {
      const component = this.#find(componentId);
      if (!component) {
        console.warn(
          `[ProjectState] Componente com ID ${componentId} não encontrado.`,
        );
        return;
      }

      const newData = await fetchData(component);
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
        `[ProjectState] Falha ao recarregar arquivos do componente ${componentId}:`,
        error,
      );
    }
  };

  /**
   * Busca um componente pelo ID
   */
  #find(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  /**
   * Atualiza o estado de um componente específico
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
  }

  /**
   * ========================================
   * MÉTODOS PÚBLICOS DE RENDERIZAÇÃO
   * ========================================
   */

  /**
   * Renderiza o formulário completo no container especificado
   * @param {string|HTMLElement} container - Seletor CSS ou elemento DOM
   */
  renderForm(container) {
    const targetElement =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!targetElement) {
      console.error(
        "[ProjectState] Container não encontrado para renderizar o formulário.",
      );
      return;
    }

    targetElement.innerHTML = this.generateFormHTML();
    this.#attachEventListeners();
    console.log("[ProjectState] Formulário renderizado com sucesso.");
  }


  /**
   * Anexa event listeners aos elementos do formulário
   */
  #attachEventListeners() {
    // Inputs de texto
    document.querySelectorAll('input[data-field]').forEach((input) => {
      input.addEventListener("input", (e) => {
        observerModule.sendNotify("form:inputChanged", {
          id: e.target.dataset.field,
          value: e.target.value,
        });
      });
    });

    // Color cards
    document.querySelectorAll(".color-card").forEach((card) => {
      card.addEventListener("click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (/^#[0-9A-F]{6}$/i.test(text)) {
            observerModule.sendNotify("color:changed", {
              colorKey: card.dataset.field,
              colorValue: text,
            });
          }
        } catch (err) {
          console.error("Erro ao ler área de transferência:", err);
        }
      });
    });

    // File upload
    const fileInput = document.querySelector("#cardImages");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        observerModule.sendNotify("assets:filesSelected", {
          files: Array.from(e.target.files),
        });
      });
    }

    // Form submit
    const form = document.querySelector("#project-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        observerModule.sendNotify("form:submitted", this.get());
      });
    }
  }

  /**
   * ========================================
   * INICIALIZAÇÃO E OBSERVADORES
   * ========================================
   */

  /**
   * Inicializa o ProjectState e subscreve aos eventos
   */
  init() {
    console.log("[ProjectState] Inicializando...");
    this.#fillStateWithMockData();

    // Observadores

    // 1) Mudanças nos campos de input de texto
    /*
      observerModule.subscribeTo("form:inputChanged", (data) => {
        this.#updateCourseInfo(data.id, data.value); // Atualiza o estado
        // Não é necessário atualizar o DOM aqui, pois o input já reflete a mudança
    });
    */

    // 2) Mudanças nas cores do esquema
    /*
      observerModule.subscribeTo("color:changed", (data) => {
        this.#updateColor(data.colorKey, data.colorValue); // Atualiza o estado
        // Atualiza o DOM
        this.#updateColorInDOM(data.colorKey, data.colorValue);
      });
    */

    // 3) Mudanças no upload de assets 
    /*
      observerModule.subscribeTo("assets:filesSelected", (data) => {
        this.#updateAssets(data.files); // Atualiza o estado
        // Atualiza o DOM da lista de arquivos
        this.#updateFileListInDOM(data.files);
      });
    */

    // 4) Mudanças nos componentes
    /*
      observerModule.subscribeTo("component:changed", (data) => {
        this.#updateComponentState(data.type, data.id, data.key, data.value); // Atualiza o estado
        // Atualiza o DOM do componente
        this.#updateComponentInDOM(data.id);
      });
    */


    // Subscrições aos eventos
    observerModule.subscribeTo("form:inputChanged", (data) => {
      console.log(`[ProjectState] form:inputChanged`, data);
      this.#updateCourseInfo(data.id, data.value);
    });

    observerModule.subscribeTo("color:changed", (data) => {
      console.log(`[ProjectState] color:changed`, data);
      this.#updateColor(data.colorKey, data.colorValue);
      // Atualiza o DOM
      const card = document.querySelector(
        `[data-field="${data.colorKey}"]`,
      );
      if (card) {
        card.dataset.hex = data.colorValue;
        const preview = card.querySelector(".color-preview");
        const hex = card.querySelector(".hex");
        if (preview) preview.style.backgroundColor = data.colorValue;
        if (hex) hex.textContent = data.colorValue;
      }
    });

    observerModule.subscribeTo("component:changed", (data) => {
      const { type, id, key, value } = data;
      this.#updateComponentState(type, id, key, value);
    });

    console.log("[ProjectState] Pronto para uso.");
  }
}