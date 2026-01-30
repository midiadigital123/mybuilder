

const insertShadowDOM = () => {
  const shadowHost = document.getElementById('preview-shadow-host');
  // Cria o shadow root
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const updateColorsInShadowDOM = () => {
    
    // Atualiza as cores no shadow DOM
    const style = shadowRoot.querySelector('style');
    let cssVariables = ':host {';
    for (const [key, value] of Object.entries(tempObject.colorScheme)) {
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += '}';
    cssVariables += CONSTANTS.CSS_VARIABLES;

    style.textContent = cssVariables;
  };

  // Monitora mudanças no tempObject.colorScheme para atualizar as cores no shadow DOM
  const colorSchemeProxy = new Proxy(tempObject.colorScheme, {
    set(target, property, value) {
      target[property] = value;
      updateColorsInShadowDOM();
      return true;
    }
  });

  tempObject.colorScheme = colorSchemeProxy;

  // Cria um estilo para as cores do tema
    const style = document.createElement('style');
    let cssVariables = ':host {';
    for (const [key, value] of Object.entries(tempObject.colorScheme)) {
      cssVariables += `--${key}: ${value};`;
    }
    cssVariables += '}';
    cssVariables += CONSTANTS.CSS_VARIABLES;

    style.textContent = cssVariables;
    //console.log(cssVariables)
  shadowRoot.appendChild(style);

  // Adiciona um conteúdo inicial
  const content = document.createElement('div');
  content.className = 'preview-content';
  content.style.height = '100%';
  content.setAttribute('data-bs-theme', 'light'); // Tema padrão
  content.innerHTML = 
  shadowRoot.appendChild(content);
  setThemeMode(shadowRoot);
};

const insertDataIntoShadowDOM = () => {
  // Os dados que aparecem no shadow DOM dependem do componente ativo (olho ativo)
  const shadowHost = document.getElementById('preview-shadow-host');
  shadowHost.style.height = '100%';
  const shadowRoot = shadowHost.shadowRoot;

  // Monitora a mudança no atributo active-view dos component-box
  const targets = document.querySelectorAll('.component-box');

  const  observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.attributeName === 'active-view') {
        if (mutation.target.getAttribute('active-view') === 'true') {
          //console.log('O olho foi ativado para:', mutation.target);
           updatePreview(mutation.target);
        } else {
          updatePreview(mutation.target);
        }
       
      }
    }
  });

  targets.forEach(target => {
    observer.observe(target, { attributes: true });
  });


  const updatePreview =  async (target) => {
    //console.log("entrouu");

    if (!target) return;
    if (target.getAttribute('active-view') === 'false') {
      // Limpa o preview
      const previewContent = shadowRoot.querySelector('.preview-content');
      previewContent.innerHTML = CONSTANTS.EMPTY_PREVIEW;
    
      shadowRoot.appendChild(previewContent);
      return;
    }
    const componentType = target.getAttribute('data-comp');
    if (!componentType) return;
    //console.log("Componente ativo para preview:", componentType)
    await fetchData(target);
    // Limpa o conteúdo anterior
    // Cria o conteúdo HTML do preview
    const previewContent = shadowRoot.querySelector('.preview-content');
    previewContent.innerHTML = `
    <style>${tempObject.components[componentType].css}</style>
    ${tempObject.components[componentType].html}
    <script>${tempObject.components[componentType].js}<\/script>
    `;

    shadowRoot.appendChild(previewContent);
  };
};


const init = () => {
  // Criar o shadow DOM na inicialização
  insertShadowDOM();
  // Configurar observador para atualizar o shadow DOM com os dados do componente ativo
  insertDataIntoShadowDOM();
};

const shadowDOMController = {
  init,
};

export default shadowDOMController;