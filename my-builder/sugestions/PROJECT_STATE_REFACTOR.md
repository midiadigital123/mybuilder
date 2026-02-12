# Sugestão: Refatoração do ProjectState

**Data:** 2026-02-12  
**Tipo:** Refatoração / Arquitetura  
**Prioridade:** Alta  
**Pré-requisito:** componentFileService.js implementado

---

## 📋 Análise do Estado Atual

Analisei o `projectState.js` e identifiquei alguns pontos que podem ser melhorados. Vou ser direto sobre o que encontrei:

---

## 🔴 Problemas Identificados

### 1. **Classe com Múltiplas Responsabilidades**

O `ProjectState` está fazendo muita coisa:
- Gerencia estado do curso (nome, tempo, classe)
- Gerencia esquema de cores
- Gerencia componentes
- Faz fetch de dados do servidor
- Atualiza o shadowDOM
- Escuta eventos do observer

**Princípio violado:** Single Responsibility Principle (SRP)

---

### 2. **Métodos de Observação Dentro do `init()`**

Todas as subscrições do observer estão dentro do método `init()`:

```javascript
init() {
  this.#fillStateWithMockData();
  
  observerModule.subscribeTo("form:inputChanged", (data) => { ... });
  observerModule.subscribeTo("color:changed", (data) => { ... });
  observerModule.subscribeTo("component:updateInEditMode", (data) => { ... });
  observerModule.subscribeTo("component:setActivation", async (data) => { ... });
  observerModule.subscribeTo("component:setFocus", (data) => { ... });
  observerModule.subscribeTo("component:setModel", async (data) => { ... });
  observerModule.subscribeTo("component:setVersion", async (data) => { ... });
}
```

**Problemas:**
- Difícil de testar individualmente
- Difícil de entender o fluxo
- Callbacks inline com lógica complexa
- Mistura de responsabilidades (escutar evento + processar + notificar)

---

### 3. **Acoplamento Direto com `observerModule.sendNotify`**

O state está disparando notificações diretamente para o shadowDOM:

```javascript
#updateColor(colorKey, colorValue) {
  // Atualiza estado
  this.#state.colorScheme[colorKey] = colorValue;
  
  // Notifica mudança de estado (ok)
  observerModule.sendNotify("state:changed", {...});
  
  // Notifica shadowDOM diretamente (acoplamento!)
  observerModule.sendNotify("shadowDOM:color:changed", {...});
}
```

**Problema:** O state não deveria saber que o shadowDOM existe. Ele deveria apenas notificar "o estado mudou" e quem quiser reagir, que se inscreva.

---

### 4. **Método `#fetchComponentFiles` com Lógica Confusa**

```javascript
#fetchComponentFiles = async (componentId, value) => {
  if (value == false) {
    // Limpa arquivos se value é false
    this.#updateComponentState("component:cleanFiles", componentId, "html", "");
    // ...
  }
  // Mas depois continua e faz fetch mesmo assim?
  try {
    const component = this.#find(componentId);
    // ...
    const newData = await fetchData(component);
    // ...
  }
}
```

**Problemas:**
- Parâmetro `value` não é claro (boolean para quê?)
- Limpa arquivos E depois faz fetch? Lógica confusa
- Nome do método sugere apenas fetch, mas também limpa

---

### 5. **Propriedades `html`, `css`, `js` no Estado**

Com a nova arquitetura de arquivos temporários, essas propriedades não deveriam mais existir no estado:

```javascript
// Não deveria mais existir:
{
  id: 'comp-1',
  html: "...",  // ❌ Vai para arquivo
  css: "...",   // ❌ Vai para arquivo
  js: "..."     // ❌ Vai para arquivo
}
```

---

### 6. **Métodos Vazios / Não Utilizados**

```javascript
#updateComponenteTempData(componentName, html, css, js) {
  // Vazio!
}

#updateData() {}

#updateShadowDOMForComponent(id) {}
```

Código morto que só adiciona confusão.

---

### 7. **Inconsistência de Nomenclatura**

- `#updateComponenteTempData` (português)
- `#updateFocusedComponente` (português)
- `#fetchComponentFiles` (inglês)
- `#updateComponentState` (inglês)

Mistura de idiomas dificulta leitura.

---

## 🟢 Proposta de Refatoração

### Princípios a Seguir

1. **Single Responsibility** - Cada classe/método faz UMA coisa
2. **Separar Escuta de Ação** - Handlers de eventos em arquivo separado
3. **State não conhece UI** - Apenas notifica mudanças genéricas
4. **Nomenclatura Consistente** - Tudo em inglês ou tudo em português

---

### Nova Estrutura Proposta

```
src/renderer/
├── state/
│   ├── projectState.js          # Estado puro (dados + getters/setters)
│   ├── stateHandlers.js          # Handlers de eventos (subscrições)
│   └── stateActions.js           # Ações que modificam o estado
│
├── services/
│   ├── componentFileService.js   # ✅ Já existe
│   ├── fetchData.js              # ✅ Já existe
│   └── observerModule.js         # ✅ Já existe
```

---

### Opção A: Refatoração Leve (Recomendada)

Manter a estrutura atual, mas limpar e organizar:

#### 1. Remover código morto e propriedades obsoletas

```javascript
// REMOVER do estado:
// - html, css, js (vão para arquivos)

// REMOVER métodos vazios:
// - #updateComponenteTempData
// - #updateData
// - #updateShadowDOMForComponent
```

#### 2. Extrair handlers para métodos nomeados

**Antes:**
```javascript
observerModule.subscribeTo("component:setActivation", async (data) => {
  this.#updateComponentState("setActivation", data.id, "isActive", data.value);
  await this.#fetchComponentFiles(data.id, data.value);
  if (data.value === false) {
    observerModule.sendNotify("shadowDOM:cleanPreview", {});
  } else {
    this.#updateFocusedComponente(data.id, data.value);
  }
});
```

**Depois:**
```javascript
// Handler como método da classe
#handleComponentActivation = async (data) => {
  const { id, value: isActive } = data;
  const component = this.#find(id);
  if (!component) return;

  // 1. Atualiza estado
  component.isActive = isActive;

  if (isActive) {
    // 2. Busca arquivos do servidor
    const files = await fetchData(component);
    
    // 3. Cria arquivos temporários
    await componentFileService.create(component.alias, files);
    
    // 4. Atualiza foco
    this.#setFocusedComponent(id);
    
    // 5. Notifica mudança
    this.#notifyStateChanged("component:activated", { id, alias: component.alias });
  } else {
    // 2. Remove arquivos temporários
    await componentFileService.delete(component.alias);
    
    // 3. Notifica mudança
    this.#notifyStateChanged("component:deactivated", { id });
  }
};

// No init(), apenas registra:
init() {
  this.#fillStateWithMockData();
  this.#registerEventHandlers();
}

#registerEventHandlers() {
  observerModule.subscribeTo("component:setActivation", this.#handleComponentActivation);
  observerModule.subscribeTo("component:setFocus", this.#handleComponentFocus);
  // ...
}
```

#### 3. Criar método genérico de notificação

```javascript
#notifyStateChanged(type, payload) {
  observerModule.sendNotify("state:changed", { type, ...payload });
}
```

O shadowDOMController se inscreve em `state:changed` e reage conforme o `type`.

#### 4. Simplificar fetch e gestão de arquivos

**Antes:** `#fetchComponentFiles(componentId, value)` - confuso

**Depois:** Dois métodos claros:
```javascript
async #activateComponent(component) {
  const files = await fetchData(component);
  await componentFileService.create(component.alias, files);
}

async #deactivateComponent(component) {
  await componentFileService.delete(component.alias);
}
```

---

### Opção B: Refatoração Profunda

Separar completamente em múltiplos arquivos:

#### `state/projectState.js` - Apenas dados
```javascript
class ProjectState {
  #state = { ... };
  
  get() { return structuredClone(this.#state); }
  
  getCourseInfo() { ... }
  setCourseInfo(key, value) { ... }
  
  getColorScheme() { ... }
  setColor(key, value) { ... }
  
  getComponents() { ... }
  getComponent(id) { ... }
  setComponentProperty(id, key, value) { ... }
}
```

#### `state/stateHandlers.js` - Event handlers
```javascript
import projectState from "./projectState.js";
import componentFileService from "../services/componentFileService.js";

export const handleComponentActivation = async (data) => {
  // Toda a lógica aqui
};

export const handleColorChange = (data) => {
  // Toda a lógica aqui
};

export const registerAllHandlers = () => {
  observerModule.subscribeTo("component:setActivation", handleComponentActivation);
  observerModule.subscribeTo("color:changed", handleColorChange);
  // ...
};
```

---

## 🎯 Minha Recomendação

**Ir com a Opção A (Refatoração Leve)** porque:

1. Menor risco de quebrar funcionalidades existentes
2. Mantém a estrutura que você já conhece
3. Resolve os principais problemas (código limpo, responsabilidades claras)
4. Pode evoluir para Opção B no futuro se necessário

---

## 📝 Código Sugerido (Opção A)

Segue o código refatorado completo:

```javascript
import observerModule from "../../../services/observerModule.js";
import fetchData from "../../../services/fetchData.js";
import componentFileService from "../../../services/componentFileService.js";
import componentsData from "../../modules/componentManager/mock/componentMockData.js";

class ProjectState {
  #state = {
    "course-name": "",
    "course-time": "",
    "course-encapsulation-class": "",
    colorScheme: {
      "base1-light": "#014ff1",
      "base1-dark": "#013ebc",
      "base2-light": "#338fe5",
      "base2-dark": "#1a76cc",
      "intermediaria1-light": "#00b0c1",
      "intermediaria1-bg-light": "#00dff5",
      "intermediaria1-dark": "#00828f",
      "intermediaria1-bg-dark": "#00b1c2",
      "intermediaria2-light": "#999999",
      "intermediaria2-dark": "#777777",
      "intermediaria2-bg-light": "#e0e0e0",
      "intermediaria2-bg-dark": "#3c3c3c",
      "intermediaria3-light": "#666666",
      "intermediaria3-dark": "#aaaaaa",
      "intermediaria3-bg-light": "#d0d0d0",
      "intermediaria3-bg-dark": "#4c4c4c",
      "active-light": "#0d6efd",
      "active-dark": "#0d6efd",
      "active-hover-light": "#0b5ed7",
      "active-hover-dark": "#0b5ed7",
    },
    assets: {
      images: [],
    },
    components: [],
    actualMode: "preview",
  };

  constructor() {}

  // ============================================
  // GETTERS
  // ============================================

  get() {
    return structuredClone(this.#state);
  }

  #findComponent(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  #findComponentByAlias(alias) {
    return this.#state.components.find((comp) => comp.alias === alias);
  }

  getFocusedComponent() {
    return this.#state.components.find((comp) => comp.focused === true);
  }

  // ============================================
  // NOTIFICAÇÕES (método único)
  // ============================================

  #notify(type, payload = {}) {
    observerModule.sendNotify("state:changed", { type, ...payload });
  }

  // ============================================
  // AÇÕES: COURSE INFO
  // ============================================

  #handleCourseInfoChange = ({ id, value }) => {
    if (this.#state[id] === undefined) return;
    
    this.#state[id] = value;
    this.#notify("courseInfo:updated", { id, value });
  };

  // ============================================
  // AÇÕES: CORES
  // ============================================

  #handleColorChange = ({ colorKey, colorValue }) => {
    if (this.#state.colorScheme[colorKey] === undefined) return;
    
    this.#state.colorScheme[colorKey] = colorValue;
    this.#notify("color:updated", { colorKey, colorValue });
  };

  // ============================================
  // AÇÕES: COMPONENTES
  // ============================================

  #handleComponentActivation = async ({ id, value: isActive }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.isActive = isActive;

    if (isActive) {
      // Busca arquivos e cria temporários
      const filesData = await fetchData(component);
      const result = await componentFileService.create(component.alias, {
        html: filesData.html,
        css: filesData.css,
        js: filesData.js,
      });

      if (result.success) {
        this.#setFocusedComponent(id);
        this.#notify("component:activated", { 
          id, 
          alias: component.alias,
          files: { html: filesData.html, css: filesData.css, js: filesData.js }
        });
      }
    } else {
      // Remove arquivos temporários
      await componentFileService.delete(component.alias);
      component.focused = false;
      this.#notify("component:deactivated", { id, alias: component.alias });
    }
  };

  #handleComponentFocus = ({ id, value }) => {
    const component = this.#findComponent(id);
    if (!component || !component.isActive) return;

    this.#setFocusedComponent(id);
  };

  #handleModelChange = async ({ id, value: selectedModel }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedModel = selectedModel;

    // Busca novos arquivos e sobrescreve
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:modelChanged", { 
      id, 
      alias: component.alias,
      selectedModel,
      files: { html: filesData.html, css: filesData.css, js: filesData.js }
    });
  };

  #handleVersionChange = async ({ id, value: selectedVersion }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedVersion = selectedVersion;

    // Busca novos arquivos e sobrescreve
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:versionChanged", { 
      id, 
      alias: component.alias,
      selectedVersion,
      files: { html: filesData.html, css: filesData.css, js: filesData.js }
    });
  };

  #handleComponentEdit = async ({ alias, fileType, content }) => {
    const result = await componentFileService.update(alias, fileType, content);
    
    if (result.success) {
      // Lê arquivos atualizados para notificar
      const filesResult = await componentFileService.read(alias);
      if (filesResult.success) {
        this.#notify("component:edited", { 
          alias, 
          fileType,
          files: filesResult.files 
        });
      }
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  #setFocusedComponent(id) {
    // Remove foco de todos
    this.#state.components.forEach((comp) => {
      comp.focused = false;
    });

    // Define foco no componente específico
    const component = this.#findComponent(id);
    if (!component) return;
    
    component.focused = true;
    
    // Notifica com dados do arquivo
    componentFileService.read(component.alias).then((result) => {
      if (result.success) {
        this.#notify("component:focused", {
          id,
          alias: component.alias,
          files: result.files,
        });
      }
    });
  }

  #fillStateWithMockData() {
    componentsData.forEach((component) => {
      this.#state.components.push({
        id: component.id,
        name: component.name,
        alias: component.alias,
        models: component.models,
        versions: component.versions,
        focused: component.focused,
        isActive: component.isActive,
        selectedModel: component.selectedModel,
        selectedVersion: component.selectedVersion,
        // Removido: html, css, js - agora em arquivos temporários
      });
    });
  }

  // ============================================
  // REGISTRO DE HANDLERS
  // ============================================

  #registerEventHandlers() {
    observerModule.subscribeTo("form:inputChanged", this.#handleCourseInfoChange);
    observerModule.subscribeTo("color:changed", this.#handleColorChange);
    observerModule.subscribeTo("component:setActivation", this.#handleComponentActivation);
    observerModule.subscribeTo("component:setFocus", this.#handleComponentFocus);
    observerModule.subscribeTo("component:setModel", this.#handleModelChange);
    observerModule.subscribeTo("component:setVersion", this.#handleVersionChange);
    observerModule.subscribeTo("component:edit", this.#handleComponentEdit);
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  init() {
    this.#fillStateWithMockData();
    this.#registerEventHandlers();
  }
}

const projectState = new ProjectState();
export default projectState;
```

---

## 🔄 Impacto no shadowDOMController

Com a refatoração, o shadowDOM deve escutar `state:changed` e reagir baseado no `type`:

```javascript
observerModule.subscribeTo("state:changed", (data) => {
  switch (data.type) {
    case "color:updated":
      updateColors(data.colorKey, data.colorValue);
      break;
    case "component:activated":
    case "component:focused":
    case "component:modelChanged":
    case "component:versionChanged":
    case "component:edited":
      updatePreview(data.files);
      break;
    case "component:deactivated":
      clearPreview();
      break;
  }
});
```

---

## ✅ Checklist de Refatoração

- [ ] Remover propriedades `html`, `css`, `js` do estado dos componentes
- [ ] Remover métodos vazios (`#updateComponenteTempData`, `#updateData`, etc.)
- [ ] Extrair handlers inline para métodos nomeados da classe
- [ ] Criar método único `#notify()` para disparar eventos
- [ ] Integrar `componentFileService` nos handlers
- [ ] Atualizar `componentMockData.js` (remover html, css, js)
- [ ] Atualizar `shadowDOMController.js` para escutar `state:changed`
- [ ] Testar fluxo completo de ativação/desativação
- [ ] Testar fluxo de mudança de modelo/versão
- [ ] Testar fluxo de edição de código

---

## ✅ Decisões Tomadas

| Decisão | Escolha |
|---------|---------|
| Abordagem | **Opção A** - Refatoração Leve |
| Nomenclatura | **Inglês** |
| Canal de eventos | **Unificado** - `state:changed` com `type` |

---

## 📋 Passo a Passo da Refatoração

### Passo 1: Atualizar `componentMockData.js`

Remover as propriedades `html`, `css`, `js` dos componentes mockados.

**Arquivo:** `src/renderer/modules/componentManager/mock/componentMockData.js`

**De:**
```javascript
{
  id: 'comp-1',
  name: 'Destaque',
  alias: 'destaque',
  models: ['m1', 'm2', 'm3', 'm4'],
  versions: ["v1", "v2", "v3"],
  focused: false,
  isActive: false,
  selectedModel: 'm1',
  selectedVersion: 'v1',
  html: "",   // ❌ Remover
  css: "",    // ❌ Remover
  js: ""      // ❌ Remover
}
```

**Para:**
```javascript
{
  id: 'comp-1',
  name: 'Destaque',
  alias: 'destaque',
  models: ['m1', 'm2', 'm3', 'm4'],
  versions: ["v1", "v2", "v3"],
  focused: false,
  isActive: false,
  selectedModel: 'm1',
  selectedVersion: 'v1'
}
```

---

### Passo 2: Substituir o `projectState.js`

Substituir o conteúdo inteiro do arquivo pelo código refatorado.

**Arquivo:** `src/renderer/temp/state/projectState.js`

```javascript
import observerModule from "../../../services/observerModule.js";
import fetchData from "../../../services/fetchData.js";
import componentFileService from "../../../services/componentFileService.js";
import componentsData from "../../modules/componentManager/mock/componentMockData.js";

class ProjectState {
  #state = {
    "course-name": "",
    "course-time": "",
    "course-encapsulation-class": "",
    colorScheme: {
      "base1-light": "#014ff1",
      "base1-dark": "#013ebc",
      "base2-light": "#338fe5",
      "base2-dark": "#1a76cc",
      "intermediaria1-light": "#00b0c1",
      "intermediaria1-bg-light": "#00dff5",
      "intermediaria1-dark": "#00828f",
      "intermediaria1-bg-dark": "#00b1c2",
      "intermediaria2-light": "#999999",
      "intermediaria2-dark": "#777777",
      "intermediaria2-bg-light": "#e0e0e0",
      "intermediaria2-bg-dark": "#3c3c3c",
      "intermediaria3-light": "#666666",
      "intermediaria3-dark": "#aaaaaa",
      "intermediaria3-bg-light": "#d0d0d0",
      "intermediaria3-bg-dark": "#4c4c4c",
      "active-light": "#0d6efd",
      "active-dark": "#0d6efd",
      "active-hover-light": "#0b5ed7",
      "active-hover-dark": "#0b5ed7",
    },
    assets: {
      images: [],
    },
    components: [],
    actualMode: "preview",
  };

  constructor() {}

  // ============================================
  // GETTERS
  // ============================================

  get() {
    return structuredClone(this.#state);
  }

  #findComponent(id) {
    return this.#state.components.find((comp) => comp.id === id);
  }

  #findComponentByAlias(alias) {
    return this.#state.components.find((comp) => comp.alias === alias);
  }

  getFocusedComponent() {
    return this.#state.components.find((comp) => comp.focused === true);
  }

  // ============================================
  // NOTIFICAÇÃO UNIFICADA
  // ============================================

  #notify(type, payload = {}) {
    observerModule.sendNotify("state:changed", { type, ...payload });
  }

  // ============================================
  // HANDLERS: COURSE INFO
  // ============================================

  #handleCourseInfoChange = ({ id, value }) => {
    if (this.#state[id] === undefined) return;

    this.#state[id] = value;
    this.#notify("courseInfo:updated", { id, value });
  };

  // ============================================
  // HANDLERS: COLORS
  // ============================================

  #handleColorChange = ({ colorKey, colorValue }) => {
    if (this.#state.colorScheme[colorKey] === undefined) return;

    this.#state.colorScheme[colorKey] = colorValue;
    this.#notify("color:updated", { colorKey, colorValue });
  };

  // ============================================
  // HANDLERS: COMPONENTS
  // ============================================

  #handleComponentActivation = async ({ id, value: isActive }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.isActive = isActive;

    if (isActive) {
      // Fetch files from server and create temp files
      const filesData = await fetchData(component);
      const result = await componentFileService.create(component.alias, {
        html: filesData.html,
        css: filesData.css,
        js: filesData.js,
      });

      if (result.success) {
        this.#setFocusedComponent(id);
        this.#notify("component:activated", {
          id,
          alias: component.alias,
          files: { html: filesData.html, css: filesData.css, js: filesData.js },
        });
      }
    } else {
      // Delete temp files
      await componentFileService.delete(component.alias);
      component.focused = false;
      this.#notify("component:deactivated", { id, alias: component.alias });
    }
  };

  #handleComponentFocus = ({ id, value }) => {
    const component = this.#findComponent(id);
    if (!component || !component.isActive) return;

    this.#setFocusedComponent(id);
  };

  #handleModelChange = async ({ id, value: selectedModel }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedModel = selectedModel;

    // Fetch new files and overwrite temp files
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:modelChanged", {
      id,
      alias: component.alias,
      selectedModel,
      files: { html: filesData.html, css: filesData.css, js: filesData.js },
    });
  };

  #handleVersionChange = async ({ id, value: selectedVersion }) => {
    const component = this.#findComponent(id);
    if (!component) return;

    component.selectedVersion = selectedVersion;

    // Fetch new files and overwrite temp files
    const filesData = await fetchData(component);
    await componentFileService.create(component.alias, {
      html: filesData.html,
      css: filesData.css,
      js: filesData.js,
    });

    this.#notify("component:versionChanged", {
      id,
      alias: component.alias,
      selectedVersion,
      files: { html: filesData.html, css: filesData.css, js: filesData.js },
    });
  };

  #handleComponentEdit = async ({ alias, fileType, content }) => {
    const result = await componentFileService.update(alias, fileType, content);

    if (result.success) {
      // Read updated files to notify
      const filesResult = await componentFileService.read(alias);
      if (filesResult.success) {
        this.#notify("component:edited", {
          alias,
          fileType,
          files: filesResult.files,
        });
      }
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  #setFocusedComponent(id) {
    // Remove focus from all
    this.#state.components.forEach((comp) => {
      comp.focused = false;
    });

    // Set focus on specific component
    const component = this.#findComponent(id);
    if (!component) return;

    component.focused = true;

    // Notify with file data
    componentFileService.read(component.alias).then((result) => {
      if (result.success) {
        this.#notify("component:focused", {
          id,
          alias: component.alias,
          files: result.files,
        });
      }
    });
  }

  #fillStateWithMockData() {
    componentsData.forEach((component) => {
      this.#state.components.push({
        id: component.id,
        name: component.name,
        alias: component.alias,
        models: component.models,
        versions: component.versions,
        focused: component.focused,
        isActive: component.isActive,
        selectedModel: component.selectedModel,
        selectedVersion: component.selectedVersion,
      });
    });
  }

  // ============================================
  // EVENT REGISTRATION
  // ============================================

  #registerEventHandlers() {
    observerModule.subscribeTo("form:inputChanged", this.#handleCourseInfoChange);
    observerModule.subscribeTo("color:changed", this.#handleColorChange);
    observerModule.subscribeTo("component:setActivation", this.#handleComponentActivation);
    observerModule.subscribeTo("component:setFocus", this.#handleComponentFocus);
    observerModule.subscribeTo("component:setModel", this.#handleModelChange);
    observerModule.subscribeTo("component:setVersion", this.#handleVersionChange);
    observerModule.subscribeTo("component:edit", this.#handleComponentEdit);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  init() {
    this.#fillStateWithMockData();
    this.#registerEventHandlers();
  }
}

const projectState = new ProjectState();
export default projectState;
```

---

### Passo 3: Atualizar `shadowDOMController.js`

Modificar para escutar o canal unificado `state:changed` e reagir baseado no `type`.

**Arquivo:** `src/renderer/modules/componentManager/shadowDOM/shadowDOMController.js`

**Substituir o método `updateShadowDOM()` por:**

```javascript
updateShadowDOM() {
  observerModule.subscribeTo("state:changed", (data) => {
    const shadowHost = document.getElementById("preview-shadow-host");
    const shadowRoot = shadowHost.shadowRoot;

    switch (data.type) {
      // ========== COLORS ==========
      case "color:updated":
        this.#updateColors(shadowRoot, data.colorKey, data.colorValue);
        break;

      // ========== COMPONENT ACTIVATED/FOCUSED/CHANGED ==========
      case "component:activated":
      case "component:focused":
      case "component:modelChanged":
      case "component:versionChanged":
      case "component:edited":
        this.#updatePreview(shadowRoot, data.files);
        break;

      // ========== COMPONENT DEACTIVATED ==========
      case "component:deactivated":
        this.#clearPreview(shadowRoot);
        break;
    }
  });
}

#updateColors(shadowRoot, colorKey, colorValue) {
  const style = shadowRoot.querySelector("#project-styles");
  let cssVariables = ":host {";
  for (const [key, value] of Object.entries(projectState.get().colorScheme)) {
    cssVariables += `--${key}: ${value};`;
  }
  cssVariables += "}";
  style.textContent = cssVariables;
}

#updatePreview(shadowRoot, files) {
  const shadowHost = document.getElementById("preview-shadow-host");
  shadowHost.style.height = "100%";
  const previewContent = shadowRoot.querySelector(".preview-content");
  previewContent.innerHTML = `
    <style>${files.css}</style>
    ${files.html}
    <script>${files.js}<\/script>
  `;
}

#clearPreview(shadowRoot) {
  const shadowHost = document.getElementById("preview-shadow-host");
  shadowHost.style.height = "100%";
  const previewContent = shadowRoot.querySelector(".preview-content");
  previewContent.innerHTML = "" + CONSTANTS.EMPTY_PREVIEW + "";
}
```

**Nota:** Remover as antigas subscrições separadas:
- ~~`observerModule.subscribeTo("shadowDOM:color:changed", ...)`~~
- ~~`observerModule.subscribeTo("shadowDOM:cleanPreview", ...)`~~
- ~~`observerModule.subscribeTo("shadowDOM:updatePreview", ...)`~~

---

### Passo 4: Verificar import do `componentFileService`

Garantir que o caminho do import está correto no `projectState.js`:

```javascript
import componentFileService from "../../../services/componentFileService.js";
```

Se o arquivo está em `src/services/`, o caminho relativo a partir de `src/renderer/temp/state/` seria:
```javascript
import componentFileService from "../../../../services/componentFileService.js";
```

**Verificar a estrutura real de pastas antes de aplicar.**

---

### Passo 5: Testar os Fluxos

Após aplicar as mudanças, testar:

| Fluxo | Como Testar | Resultado Esperado |
|-------|-------------|-------------------|
| Ativar componente | Toggle ON em um componente | Arquivos criados em `temp/components/`, preview atualizado |
| Desativar componente | Toggle OFF em um componente | Arquivos deletados, preview limpo |
| Mudar foco | Clicar no header de outro componente ativo | Preview atualiza com arquivos do novo componente |
| Mudar modelo | Selecionar outro modelo no dropdown | Arquivos sobrescritos, preview atualizado |
| Mudar versão | Selecionar outra versão no dropdown | Arquivos sobrescritos, preview atualizado |
| Mudar cor | Alterar uma cor no color picker | Variáveis CSS atualizadas no shadow DOM |

---

### Passo 6: Limpeza (Opcional)

Após confirmar que tudo funciona:

1. **Remover arquivos de sugestão aplicados** (se desejar)
2. **Commitar** as mudanças com mensagem clara:
   ```
   refactor: simplify projectState with unified event channel
   
   - Remove html/css/js from state (now in temp files)
   - Extract inline handlers to named methods
   - Unify notifications to single state:changed channel
   - Integrate componentFileService for file management
   ```

---

## 📊 Resumo das Mudanças

| Arquivo | Ação |
|---------|------|
| `componentMockData.js` | Remover `html`, `css`, `js` |
| `projectState.js` | Substituir conteúdo inteiro |
| `shadowDOMController.js` | Atualizar `updateShadowDOM()` |
| Verificar imports | Ajustar caminho do `componentFileService` |

---

## ⚠️ Pontos de Atenção

1. **Ordem de inicialização:** O `componentFileService` deve estar disponível antes do `projectState.init()` ser chamado.

2. **Tratamento de erros:** Se o fetch falhar ou os arquivos não forem criados, o componente não será ativado visualmente mas o estado pode ficar inconsistente. Considerar adicionar rollback.

3. **Canal `component:edit`:** Este é um novo canal. Você precisará disparar esse evento quando o usuário salvar edições na interface de "Customizar Código".
