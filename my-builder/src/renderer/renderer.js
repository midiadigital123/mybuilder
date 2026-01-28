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

// import handleEditMode from './editMode.js';
// import handlePreviewMode from './previewMode.js';

import projectState from './temp/state/projectState.js';
import formController from './modules/form/formController.js';
import colorPickerController from './modules/colorPicker/colorPickerController.js';
import assetUploadController from './modules/assetUpload/assetUploadController.js';
import createStandartFolderController from './modules/createStandartFolder/createStandartFolderController.js'

document.addEventListener('DOMContentLoaded', () => {

  const init = () => {


    // Inicia os módulos
    /**
     * Módulos a serem iniciados
     * - Módulo do formulário
     * - Módulo do seletor de cores
     * - Módulo de upload de assets
     * - Módulo de edição de componentes
     * - Módulo de preview ao vivo 
     * - Módulo de monitoramento dos cambios no formulário
     * - Módulo de geração da estrutura de pastas e arquivos
     */

    // Cria o estado temporário do projeto em edição
    // tempObject já está importado
    createStandartFolderController.init();
    projectState.init();
    formController.init();
    colorPickerController.init();
    assetUploadController.init();


    
    // Inicia o módulo do formulário
    


    formController.loadInitialData();

  };

  init();
});