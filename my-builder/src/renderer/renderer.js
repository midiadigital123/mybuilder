/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */



console.log(
  '👋 This message is being logged by "renderer.js", included via Vite',
);

const tempObject = {
  'course-name': '',
  'course-time': '',
  'course-moodle-id': '',
  'course-moodle-url': '',
  'course-encapsulation-class': '',
  colorScheme: {},
  assets: {
    logo: '',
    banner: '',
    background: '',
  },
  components: {
    destaque: {
      enabled: false,
      model: '',
      version: '',
      html: '',
      css: '',
      js: ''
    },
  }
};

const fillTempObjectBasicInfo = () => {
  tempObject['course-name'] = document.getElementById('courseName').value;
  tempObject['course-time'] = document.getElementById('courseWorkload').value;
  tempObject['course-moodle-id'] = document.getElementById('moodleId').value;
  tempObject['course-moodle-url'] = document.getElementById('moodleUrl').value;
  tempObject['course-encapsulation-class'] = document.getElementById('encapsulateClass').value;
  let colors = document.querySelectorAll('.color-card');
  colors.forEach(card => {
    const colorKey = card.getAttribute('data-var');
    const colorValue = card.querySelector('.hex').textContent;
    tempObject.colorScheme[colorKey] = colorValue;
  });
  // console.log(tempObject)
};

fillTempObjectBasicInfo();

// monitora os inputs de texto para atualizar o tempObject
const monitorTextInputs = () => {
  const textInputs = document.querySelectorAll('#project-form input');
  textInputs.forEach(input => {
    input.addEventListener('input', () => {
      fillTempObjectBasicInfo();
    });
  });
};

monitorTextInputs();


const pasteColors = () => {
  const putInSpanHex = (currentCard, text) => {
  if (!currentCard) return;
  const spanHex = currentCard.querySelector('.hex');
  spanHex.textContent = text;
}

const normalizeHex = (text) => {
  // Normaliza o texto para o formato hexadecimal
  if (!text) return '#000000';
  if (!text.startsWith('#')) {
    text = `#${text}`;
  }
  if (text.length > 7) {
    text = text.substring(0, 7);
  }
  return text;
}

const updateColorPreview = (currentCard, color) => {
  // Atualiza a cor de fundo do card
  if (!currentCard) return;
  const preview = currentCard.querySelector('.color-preview');
  preview.style.backgroundColor = color;
  // Atualiza a cor no objeto tempObject
  const colorKey = currentCard.getAttribute('data-var');
  tempObject.colorScheme[colorKey] = color;
}

const verifyIfValidColor = (color) => {
  // Verifica se a cor é válida (um hex válido)
  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
  console.log(color)
  if (!isValidHex) {
    alert('O texto copiado não é uma cor hexadecimal válida!');
    return false;
  }
  return true;
}

  // Lista os cards de cores que podem ser clicados
  const cards = document.querySelectorAll('.color-card');
  
  cards.forEach(card => { // Itera sobre cada card 
    card.addEventListener('click', async () => {
      window.api.getClipboardText() // Chama a função exposta no preload.js e espera o resultado vindo de main.js
        .then(text => {
          let color = normalizeHex(text);
          if (verifyIfValidColor(color)){
          putInSpanHex(card, color);
          updateColorPreview(card, color);
          } 
      })
        .catch(err => {
        console.error('Erro ao obter o texto da área de transferência:', err);
      });
    }
    );
  });
}

pasteColors();

async function fazerUploadDosAssets(inputElement) {
  const arquivos = Array.from(inputElement.files);

  if (arquivos.length === 0) return;

  // Feedback visual ao usuário
  const btnGerar = document.getElementById('btnGerar');
  btnGerar.disabled = true; // Desabilita o botão durante o upload
  btnGerar.textContent = 'Fazendo upload dos assets...';

  // Processamos todos os arquivos selecionados
  // Promise.all espera todos terminarem antes de avisar que terminou

  await Promise.all(arquivos.map(async (arquivo) => {

    // 1. Ler o conteúdo do arquivo como um buffer

    const arrayBuffer = await arquivo.arrayBuffer();

    // 2. Converte para Uint8Array (Formato que o Node.js entende via IPC)
    const uint8Array = new Uint8Array(arrayBuffer);

    // 3. Envia para main.js via preload.js

    await window.api.salvarArquivo(arquivo.name, uint8Array);
    console.log(`Arquivo ${arquivo.name} enviado`)
  }))
  // Restaura o estado do botão
  btnGerar.disabled = false;
  btnGerar.textContent = 'Gerar Estrutura';

}

const handleUploadDosAssets = () => {
  // Seletores
const fileInput = document.getElementById('cardImages');
const fileListElement = document.getElementById('file-list');

// Evento: Quando o usuário seleciona arquivos
fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    
    // 1. Limpa a lista anterior
    fileListElement.innerHTML = '';

    // 2. Itera sobre os arquivos
    Array.from(files).forEach((file, index) => {
        // Verifica se é uma imagem (para gerar preview)
        const isImage = file.type.startsWith('image/');
        let thumbnail = '';

        if (isImage) {
            // Cria uma URL temporária para a imagem na memória (blob)
            const blobUrl = URL.createObjectURL(file);
            // adiciona a url no objeto tempObject.assets
            tempObject.assets[`image_${index}`] = blobUrl;
            
            thumbnail = `<img src="${blobUrl}" alt="Preview" class="file-thumbnail">`;
        } else {
            thumbnail = `<div class="file-icon">📄</div>`;
        }

        // Cria o elemento HTML da lista
        const li = document.createElement('li');
        li.className = 'file-item'; // Classe para estilizar
        
        // Insere o HTML dentro do LI
        li.innerHTML = `
            <div class="file-content">
           
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${formatBytes(file.size)} • ${file.type || 'Desconhecido'}</div>
                </div>
            </div>
        `;

        // Adiciona na tela
        fileListElement.appendChild(li);
    });

    // Feedback visual na área de upload
    const uploadLabel = document.querySelector('.upload-zone span');
    if (files.length > 0) {
        uploadLabel.textContent = `${files.length} arquivo(s) selecionado(s)`;
    }
});

// Utilitário para formatar tamanho de arquivo (Bytes -> KB/MB)
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
}

handleUploadDosAssets();

document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // // 1. Pega os dados de texto (como string)
    // const dadosTexto = {}; // (Você preencheria isso com os valores dos inputs textuais)

    // // 2. Envia os dados textuais para criar a pasta
    // await window.api.gerarEstrutura(dadosTexto); 

    // 3. Pega as imagens e envia
    const imageInput = document.getElementById('cardImages');
    await fazerUploadDosAssets(imageInput);
});

const handleGetFileAtServer = async (filePath) => {
  let response = await window.api.getFileAtServer(filePath);
  console.log(response);
}



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
lightModeBtn.addEventListener('click', () => {
  console.log(prevShadow)
  let previewContent = prevShadow.querySelector('.preview-content');
  previewContent.setAttribute('data-bs-theme', 'light');
});
darkModeBtn.addEventListener('click', () => {
  let previewContent = prevShadow.querySelector('.preview-content');
  previewContent.setAttribute('data-bs-theme', 'dark');
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
        cssVariables += `
    [data-bs-theme="light"] {
  --theme-bg: #ffffff;
  --theme-text: #212529;
  --theme-surface: #f8f9fa;
  --color-font-body: #000000;
  --color-background-body: #ffffff;
  --black-theme: #212529;
  --color-primary: var(--base1-light);
  --color-secundary: var(--base2-light);
  --color-inter1: var(--intermediaria1-light);
  --color-inter2: var(--intermediaria2-light);
  --color-inter3: var(--intermediaria3-light);
  --color-inter1-bg: var(--intermediaria1-background-light);
  --color-inter2-bg: var(--intermediaria2-background-light);
  --color-inter3-bg: var(--intermediaria3-background-light);
}

[data-bs-theme="dark"] {
--theme-bg: #212529;
--theme-text: #ffffff;
--theme-surface: #2c3035;
--color-font-body: var(--white);
--black-theme: #212529;
--color-background-body: #212529;
--color-font-body: var(--white);
--gray-100: #2c3035;
--color-grays-100: #2c3035;  /* Era #f8f9fa - mais escuro no escuro */
--gray-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--color-grays-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--gray-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--color-grays-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--gray-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--color-grays-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--gray-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--color-grays-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--gray-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--color-grays-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--gray-700: #dddddd;  /* Era #444444 - agora texto legível */
--color-grays-700: #dddddd;  /* Era #444444 - agora texto legível */
--gray-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--color-grays-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--gray-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--color-grays-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--link-normal: #3b82f6; /* azul claro */
--link-hover: #60a5fa;  /* azul mais claro */
--link-visited: #a78bfa; /* roxo claro */
--link-focus: #38bdf8;  /* azul claro */
    --color-primary: var(--base1-dark);
  --color-secundary: var(--base2-dark);
--color-inter1: var(--intermediaria1-dark);
  --color-inter2: var(--intermediaria2-dark);
  --color-inter3: var(--intermediaria3-dark);
  --color-inter1-bg: var(--intermediaria1-background-dark);
  --color-inter2-bg: var(--intermediaria2-background-dark);
  --color-inter3-bg: var(--intermediaria3-background-dark);
}
`;
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
    cssVariables += `
    [data-bs-theme="light"] {
  --theme-bg: #ffffff;
  --theme-text: #212529;
  --theme-surface: #f8f9fa;
  --color-font-body: #000000;
  --color-background-body: #ffffff;
  --black-theme: #212529;
  --color-primary: var(--base1-light);
  --color-secundary: var(--base2-light);
  --color-inter1: var(--intermediaria1-light);
  --color-inter2: var(--intermediaria2-light);
  --color-inter3: var(--intermediaria3-light);
  --color-inter1-bg: var(--intermediaria1-background-light);
  --color-inter2-bg: var(--intermediaria2-background-light);
  --color-inter3-bg: var(--intermediaria3-background-light);
}

[data-bs-theme="dark"] {
--theme-bg: #212529;
--theme-text: #ffffff;
--theme-surface: #2c3035;
--color-font-body: var(--white);
--black-theme: #212529;
--color-background-body: #212529;
--color-font-body: var(--white);
--gray-100: #2c3035;
--color-grays-100: #2c3035;  /* Era #f8f9fa - mais escuro no escuro */
--gray-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--color-grays-200: #3a3f45;  /* Era #ebebeb - mais escuro no escuro */
--gray-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--color-grays-300: #4b5158;  /* Era #dee2e6 - mais escuro no escuro */
--gray-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--color-grays-400: #64748b;  /* Era #ced4d4 - mais escuro no escuro */
--gray-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--color-grays-500: #94a3b8;  /* Era #adb4bd - ajuste proporcional */
--gray-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--color-grays-600: #cbd5e1;  /* Era #888888 - agora texto legível */
--gray-700: #dddddd;  /* Era #444444 - agora texto legível */
--color-grays-700: #dddddd;  /* Era #444444 - agora texto legível */
--gray-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--color-grays-800: #e5e7eb;  /* Era #303030 - agora texto legível */
--gray-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--color-grays-900: #f3f4f6;  /* Era #222222 - agora texto legível */
--link-normal: #3b82f6; /* azul claro */
--link-hover: #60a5fa;  /* azul mais claro */
--link-visited: #a78bfa; /* roxo claro */
--link-focus: #38bdf8;  /* azul claro */
    --color-primary: var(--base1-dark);
  --color-secundary: var(--base2-dark);
--color-inter1: var(--intermediaria1-dark);
  --color-inter2: var(--intermediaria2-dark);
  --color-inter3: var(--intermediaria3-dark);
  --color-inter1-bg: var(--intermediaria1-background-dark);
  --color-inter2-bg: var(--intermediaria2-background-dark);
  --color-inter3-bg: var(--intermediaria3-background-dark);
}
`;

    style.textContent = cssVariables;
    console.log(cssVariables)
  shadowRoot.appendChild(style);

  // Adiciona um conteúdo inicial
  const content = document.createElement('div');
  content.className = 'preview-content';
  content.setAttribute('data-bs-theme', 'light'); // Tema padrão
  content.innerHTML = `<p style="padding: 1rem; color: var(--theme-text);">O preview dos componentes aparecerá aqui quando você ativar o olho em algum componente.</p>`;
  shadowRoot.appendChild(content);
  setThemeMode(shadowRoot);
};

const insertDataIntoShadowDOM = () => {
  // Os dados que aparecem no shadow DOM dependem do componente ativo (olho ativo)
  const shadowHost = document.getElementById('preview-shadow-host');
  const shadowRoot = shadowHost.shadowRoot;

  // Monitora a mudança no atributo active-view dos component-box
  const targets = document.querySelectorAll('.component-box');

  const  observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.attributeName === 'active-view') {
        if (mutation.target.getAttribute('active-view') === 'true') {
          console.log('O olho foi ativado para:', mutation.target);
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
    console.log("entrouu");

    if (!target) return;
    if (target.getAttribute('active-view') === 'false') {
      // Limpa o preview
      const previewContent = shadowRoot.querySelector('.preview-content');
      previewContent.innerHTML = ``;
      shadowRoot.appendChild(previewContent);
      return;
    }
    const componentType = target.getAttribute('data-comp');
    if (!componentType) return;
    console.log("Componente ativo para preview:", componentType)
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