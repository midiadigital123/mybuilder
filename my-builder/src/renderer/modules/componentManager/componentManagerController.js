import {CONSTANTS} from '../../constants/CONSTANTS.js';

const controlActiveComponent = () => {
// Seleciona o switch e a caixa

let components = document.getElementById('components-section');
let componentesBox = Array.from(components.querySelectorAll('.component-box'));

componentesBox.forEach(box => {
  console.log(box)
  const toggle = box.querySelector('.component-toggle');
  // Escuta o clique no switch
  toggle.addEventListener('change', function() {
      if (this.checked) {
          box.classList.add('active'); // Adiciona classe para abrir
          // Adiciona false aos outros componentes
          componentesBox.forEach(otherBox => {
              if (otherBox !== box) {
                  otherBox.setAttribute('active-view', 'false');
              }
          });
          box.setAttribute('active-view', 'true');
          // insertDataIntoShadowDOM(box);
      } else {
          box.classList.remove('active'); // Remove classe para fechar
          box.setAttribute('active-view', 'false');
     
      }
  });
});
};

const controlClickToActivateEye = () => {
  let components = document.getElementById('components-section');
  const allEyes = components.querySelectorAll('.eye-icon');

  allEyes.forEach(eye => {
    eye.addEventListener('click', () => {
      
      const closestBox = eye.closest('.component-box');
      closestBox.setAttribute('active-view', 'true');
      const allBoxes = Array.from(components.querySelectorAll('.component-box'));
      allBoxes.forEach(box => {
        if (box !== closestBox) {
          box.setAttribute('active-view', 'false');
        }
      });
    });
  });

}

const fetchData = async (target) => {
  const componentType = target.getAttribute('data-comp');
  const componentModel = target.querySelector('.option-group .model').value;
  const componentVersion = target.querySelector('.option-group .version').value;
  console.log("Modelo:", componentModel, "Versão:", componentVersion)
  console.log(tempObject)

  const fileUrl = `https://recursos-moodle.caeddigital.net/projetos/componentes/2026/${componentType}/${componentModel}${componentVersion}/index.html`; 
      
      const [htmlFileUrl, cssFileUrl, jsFileUrl] = [
        `https://recursos-moodle.caeddigital.net/projetos/componentes/2026/${componentType}/${componentModel}${componentVersion}/index.html`,
        `https://recursos-moodle.caeddigital.net/projetos/componentes/2026/${componentType}/${componentModel}${componentVersion}/style.css`,
        `https://recursos-moodle.caeddigital.net/projetos/componentes/2026/${componentType}/${componentModel}${componentVersion}/script.js`
      ];

      console.log("URLs:", htmlFileUrl, cssFileUrl, jsFileUrl)

      // Função para buscar um arquivo via API
      const fetchFile = async (url) => {
        try {
          const response = await window.api.getFileAtServer(url);
          return response;
        } catch (error) {
          console.error(`Erro ao buscar o arquivo em ${url}:`, error);
          return '';
        }
      };
      
      try {
        const [htmlContent, cssContent, jsContent] = await Promise.all([
          fetchFile(htmlFileUrl),
          fetchFile(cssFileUrl),
          fetchFile(jsFileUrl)
        ]);

        // Atualiza o objeto tempObject.components com os conteúdos obtidos
        tempObject.components[componentType] = {
          enabled: true,
          model: componentModel,
          version: componentVersion,
          html: htmlContent,
          css: cssContent,
          js: jsContent
        };
        console.log(tempObject);
        // Aqui você pode fazer algo com o conteúdo retornado, como exibir em um modal
      } catch (error) {
        console.error('Erro ao buscar os arquivos do componente:', error);
      }

};

const setThemeMode = (prevShadow) => {
const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
lightModeBtn.addEventListener('click', (e) => {
  console.log(prevShadow)
  let previewContent = prevShadow.querySelector('.preview-content');
  previewContent.setAttribute('data-bs-theme', 'light');
  e.target.classList.add('active');
  darkModeBtn.classList.remove('active');
});
darkModeBtn.addEventListener('click', () => {
  let previewContent = prevShadow.querySelector('.preview-content');
  previewContent.setAttribute('data-bs-theme', 'dark');
  darkModeBtn.classList.add('active');
  lightModeBtn.classList.remove('active');
});
}
const insertShadowDOM = () => {
  const shadowHost = document.getElementById('preview-shadow-host');
  // Cria o shadow root
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const updateColorsInShadowDOM = () => {
    console.log("asdasd")
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

  // Atualiza o preview inicialmente
  // updatePreview();

  // Você pode chamar updatePreview() sempre que tempObject for atualizado
}

// Como muito depende de qual olho está ativo, vou criar um listener para isso


const controlSectionComponents = () => {
  insertShadowDOM(); // Primeira coisa é inserir o ambiente para o shadow DOM [:OK]
  controlActiveComponent();
  controlClickToActivateEye();
  insertDataIntoShadowDOM();
}

controlSectionComponents();

handleEditMode(tempObject);
handlePreviewMode(tempObject);


// document.getElementById('project-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

    // // 1. Pega os dados de texto (como string)
    // const dadosTexto = {}; // (Você preencheria isso com os valores dos inputs textuais)

    // // 2. Envia os dados textuais para criar a pasta
    // await window.api.gerarEstrutura(dadosTexto); 

    // // 3. Pega as imagens e envia
    // const imageInput = document.getElementById('cardImages');
    // await fazerUploadDosAssets(imageInput);
// });