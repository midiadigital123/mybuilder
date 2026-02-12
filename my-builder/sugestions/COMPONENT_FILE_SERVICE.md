# Sugestão: Implementação do componentFileService.js

**Data:** 2026-02-12  
**Tipo:** Implementação de Serviço  
**Prioridade:** Alta  
**Pré-requisito:** Passo 1 concluído (pasta `temp/components/` criada)

---

## 📋 Objetivo

Criar um serviço responsável por gerenciar todas as operações de arquivo dos componentes temporários. Este serviço será a **única interface** para criar, ler, atualizar e deletar arquivos de componentes.

---

## 🏗️ Arquitetura

O serviço será dividido em duas partes:

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDERER PROCESS                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              componentFileService.js                       │  │
│  │  (src/services/componentFileService.js)                    │  │
│  │                                                            │  │
│  │  - createTempFiles(alias, html, css, js)                   │  │
│  │  - readTempFiles(alias)                                    │  │
│  │  - updateTempFile(alias, fileType, content)                │  │
│  │  - deleteTempFiles(alias)                                  │  │
│  │  - listActiveComponents()                                  │  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                         │ window.api.*                          │
└─────────────────────────┼───────────────────────────────────────┘
                          │ IPC (invoke/handle)
┌─────────────────────────┼───────────────────────────────────────┐
│                         ▼                                       │
│                      MAIN PROCESS                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      main.js                               │  │
│  │                                                            │  │
│  │  - handleCreateComponentFiles()                            │  │
│  │  - handleReadComponentFiles()                              │  │
│  │  - handleUpdateComponentFile()                             │  │
│  │  - handleDeleteComponentFiles()                            │  │
│  │  - handleListComponentFiles()                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         ▼                                       │
│              .vite/build/2026-X/temp/components/                │
│                         │                                       │
│              ├── destaque.html                                  │
│              ├── destaque.css                                   │
│              ├── destaque.js                                    │
│              ├── citacao.html                                   │
│              └── ...                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/services/componentFileService.js` | **Criar** | Serviço no renderer |
| `src/main.js` | Modificar | Adicionar handlers IPC |
| `src/preload.js` | Modificar | Expor APIs para renderer |

---

## 📝 Implementação Detalhada

### 1. Handlers no Main Process (`main.js`)

Adicionar após os handlers existentes:

```javascript
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
      fss.writeFile(path.join(basePath, `${alias}.html`), files.html || "", "utf8"),
      fss.writeFile(path.join(basePath, `${alias}.css`), files.css || "", "utf8"),
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
    const aliases = [...new Set(
      files.map(file => file.replace(/\.(html|css|js)$/, ""))
    )];
    
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
```

Registrar os handlers no `app.whenReady()`:

```javascript
app.whenReady().then(() => {
  // ... handlers existentes ...
  
  // Handlers para arquivos de componentes
  ipcMain.handle("component:createFiles", handleCreateComponentFiles);
  ipcMain.handle("component:readFiles", handleReadComponentFiles);
  ipcMain.handle("component:updateFile", handleUpdateComponentFile);
  ipcMain.handle("component:deleteFiles", handleDeleteComponentFiles);
  ipcMain.handle("component:listFiles", handleListComponentFiles);
  
  createWindow();
  // ...
});
```

---

### 2. Preload Script (`preload.js`)

Adicionar as novas APIs:

```javascript
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // ... APIs existentes ...
  
  // APIs para arquivos de componentes
  createComponentFiles: (alias, files, year) =>
    ipcRenderer.invoke("component:createFiles", alias, files, year),
  
  readComponentFiles: (alias, year) =>
    ipcRenderer.invoke("component:readFiles", alias, year),
  
  updateComponentFile: (alias, fileType, content, year) =>
    ipcRenderer.invoke("component:updateFile", alias, fileType, content, year),
  
  deleteComponentFiles: (alias, year) =>
    ipcRenderer.invoke("component:deleteFiles", alias, year),
  
  listComponentFiles: (year) =>
    ipcRenderer.invoke("component:listFiles", year),
});
```

---

### 3. Serviço no Renderer (`src/services/componentFileService.js`)

```javascript
import CONSTANTS from "../renderer/constants/CONSTANTS.js";

/**
 * Serviço para gerenciar arquivos temporários de componentes.
 * Abstrai as chamadas IPC para o main process.
 */
const componentFileService = {
  /**
   * Cria os arquivos temporários de um componente após fetch do servidor
   * @param {string} alias - Alias do componente (ex: "destaque")
   * @param {object} files - { html: string, css: string, js: string }
   * @returns {Promise<{success: boolean, alias?: string, error?: string}>}
   */
  async create(alias, files) {
    return await window.api.createComponentFiles(alias, files, CONSTANTS.YEAR);
  },

  /**
   * Lê os arquivos temporários de um componente
   * @param {string} alias - Alias do componente
   * @returns {Promise<{success: boolean, files?: object, error?: string}>}
   */
  async read(alias) {
    return await window.api.readComponentFiles(alias, CONSTANTS.YEAR);
  },

  /**
   * Atualiza um arquivo específico (usado ao salvar edições do usuário)
   * @param {string} alias - Alias do componente
   * @param {string} fileType - "html", "css" ou "js"
   * @param {string} content - Novo conteúdo
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async update(alias, fileType, content) {
    return await window.api.updateComponentFile(alias, fileType, content, CONSTANTS.YEAR);
  },

  /**
   * Deleta os arquivos temporários (quando componente é desativado)
   * @param {string} alias - Alias do componente
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(alias) {
    return await window.api.deleteComponentFiles(alias, CONSTANTS.YEAR);
  },

  /**
   * Lista todos os componentes com arquivos temporários ativos
   * @returns {Promise<{success: boolean, aliases?: string[], error?: string}>}
   */
  async listActive() {
    return await window.api.listComponentFiles(CONSTANTS.YEAR);
  },
};

export default componentFileService;
```

---

## 🔄 Como Usar o Serviço

### Exemplo: Ativação de Componente

```javascript
import componentFileService from "../services/componentFileService.js";
import fetchData from "../services/fetchData.js";

// Quando componente é ativado
const onComponentActivated = async (component) => {
  // 1. Busca arquivos do servidor
  const data = await fetchData(component);
  
  // 2. Cria arquivos temporários
  const result = await componentFileService.create(component.alias, {
    html: data.html,
    css: data.css,
    js: data.js,
  });
  
  if (result.success) {
    console.log(`✅ Arquivos criados para ${component.alias}`);
  }
};
```

### Exemplo: Desativação de Componente

```javascript
const onComponentDeactivated = async (alias) => {
  const result = await componentFileService.delete(alias);
  
  if (result.success) {
    console.log(`🗑️ Arquivos removidos para ${alias}`);
  }
};
```

### Exemplo: Salvar Edição do Usuário

```javascript
const onUserSavedEdit = async (alias, fileType, newContent) => {
  const result = await componentFileService.update(alias, fileType, newContent);
  
  if (result.success) {
    // Notifica shadowDOM para atualizar preview
    observerModule.sendNotify("shadowDOM:updatePreview", { alias });
  }
};
```

### Exemplo: Carregar para Preview/Edição

```javascript
const loadComponentForPreview = async (alias) => {
  const result = await componentFileService.read(alias);
  
  if (result.success) {
    const { html, css, js } = result.files;
    // Usa os arquivos para renderizar preview
  }
};
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar handlers no `main.js`
- [ ] Registrar handlers no `app.whenReady()`
- [ ] Atualizar `preload.js` com novas APIs
- [ ] Criar `src/services/componentFileService.js`
- [ ] Testar criação de arquivos
- [ ] Testar leitura de arquivos
- [ ] Testar atualização de arquivos
- [ ] Testar deleção de arquivos
- [ ] Testar listagem de componentes ativos

---

## ⚠️ Tratamento de Erros

Todos os métodos retornam um objeto com `{ success: boolean }`. Sempre verificar:

```javascript
const result = await componentFileService.create(alias, files);

if (!result.success) {
  console.error(`Erro: ${result.error}`);
  // Mostrar feedback ao usuário ou fallback
}
```

---

## 🔗 Próximo Passo

Após implementar este serviço, o próximo passo será **refatorar o `projectState.js`** para:
1. Remover as propriedades `html`, `css`, `js` do estado dos componentes
2. Usar o `componentFileService` para criar/deletar arquivos na ativação/desativação
3. Atualizar o shadowDOM para ler arquivos do serviço ao invés do estado
