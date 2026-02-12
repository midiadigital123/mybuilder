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
  const pastaDestino = path.join(__dirname, `${year}-X`, "assets", "img");
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
    `${year}-X/temp/components/`, // Pasta para armazenar os arquivos dos componentes antes da build
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

// ============================================
// HANDLERS PARA ARQUIVOS DE COMPONENTES
// ============================================

const COMPONENTS_TEMP_PATH = (year) =>
  path.join(__dirname, `${year}-X`, "temp", "components");

/**
 * Cria os 3 arquivos temporários de um componente (html, css, js)
 * @param {string} alias - Nome do componente (ex: "destaque")
 * @param {object} files - { html: string, css: string, js: string }
 * @param {string} year - Ano do projeto (ex: "2026")
 */
const handleCreateComponentFiles = async (_, alias, files, year) => {
  const basePath = COMPONENTS_TEMP_PATH(year);

  try {
    // Garante que a pasta existe
    await fss.mkdir(basePath, { recursive: true });

    // Cria os 3 arquivos em paralelo
    await Promise.all([
      fss.writeFile(
        path.join(basePath, `${alias}.html`),
        files.html || "",
        "utf8",
      ),
      fss.writeFile(
        path.join(basePath, `${alias}.css`),
        files.css || "",
        "utf8",
      ),
      fss.writeFile(path.join(basePath, `${alias}.js`), files.js || "", "utf8"),
    ]);

    return { success: true, alias };
  } catch (error) {
    console.error(`❌ Erro ao criar arquivos para ${alias}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Lê os 3 arquivos temporários de um componente
 * @param {string} alias - Nome do componente
 * @param {string} year - Ano do projeto
 * @returns {object} - { html: string, css: string, js: string }
 */
const handleReadComponentFiles = async (_, alias, year) => {
  const basePath = COMPONENTS_TEMP_PATH(year);

  try {
    const [html, css, js] = await Promise.all([
      fss.readFile(path.join(basePath, `${alias}.html`), "utf8"),
      fss.readFile(path.join(basePath, `${alias}.css`), "utf8"),
      fss.readFile(path.join(basePath, `${alias}.js`), "utf8"),
    ]);

    return { success: true, files: { html, css, js } };
  } catch (error) {
    console.error(`❌ Erro ao ler arquivos de ${alias}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Atualiza um arquivo específico de um componente
 * @param {string} alias - Nome do componente
 * @param {string} fileType - Tipo do arquivo ("html", "css" ou "js")
 * @param {string} content - Novo conteúdo
 * @param {string} year - Ano do projeto
 */
const handleUpdateComponentFile = async (_, alias, fileType, content, year) => {
  const basePath = COMPONENTS_TEMP_PATH(year);
  const filePath = path.join(basePath, `${alias}.${fileType}`);

  try {
    await fss.writeFile(filePath, content, "utf8");
    return { success: true, alias, fileType };
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${alias}.${fileType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Deleta os 3 arquivos temporários de um componente
 * @param {string} alias - Nome do componente
 * @param {string} year - Ano do projeto
 */
const handleDeleteComponentFiles = async (_, alias, year) => {
  const basePath = COMPONENTS_TEMP_PATH(year);

  try {
    await Promise.all([
      fss.unlink(path.join(basePath, `${alias}.html`)).catch(() => {}),
      fss.unlink(path.join(basePath, `${alias}.css`)).catch(() => {}),
      fss.unlink(path.join(basePath, `${alias}.js`)).catch(() => {}),
    ]);

    return { success: true, alias };
  } catch (error) {
    console.error(`❌ Erro ao deletar arquivos de ${alias}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Lista todos os componentes que têm arquivos temporários
 * @param {string} year - Ano do projeto
 * @returns {string[]} - Lista de aliases
 */
const handleListComponentFiles = async (_, year) => {
  const basePath = COMPONENTS_TEMP_PATH(year);

  try {
    const files = await fss.readdir(basePath);

    // Extrai aliases únicos (remove extensões e duplicatas)
    const aliases = [
      ...new Set(files.map((file) => file.replace(/\.(html|css|js)$/, ""))),
    ];

    return { success: true, aliases };
  } catch (error) {
    // Pasta não existe = nenhum componente ativo
    if (error.code === "ENOENT") {
      return { success: true, aliases: [] };
    }
    console.error(`❌ Erro ao listar componentes:`, error);
    return { success: false, error: error.message };
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("create-standart-folder", handleCreateStandartStructure);

  ipcMain.handle("get-clipboard-text", handleGetClipboardText);

  ipcMain.handle("upload:salvar-imagem", handleSalvarImagem);

  ipcMain.handle("get-file-at-server", handleGetFileAtServer);

  ipcMain.handle("component:createFiles", handleCreateComponentFiles);

  ipcMain.handle("component:readFiles", handleReadComponentFiles);

  ipcMain.handle("component:updateFile", handleUpdateComponentFile);

  ipcMain.handle("component:deleteFiles", handleDeleteComponentFiles);

  ipcMain.handle("component:listFiles", handleListComponentFiles);

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
