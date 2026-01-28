import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
const { ipcMain } = require("electron");
const fs = require("fs");
const fss = require("fs").promises;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Basicamente diz: Quando carregar a tela, carregue esse script de segurança antes de qualquer coisa.
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `./${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};



const handleGetClipboardText = async () => {
  const { clipboard } = require("electron");
  return clipboard.readText();
};

const handleSalvarImagem = async (_, nomeArquivo, buffer, year) => {
  // const pastaDestino = path.join(__dirname, "img"); // Define a pasta de destino para salvar a imagem
  const pastaDestino = path.join(__dirname, `${year}-X`, "assets", "img")
  // Garante que a pasta existe
  if (!fs.existsSync(pastaDestino)) {
    // fs.mkdirSync(pastaDestino, { recursive: true });
    return false;
  }

  const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

  // fs.writeFile aceita Buffer nativamente
  try {
    fs.writeFileSync(caminhoCompleto, buffer);
    return true;
  } catch (erro) {
    console.error("Erro ao salvar imagem:", erro);
    return false;
  }
};

const handleGetFileAtServer = async (_, filePath) => {
  console.log("filepath", filePath);
  // faz um fetch da url do filePath
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const textData = await response.text();
    console.log(textData);
    return textData;
  } catch (error) {
    console.error("Erro ao buscar o arquivo no servidor:", error);
    throw error;
  }
};


const handleCreateStandartStructure = async (_, year) => {
  const pastas = [
    `${year}-X/assets/css`,
    `${year}-X/assets/img`,
    `${year}-X/assets/js`,
    `${year}-X/content/docs`,
    `${year}-X/temp/assets/css`, // Pasta para armazenar os arquivos CSS dos componentes antes da build
    `${year}-X/temp/assets/js`,  // Pasta para armazenar os arquivos JS dos componentes antes da build
  ];

  try {
    // Usamos map para criar todas as promessas e Promise.all para aguardar todas
    await Promise.all(
      pastas.map((pasta) =>
        fss.mkdir(path.join(__dirname, pasta), { recursive: true }),
      ),
    );

    // console.log("✅ Estrutura de pastas criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar estrutura:", err);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  ipcMain.handle("create-standart-folder", handleCreateStandartStructure)

  ipcMain.handle("get-clipboard-text", handleGetClipboardText);

  ipcMain.handle("upload:salvar-imagem", handleSalvarImagem);

  ipcMain.handle("get-file-at-server", handleGetFileAtServer);

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
