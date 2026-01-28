// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
   
    getClipboardText: () => {
        return ipcRenderer.invoke('get-clipboard-text');
    },

    salvarArquivo: 
    (nome, buffer, year) => 
        ipcRenderer.invoke('upload:salvar-imagem', nome, buffer, year),

    getFileAtServer: (filePath) => 
        ipcRenderer.invoke('get-file-at-server', filePath),

   createFolder: (year) =>  
        ipcRenderer.invoke('create-standart-folder', year)
})

