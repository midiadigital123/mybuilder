import { formatBytes } from '../../utils/file.js';

async function fazerUploadDosAssets(inputElement) {
    console.log("sdfsdf")
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
fileInput.addEventListener('change',  async (event) => {
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

    const imageInput = document.getElementById('cardImages');
 console.log(imageInput)
await fazerUploadDosAssets(imageInput);

    
});

}
const init = () => {
  handleUploadDosAssets();
};

const assetUploadController = {
  init
};
export default assetUploadController;