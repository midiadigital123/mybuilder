import { formConfig } from "../config/interfaceConfig.js";

export const renderForm = (container) => {
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

  targetElement.innerHTML = generateFormHTML();
  console.log("[ProjectState] Formulário renderizado com sucesso.");
};


 /**
   * Gera o HTML completo do formulário
   * @returns {string} HTML do formulário
   */
  const generateFormHTML = () => {
    const sectionsHTML = formConfig.sections
      .map((section) => generateSection(section))
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
  const generateSection = (section) => {
    const generators = {
      "text-inputs": generateTextInputsSection,
      "color-scheme": generateColorSchemeSection,
      "file-upload": generateFileUploadSection,
      "component-builder": generateComponentBuilderSection,
    };

    const generator = generators[section.type];
    return generator ? generator(section) : "";
  }

  /**
   * Gera seção de inputs de texto
   */
  const generateTextInputsSection = (section) => {
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
  const generateColorSchemeSection = (section) => {
    const hintHTML = section.hint
      ? `<p class="hint">${section.hint.text}</p>`
      : "";

    const groupsHTML = section.groups
      .map(
        (group) => `
      <h3>${group.title}</h3>
      <div class="color-grid">
        ${group.colors.map((color) => generateColorCard(color)).join("")}
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
  const generateColorCard = (color) => {
    const hexValue = color.default;

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
  const generateFileUploadSection = (section) => {
    const hintHTML = section.hint
      ? `<p class="hint">${section.hint.text}</p>`
      : "";
    const upload = section.uploadZone;


    return `
      <section class="card">
        <h2>${section.title}</h2>
        ${hintHTML}
        <div class="upload-zone">
          <label for="${upload.id}">
      
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
  const generateComponentBuilderSection = (section) => {
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
            ${generatePreviewPanel(section.layout.rightPanel.preview)}
            ${generateCodeEditorPanel(section.layout.rightPanel.codeEditor)}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Gera painel de preview
   */
  const generatePreviewPanel = (previewConfig) => {
    return `
      <div class="preview" active-context>
        <div class="prev-header">
          <div class="eye-icon" title="Visualizar">
            ${getIconSVG("eye")}
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
  const generateCodeEditorPanel = (editorConfig) => {
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
  const getIconSVG = (iconName) => {
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

  