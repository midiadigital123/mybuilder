import projectState from "../../../temp/state/projectState.js";
import CONSTANTS from "../../../constants/CONSTANTS.js";
import observerModule from "../../../../services/observerModule.js";

class shadowDOM {
  constructor() {}

  /**
   * Insere o shadow DOM no host designado.
   */
  insertShadowDOM() {
    const shadowHost = document.getElementById("preview-shadow-host");
    // Cria o shadow root
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    shadowHost.style.height = "100%";
    // Cria um bloco de estilo no shadow DOM para os temas de cores
    const themeStyles = document.createElement("style");
    themeStyles.id = "theme-styles";
    let cssThemesVariables = ":host{" + CONSTANTS.CSS_VARIABLES;
    +"}";
    themeStyles.textContent = cssThemesVariables;
    shadowRoot.appendChild(themeStyles);

    // Cria um bloco de estilo no shadow DOM para as cores do projeto
    const projectStyles = document.createElement("style");
    projectStyles.id = "project-styles";
    let cssVariables = ":host {";
    for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += "}";
    projectStyles.textContent = cssVariables;
    shadowRoot.appendChild(projectStyles);

    // Adiciona um conteúdo inicial
    const content = document.createElement("div");
    content.className = "preview-content";
    content.style.height = "100%";
    content.setAttribute("data-bs-theme", "light"); // Tema padrão
    content.innerHTML = "" + CONSTANTS.EMPTY_PREVIEW + "";
    shadowRoot.appendChild(content);
    // setThemeMode(shadowRoot);
  }

  updateShadowDOM() {
    observerModule.subscribeTo("state:changed", (data) => {
      console.log("state:changed");
      const shadowHost = document.getElementById("preview-shadow-host");
      const shadowRoot = shadowHost.shadowRoot;

      switch (data.type) {
        // ========== COLORS ==========
        case "color:updated":
          this.updateColors(shadowRoot, data.colorKey, data.colorValue);
          break;

        // ========== COMPONENT ACTIVATED/FOCUSED/CHANGED ==========
        case "component:activated":
        case "component:focused":
        case "component:modelChanged":
        case "component:versionChanged":
        case "component:edited":
          console.log("component activated", data.type);
          this.updatePreview(shadowRoot, data.files);
          break;

        // ========== COMPONENT DEACTIVATED ==========
        case "component:deactivated":
          console.log("component:deactivated");
          this.clearPreview(shadowRoot);
        default:
          break;
      }
    });
  }

  updateColors(shadowRoot, colorKey, colorValue) {
    const style = shadowRoot.querySelector("#project-styles");
    let cssVariables = ":host {";
    for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += "}";
    style.textContent = cssVariables;
  }

  updatePreview(shadowRoot, files) {
    const shadowHost = document.getElementById("preview-shadow-host");
    shadowHost.style.height = "100%";
    const previewContent = shadowRoot.querySelector(".preview-content");
    previewContent.innerHTML = `
    <style>${files.css}</style>
    ${files.html}
    <script>${files.js}<\/script>
  `;
  }

  clearPreview(shadowRoot) {
    console.log("clearPreview");
    const shadowHost = document.getElementById("preview-shadow-host");
    const previewContent = shadowRoot.querySelector(".preview-content");
    shadowHost.style.height = "100%";
    previewContent.innerHTML = CONSTANTS.EMPTY_PREVIEW;
    console.log(previewContent.innerHTML);
  }

  setThemeMode() {
    const shadowHost = document.getElementById("preview-shadow-host");
    const shadowRoot = shadowHost.shadowRoot;
    const previewContent = shadowRoot.querySelector(".preview-content");
    // console.log("Definindo o modo de tema no shadow DOM:", projectState.get().themeMode);
    const lightModeBtn = document.getElementById("light-mode-btn");
    const darkModeBtn = document.getElementById("dark-mode-btn");

    lightModeBtn.addEventListener("click", () => {
      previewContent.setAttribute("data-bs-theme", "light");
      darkModeBtn.classList.remove("active");
      lightModeBtn.classList.add("active");
    });

    darkModeBtn.addEventListener("click", () => {
      previewContent.setAttribute("data-bs-theme", "dark");
      lightModeBtn.classList.remove("active");
      darkModeBtn.classList.add("active");
    });
  }
}

const init = () => {
  // Criar o shadow DOM na inicialização
  const shadowDOMInstance = new shadowDOM();
  //1) Instanciar o ShadowDOM
  //2) Injetar o ShadowDOM na página com os temas claro e escuro e as cores atuais
  //3) Configurar o observador para mudanças de cores

  shadowDOMInstance.insertShadowDOM();
  shadowDOMInstance.setThemeMode();
  shadowDOMInstance.updateShadowDOM();
  // Configurar observador para atualizar o shadow DOM com os dados do componente ativo
  // insertDataIntoShadowDOM();
};

const shadowDOMController = {
  init,
};

export default shadowDOMController;
