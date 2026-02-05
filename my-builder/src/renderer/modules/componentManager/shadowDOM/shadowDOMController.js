import projectState from "../../../temp/state/projectState.js";
import CONSTANTS from "../../../constants/CONSTANTS.js";
import observerModule from "../../../../services/observerModule.js";

class shadowDOM {
  constructor() {}

  /**
   * Insere o shadow DOM no host designado.
   */
  insertShadowDOM ()  {
  const shadowHost = document.getElementById("preview-shadow-host");
  // Cria o shadow root
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  shadowHost.style.height = "100%";
  // console.log(projectState.get().colorScheme);
  /*const updateColorsInShadowDOM = () => {
    // Atualiza as cores no shadow DOM
    const style = shadowRoot.querySelector('style');
    let cssVariables = ':host {';
    for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
  
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += '}';
    cssVariables += CONSTANTS.CSS_VARIABLES;

    style.textContent = cssVariables;
  };*/

  // Cria um bloco de estilo no shadow DOM para os temas de cores
  const themeStyles = document.createElement("style");
  themeStyles.id = "theme-styles";
  let cssThemesVariables = ":host{" + CONSTANTS.CSS_VARIABLES; + "}";
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
};

  /**
   * Atualiza o shadow DOM com os dados do componente ativo.
   */
  updateShadowDOM() {
  observerModule.subscribeTo("shadowDOM:color:changed", (data) => {
    // console.log("shadowDOM:color:changed recebido no shadowDOMController:", data);
    const shadowHost = document.getElementById("preview-shadow-host");
    const shadowRoot = shadowHost.shadowRoot;
    const style = shadowRoot.querySelector("#project-styles");
    let cssVariables = ":host {";
    for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += "}";
    style.textContent = cssVariables;
  });

  observerModule.subscribeTo("shadowDOM:cleanPreview", (data) => {
    // console.log(
    //   "Componente desativado, limpando o shadow DOM.",
    //   data,
    // );
    // Lógica para limpar o shadow DOM quando o componente é desativado
    const shadowHost = document.getElementById("preview-shadow-host");
    shadowHost.style.height = "100%";
    const shadowRoot = shadowHost.shadowRoot;
    const previewContent = shadowRoot.querySelector(".preview-content");
    previewContent.innerHTML = "" + CONSTANTS.EMPTY_PREVIEW + "";
    shadowRoot.appendChild(previewContent);
  });
  
    observerModule.subscribeTo("shadowDOM:updatePreview", (data) => {
    // console.log(
    //   "Dados do componente mudaram, atualizar o shadow DOM se necessário.",
    //   data,
    // );
    // Lógica para atualizar o shadow DOM com os novos dados do componente
    const shadowHost = document.getElementById("preview-shadow-host");
    shadowHost.style.height = "100%";
    const shadowRoot = shadowHost.shadowRoot;
    const previewContent = shadowRoot.querySelector(".preview-content");
    previewContent.innerHTML = `
    <style>${data.css}</style>
    ${data.html}
    <script>${data.js}<\/script>
    `;
    shadowRoot.appendChild(previewContent);
  });
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
