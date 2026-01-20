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
}

  // Lista os cards de cores que podem ser clicados
  const cards = document.querySelectorAll('.color-card');
  
  cards.forEach(card => { // Itera sobre cada card 
    card.addEventListener('click', async () => {
      window.api.getClipboardText() // Chama a função exposta no preload.js e espera o resultado vindo de main.js
        .then(text => {
          let color = normalizeHex(text);
          putInSpanHex(card, color);
          updateColorPreview(card, color);
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