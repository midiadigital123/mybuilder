import projectState from "../../../temp/state/projectState.js";
import CONSTANTS from "../../../constants/CONSTANTS.js";
import observerModule from "../../../../services/observerModule.js";

const insertShadowDOM = () => {
  const shadowHost = document.getElementById("preview-shadow-host");
  // Cria o shadow root
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  console.log(projectState.get().colorScheme);
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

  // Cria um estilo para as cores do tema
  const style = document.createElement("style");
  let cssVariables = ":host {";
  for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
    cssVariables += `--${key}: ${value};`;
  }
  cssVariables += "}";
  cssVariables += CONSTANTS.CSS_VARIABLES;

  style.textContent = cssVariables;
  //console.log(cssVariables)
  shadowRoot.appendChild(style);

  // Adiciona um conteúdo inicial
  const content = document.createElement("div");
  content.className = "preview-content";
  content.style.height = "100%";
  content.setAttribute("data-bs-theme", "light"); // Tema padrão
  content.innerHTML = "" + CONSTANTS.EMPTY_PREVIEW + "";
  shadowRoot.appendChild(content);
  // setThemeMode(shadowRoot);
};

const updateShadowDOM = () => {
  observerModule.subscribeTo("shadowDOM:componentDataChanged", (data) => {
    console.log(
      "Dados do componente mudaram, atualizar o shadow DOM se necessário.",
      data,
    );
    // Lógica para atualizar o shadow DOM com os novos dados do componente
    const shadowHost = document.getElementById("preview-shadow-host");
    shadowHost.style.height = "100%";
    const shadowRoot = shadowHost.shadowRoot;
    const previewContent = shadowRoot.querySelector(".preview-content");
    if (data.value === false) {
      previewContent.innerHTML = "" + CONSTANTS.EMPTY_PREVIEW + "";
       shadowRoot.appendChild(previewContent);
      return;
    }
    previewContent.innerHTML = `
    <style>${data.css}</style>
    ${data.html}
    <script>${data.js}<\/script>
    `;

    shadowRoot.appendChild(previewContent);
  });
};

const init = () => {
  // Criar o shadow DOM na inicialização
  insertShadowDOM();
  updateShadowDOM();
  // Configurar observador para atualizar o shadow DOM com os dados do componente ativo
  // insertDataIntoShadowDOM();
};

const shadowDOMController = {
  init,
};

export default shadowDOMController;
