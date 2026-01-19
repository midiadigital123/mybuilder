// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
   
    getClipboardText: () => {
        return ipcRenderer.invoke('get-clipboard-text');
    },
    salvarArquivo: 
    (nome, buffer) => 
        ipcRenderer.invoke('upload:salvar-imagem', nome, buffer)
})

