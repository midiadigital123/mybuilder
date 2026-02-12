# Implementação: Componentes Estruturais (Layout e Tipografia)

**Data:** 2026-02-12
**Status:** Proposta de implementação
**Prioridade:** Alta

---

## 📋 Resumo

Implementar **Layout** e **Tipografia** como componentes especiais que:
- ✓ São **ativos por padrão** ao iniciar o sistema
- ✓ **Não podem ser desativados** pelo usuário
- ✓ **Arquivos são baixados/criados automaticamente**
- ✓ **Código pode ser editado** normalmente
- ✓ **UI reflete essa restrição** (botão desabilitado)

---

## 🎯 Objetivos

1. **Elimina trabalho manual** - Layout/Tipografia sempre prontos
2. **Previn erros** - Impossível esquecer de ativá-los
3. **UI intuitiva** - Usuário entende que são "obrigatórios"
4. **Consistência** - Todo projeto tem base estrutural garantida

---

## 🏗️ Mudanças Necessárias

### 1. Adicionar ao Mock Data

**Arquivo:** `src/renderer/modules/componentManager/mock/componentMockData.js`

```javascript
const componentsData = [
  // ... componentes existentes ...

  // NOVO: Layout (estrutural)
  {
    id: "comp-layout",
    name: "Layout",
    alias: "layout",
    models: ["m1"],
    versions: ["v1"],
    focused: false,
    isActive: true,           // Já inicia ativo
    selectedModel: "m1",
    selectedVersion: "v1",
    isStructural: true,       // NOVA flag
  },

  // NOVO: Tipografia (estrutural)
  {
    id: "comp-tipografia",
    name: "Tipografia",
    alias: "tipografia",
    models: ["m1"],
    versions: ["v1"],
    focused: false,
    isActive: true,           // Já inicia ativo
    selectedModel: "m1",
    selectedVersion: "v1",
    isStructural: true,       // NOVA flag
  },
];
```

**Por que `isStructural`?**
- Permite identificar facilmente quais componentes são obrigatórios
- Útil para validar antes de build (error se não ativo)
- Reutiliza estrutura existente sem criar campo específico

---

### 2. Modificar ProjectState.init()

**Arquivo:** `src/renderer/temp/state/projectState.js`

#### Opção A: Simples e Direta ✅ (RECOMENDADA)

```javascript
async init() {
  this.#fillStateWithMockData();

  // NOVO: Ativar componentes estruturais automaticamente
  await this.#activateStructuralComponents();

  this.#registerEventHandlers();
}

/**
 * Ativa Layout e Tipografia automaticamente ao iniciar
 * Busca arquivos do servidor e cria arquivos temporários
 */
async #activateStructuralComponents() {
  const structuralComponents = this.#state.components.filter(
    comp => comp.isStructural === true
  );

  for (const component of structuralComponents) {
    if (!component.isActive) {
      console.log(`🏗️ Ativando componente estrutural: ${component.name}`);

      // Busca arquivos do servidor
      const filesData = await fetchData(component);

      // Cria arquivos temporários
      const result = await componentFileService.create(component.alias, {
        html: filesData.html,
        css: filesData.css,
        js: filesData.js,
      });

      if (result.success) {
        component.isActive = true;
        console.log(`✅ ${component.name} ativado com sucesso`);
      } else {
        console.error(`❌ Falha ao ativar ${component.name}`);
      }
    }
  }
}
```

**Vantagens:**
- Simples de entender
- Fluxo igual a componentes normais
- Fácil debugar
- Se falhar em um, não afeta o outro

#### Opção B: Mais Robusta

```javascript
async #activateStructuralComponents() {
  const structuralComponents = this.#state.components.filter(
    comp => comp.isStructural === true
  );

  // Ativa todos em paralelo (mais rápido)
  const results = await Promise.allSettled(
    structuralComponents.map(async (component) => {
      const filesData = await fetchData(component);
      return await componentFileService.create(component.alias, {
        html: filesData.html,
        css: filesData.css,
        js: filesData.js,
      });
    })
  );

  // Verifica erros
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      structuralComponents[index].isActive = true;
      console.log(`✅ ${structuralComponents[index].name} ativado`);
    } else {
      console.error(`❌ Falha: ${structuralComponents[index].name}`, result.reason);
    }
  });
}
```

**Vantagens:**
- Paralelismo = mais rápido
- `Promise.allSettled` = não falha tudo se um erro

**Desvantagens:**
- Complexidade extra
- Difícil debugar qual falhou

**Recomendação:** Começar com **Opção A**, evoluir para B se precisar.

---

### 3. Previnir Desativação

**Arquivo:** `src/renderer/temp/state/projectState.js`

```javascript
#handleComponentActivation = async ({ id, value }) => {
  const component = this.#findComponent(id);
  if (!component) return;

  // NOVO: Previnir desativação de componentes estruturais
  if (component.isStructural && !value) {
    console.warn(`⚠️ Componente estrutural "${component.name}" não pode ser desativado`);
    this.#notify("component:structuralLocked", {
      id,
      name: component.name,
      message: `${component.name} é um componente estrutural e não pode ser desativado`
    });
    return; // Retorna sem fazer nada
  }

  component.isActive = value;
  // ... resto do código existing ...
}
```

**Resultado:** Se usuário tentar desativar, nada acontece e aparece warning no console.

**Melhoria opcional:** Notificar UI para mostrar toast/alerta:

```javascript
// No return acima, adicionar:
this.#notify("alert:show", {
  type: "warning",
  message: `${component.name} não pode ser desativado`
});
```

---

### 4. Atualizar UI (handleStates.js)

**Arquivo:** `src/renderer/modules/componentManager/handleStates.js`

```javascript
const handleStates = () => {
  const container = document.querySelector(".components-container");

  // Event delegation para cliques nos componentes
  container.addEventListener("click", (e) => {
    const toggle = e.target.closest(".component-toggle");
    if (!toggle) return;

    const componentCard = toggle.closest(".component-card");
    const componentId = componentCard.dataset.id;

    // NOVO: Verificar se é estrutural
    const component = projectState.get().components.find(
      c => c.id === componentId
    );

    if (component.isStructural) {
      // Mostra tooltip ou toast
      showStructuralWarning(component.name);
      return;
    }

    // Toggle normal (código existente)
    const isActive = toggle.classList.contains("active");
    toggle.classList.toggle("active");
    // ... resto do código ...
  });
};

function showStructuralWarning(componentName) {
  // Mostra alerta visual
  const alert = document.createElement("div");
  alert.className = "alert alert-warning alert-dismissible fade show";
  alert.innerHTML = `
    <strong>⚠️ Atenção!</strong>
    ${componentName} é um componente estrutural e não pode ser desativado.
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  // Insere no topo da página ou área de alertas
  document.querySelector(".alerts-container").appendChild(alert);

  // Remove automaticamente após 5 segundos
  setTimeout(() => alert.remove(), 5000);
}
```

---

### 5. Visual na UI (CSS/HTML)

#### 5.1. Desabilitar Toggle Visualmente

**CSS:**

```css
/* Componente estrutural - botão desabilitado */
.component-card[data-structural="true"] .component-toggle {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none; /* Não recebe cliques */
}

/* Badge "Estrutural" */
.component-card[data-structural="true"]::after {
  content: "Estrutural";
  position: absolute;
  top: 10px;
  right: 10px;
  background: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

#### 5.2. HTML Gerado

**Resultado esperado:**

```html
<div class="component-card" data-id="comp-layout" data-structural="true">
  <span class="badge bg-secondary">Estrutural</span>

  <h3>Layout</h3>

  <select class="form-select model-select">
    <option value="m1">Modelo 1</option>
  </select>

  <select class="form-select version-select">
    <option value="v1">Versão 1</option>
  </select>

  <!-- Toggle desabilitado visualmente -->
  <button class="btn component-toggle active" disabled>
    ✓ Ativo
  </button>

  <button class="btn btn-customize">
    ✏️ Editar Código
  </button>
</div>
```

---

### 6. Focar Automaticamente no Primeiro

**Opção útil:** Ao iniciar, focar no Layout automaticamente.

**Arquivo:** `projectState.js`

```javascript
async #activateStructuralComponents() {
  // ... código de ativação ...

  // NOVO: Focar no primeiro componente estrutural
  const firstStructural = this.#state.components.find(
    comp => comp.isStructural === true
  );

  if (firstStructural) {
    this.#setFocusedComponent(firstStructural.id);
  }
}
```

**Benefício:** Usuário já vê o Layout no preview ao abrir o app.

---

## 📊 Fluxo Completo

```
1. Usuário abre o app
   ↓
2. projectState.init()
   ↓
3. #fillStateWithMockData()
   → Layout: isActive = true, isStructural = true
   → Tipografia: isActive = true, isStructural = true
   ↓
4. #activateStructuralComponents()
   ↓
5. Para cada componente estrutural:
   ├─ fetchData(alias, model, version)
   │  → https://.../layout/m1v1/index.html
   │  → https://.../layout/m1v1/style.css
   │  → https://.../layout/m1v1/script.js
   ↓
   ├─ componentFileService.create()
   │  → .vite/build/2026-X/temp/components/layout.html
   │  → .vite/build/2026-X/temp/components/layout.css
   │  → .vite/build/2026-X/temp/components/layout.js
   ↓
   └─ component.isActive = true
   ↓
6. #setFocusedComponent("comp-layout")
   ↓
7. Observer: component:focused
   ↓
8. shadowDOMController.updatePreview()
   ↓
9. Preview mostra Layout com cores do tema
   ↓
10. UI mostra cards de Layout/Tipografia:
    - ✓ Badge "Estrutural"
    - ✓ Toggle ativo (desabilitado visualmente)
    - ✓ Selects funcionando
```

---

## 🧪 Testes Manuais

### Checklist de Verificação:

#### Funcionalidades
- [ ] Layout e Tipografia aparecem na lista de componentes
- [ ] Ambos iniciam com `isActive = true`
- [ ] Arquivos foram criados em `/temp/components/`
- [ ] Preview mostra o Layout automaticamente
- [ ] Trocar modelo/versão funciona
- [ ] Editar código funciona

#### Segurança
- [ ] Não é possível desativar Layout (nada acontece)
- [ ] Não é possível desativar Tipografia (nada acontece)
- [ ] Console mostra warning ao tentar desativar
- [ ] UI mostra alerta/toast ao tentar desativar

#### Visual
- [ ] Badge "Estrutural" aparece no card
- [ ] Toggle aparece desabilitado (cinza, cursor not-allowed)
- [ ] Não dá para clicar no toggle
- [ ] Selects de modelo/versão funcionam

#### Edge Cases
- [ ] Se servidor cair, app não crasha
- [ ] Se arquivo não existe, erro é tratado
- [ ] Se usuário fechar app sem salvar, estado volta certo

---

## 🚨 Possíveis Problemas

### 1. Race Condition no Init

**Problema:**
Se `init()` for assíncrono e algo tentar usar componentes antes da ativação terminar.

**Solução:**
```javascript
init() {
  this.#fillStateWithMockData();
  this.#registerEventHandlers();

  // Aguarda ativação estrutural terminar
  return this.#activateStructuralComponents();
}

// Uso:
await projectState.init();
// Agora é seguro usar
```

### 2. Servidor Indisponível

**Problema:**
Se `recursos-moodle.caeddigital.net` cair, componentes estruturais não ativam.

**Solução:**
```javascript
async #activateStructuralComponents() {
  // ... código ...

  if (result.success) {
    component.isActive = true;
  } else {
    console.error(`❌ Falha: ${component.name}`);

    // Mostra erro na UI
    this.#notify("structural:error", {
      component: component.name,
      message: "Não foi possível carregar componente estrutural"
    });
  }
}
```

### 3. Mock Data vs API

**Problema:**
Hoje tem mock, mas API vem depois.

**Solução:**
```javascript
// mock/componentMockData.js
export default [
  // ...
  {
    id: "comp-layout",
    name: "Layout",
    alias: "layout",
    // ...
    isStructural: true,  // Flag funciona em ambos
  }
];

// API futura também deve retornar:
{
  "components": [
    {
      "alias": "layout",
      "isStructural": true  // ← API deve incluir isso
    }
  ]
}
```

---

## 💡 Melhorias Futuras

### Fase 1: Mínimo Viável (agora)
- [x] Adicionar `isStructural` ao mock
- [x] Auto-ativar no `init()`
- [x] Previnir desativação
- [x] Desabilitar botão na UI

### Fase 2: Melhorias de UX
- [ ] Badge "Estrutural" com tooltip explicativo
- [ ] Toast/alerta amigável ao tentar desativar
- [ ] Ícone diferente (🏗️) ao invés de toggle
- [ ] Seção separada na UI ("Componentes Estruturais")

### Fase 3: Validação na Build
- [ ] Verificar se estruturais estão ativos antes de buildar
- [ ] Error se não estiverem (impossível, mas seguro)
- [ ] Log de qual versão de layout/tipografia foi usada

### Fase 4: Configuração Avançada
- [ ] Permitir "esconder" estruturais (mas não desativar)
- [ ] Permitir reordenar qual aparece primeiro no preview
- [ ] Salvar preferências do usuário (qual focar por padrão)

---

## 📝 Resumo da Implementação

| Arquivo | Mudança | Complexidade |
|---------|----------|--------------|
| `mock/componentMockData.js` | Adicionar Layout/Tipografia + flag `isStructural` | ⭐ Baixa |
| `projectState.js` | Adicionar `#activateStructuralComponents()` e check no `#handleComponentActivation` | ⭐⭐ Média |
| `handleStates.js` | Adicionar verificação `isStructural` no clique | ⭐ Baixa |
| CSS | Estilo para card estrutural + badge | ⭐ Baixa |
| HTML (opcional) | Adicionar área de alertas/toast | ⭐⭐ Média |

**Estimativa de tempo:** 2-3 horas para implementação completa.

---

## 🎯 Decisões de Design

| Decisão | Escolha | Justificativa |
|----------|----------|---------------|
| **Flag para identificar** | `isStructural: boolean` | Simples, extensível |
| **Ativação automática** | No `init()` do ProjectState | Garante que sempre ativos |
| **Prevenção de desativação** | Early return no handler | Simples, não quebra fluxo |
| **Feedback visual** | Badge + botão desabilitado | Clear, não intrusivo |
| **Código editável** | Permite edição normal | Flexibilidade mantida |

---

## ✅ Próximos Passos

1. **Implementar mudanças mock** (5 min)
2. **Implementar auto-ativação** (30 min)
3. **Previnir desativação** (15 min)
4. **Atualizar UI com CSS** (20 min)
5. **Testar manualmente** (30 min)
6. **Documentar mudança** (10 min)

**Total:** ~2 horas de trabalho focado.

---

**Conclusão:**

Implementação de **baixa complexidade** e **alto valor**. Remove carga manual, previne erros e melhora UX. Flag `isStructural` é extensível para outros componentes futuros que precisem ser obrigatórios.

Recomendo começar com **Opção A** (simples) e evoluir conforme necessidade.
