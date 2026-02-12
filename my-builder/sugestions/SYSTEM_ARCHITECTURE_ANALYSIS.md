# Análise da Arquitetura do Sistema - MyBuilder

**Data:** 2026-02-12
**Horário:** Pós-sessão de refatoração
**Status:** Análise exploratória

---

## 📊 Visão Geral da Arquitetura Atual

O **myBuilder** é uma aplicação Electron que implementa um **sistema de construção de componentes web** com as seguintes características:

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                          │
│  - Janela principal                                      │
│  - Operações de arquivo (CRUD)                          │
│  - Comunicação IPC                                      │
└───────────────────┬─────────────────────────────────────┘
                    │ IPC (ipcMain/ipcRenderer)
                    │
┌───────────────────▼─────────────────────────────────────┐
│                   Preload Script                         │
│  - Ponte de segurança (contextBridge)                  │
│  - Expõe window.api                                     │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  Renderer Process                         │
│  - UI e interações do usuário                           │
│  - Gerenciamento de estado (ProjectState)              │
│  - Sistema de componentes (Shadow DOM)                 │
│  - Observer Pattern (comunicação interna)              │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Pontos Fortes (Manter!)

### 1. **Separação de Processos Electron**
- Uso correto de `contextBridge` para segurança
- Preload script bem estruturado
- APIs expostas de forma controlada

### 2. **Observer Pattern**
- `ObserverModule` para desacoplamento entre módulos
- Eventos bem nomeados (`state:changed`, `color:updated`, etc.)
- Comunicação reativa funciona bem

### 3. **Serviço de Arquivos**
- `componentFileService` abstrai operações de arquivo
- CRUD bem definido para componentes
- Separação entre storage temporário e permanente

### 4. **Shadow DOM para Isolamento**
- Componentes renderizados em Shadow DOM
- Isolamento de CSS funciona corretamente
- Suporte a temas (light/dark)

### 5. **Event Delegation**
- Implementado recentemente no `handleStates.js`
- Melhora performance e reduz listeners

---

## 🚨 Problemas Identificados

### 1. **Responsabilidades Mistas no Main Process**

**Problema:**
```javascript
// main.js está fazendo COISAS DIFERENTES DEMAIS
- Gerencia janela
- Salva imagens
- Gerencia arquivos de componentes
- Cria estrutura de pastas
- Busca arquivos do servidor remoto
```

**Impacto:**
- Difícil de testar
- Difícil de manter
- Viola Single Responsibility Principle

**Sugestão:**
Extrair lógica de negócio para serviços separados:

```javascript
// Estrutura proposta:
src/main/
  ├── index.js           # Apenas criação da janela
  ├── services/
  │   ├── WindowService.js
  │   ├── FileService.js
  │   ├── ComponentService.js
  │   └── RemoteFetchService.js
  └── handlers/
      └── ipcHandlers.js  # Apenas roteamento para serviços
```

---

### 2. **Acoplamento do ProjectState**

**Problema:**
```javascript
// projectState.js tem MUITAS responsabilidades:
- Gerencia estado do curso
- Gerencia cores
- Gerencia assets
- Gerencia componentes
- Notifica observadores
- Interage diretamente com componentFileService
- Interage diretamente com shadowDOM
```

**Impacto:**
- Classe com 500+ linhas
- Difícil de testar
- Mudanças em uma área afetam outras

**Sugestão:**
Dividir em gerenciadores especializados:

```javascript
// Estrutura proposta:
src/renderer/state/
  ├── ProjectState.js         # Orquestrador
  ├── CourseManager.js        # Estado do curso
  ├── ColorManager.js         # Estado das cores
  ├── AssetManager.js         # Estado dos assets
  └── ComponentManager.js    # Estado dos componentes
```

---

### 3. **Estado Mock Misturado com Estado Real**

**Problema:**
```javascript
// projectState.js
this.courseInfo = mockCourseData  // Por que?
this.components = mockComponents  // Mistura!
```

**Impacto:**
- Difícil separar o que é real vs mock
- Possível código de produção usando dados mock
- Confuso para debug

**Sugestão:**
```javascript
// Criar modo de desenvolvimento:
src/renderer/config/
  └── devMode.js

// No init:
if (DEV_MODE) {
  this.loadMockData();
} else {
  this.loadFromStorage();
}
```

---

### 4. **Comunicação Assíncrona sem Controle**

**Problema:**
```javascript
// Bug que acabamos de corrigir:
componentFileService.read(component.alias).then((result) => {
  this.#notify("component:focused", { ... });
  // Se component foi desativado antes do .then(),
  // a notificação ainda dispara!
});
```

**Impacto:**
- Race conditions
- Estados inconsistentes
- Difícil de debugar

**Sugestão:**
Implementar **Cancellation Tokens** ou **Request ID**:

```javascript
// Opção 1: Cancellation Token
const cancellationToken = { cancelled: false };
componentFileService.read(alias, cancellationToken).then((result) => {
  if (!cancellationToken.cancelled) {
    this.#notify("component:focused", { ... });
  }
});

// Quando desativar:
cancellationToken.cancelled = true;

// Opção 2: Request ID (mais robusto)
let requestId = 0;
const currentId = ++requestId;

componentFileService.read(alias).then((result) => {
  if (currentId === requestId) {  // Apenas o último request
    this.#notify("component:focused", { ... });
  }
});
```

---

### 5. **ShadowDOMController Acoplado**

**Problema:**
```javascript
// shadowDOMController.js
this.projectState = projectState;  // Acoplamento direto!

this.projectState.subscribe("state:changed", (data) => {
  // Lógica específica de projectState aqui
});
```

**Impacto:**
- Não consegue reutilizar o controller
- Testar exige mock completo do ProjectState
- Viola Dependency Inversion Principle

**Sugestão:**
Inverter dependência usando interfaces/portas:

```javascript
// shadowDOMController.js
constructor({ themeProvider, componentProvider }) {
  this.themeProvider = themeProvider;
  this.componentProvider = componentProvider;
}

// Uso:
new ShadowDOMController({
  themeProvider: {
    getTheme: () => projectState.currentTheme
  },
  componentProvider: {
    getComponent: (alias) => componentFileService.read(alias)
  }
});
```

---

### 6. **Código Morto e Comentado**

**Problema:**
```javascript
// editMode.js - MUITO código comentado
// componentManagerController.js - Mesmo caso

// /* Código antigo */
// function something() {
//   ...
// }
```

**Impacto:**
- Difícil ler o código real
- Git já guarda o histórico (não precisa comentar)
- Distrap durante manutenção

**Sugestão:**
- **Remover** todo código comentado
- Se precisar ver versão antiga, usar `git log`
- Criar tag git antes de refatorações grandes

---

## 💡 Sugestões de Melhorias

### Prioridade ALTA (Próximas sessões)

#### 1. **Implementar Request ID para Operações Assíncronas**
- Resolve race conditions
- Previne bugs como o do `clearPreview`
- Padrão reutilizável em outros lugares

**Onde aplicar:**
- `projectState.js` - `#setFocusedComponent()`
- `componentFileService.js` - todas operações
- `fetchData.js` - todas operações

#### 2. **Extrair Serviços do Main Process**
- Melhora organização
- Facilita testes
- Segue SRP

**Passos:**
1. Criar `src/main/services/`
2. Mover lógica de handlers para serviços
3. Handlers apenas roteiam

#### 3. **Limpar Código Morto**
- Remover código comentado
- Remover arquivos não usados
- Melhora legibilidade imediatamente

---

### Prioridade MÉDIA (Refatorações futuras)

#### 4. **Dividir ProjectState em Gerenciadores**
- `CourseManager`, `ColorManager`, `AssetManager`, `ComponentManager`
- Cada um com responsabilidade única
- ProjectState vira orquestrador

#### 5. **Inverter Dependência do ShadowDOMController**
- Receber providers via construtor
- Melhor testabilidade
- Reutilizável

#### 6. **Separar Mock de Produção**
- Criar `devMode.js`
- Carregar mock apenas quando necessário
- Evitar confusão

---

### Prioridade BAIXA (Melhorias opcionais)

#### 7. **Implementar Sistema de Plugins**
- Permitir extensões de componentes
- Arquitetura mais flexível

#### 8. **Adicionar Testes Automatizados**
- Testes unitários para serviços
- Testes de integração para IPC
- Melhor confiança em refatorações

#### 9. **Melhorar Logging**
- Sistema estruturado de logs
- Níveis (debug, info, warning, error)
- Facilita debug

---

## 🎯 Próximos Passos Sugeridos

### Imediato (Hoje/amanhã):
1. [ ] Implementar **Request ID** no `projectState.#setFocusedComponent()`
2. [ ] Aplicar mesmo padrão em outras operações assíncronas
3. [ ] Testar fluxo completo para garantir sem race conditions

### Curto Prazo (Próxima semana):
4. [ ] Extrair serviços do `main.js`
5. [ ] Limpar código comentado/morto
6. [ ] Separar mock de produção

### Médio Prazo:
7. [ ] Dividir `ProjectState` em gerenciadores
8. [ ] Inverter dependência do `ShadowDOMController`

---

## 🤔 Questões para Reflexão

1. **Escalabilidade**: Como o sistema se comportaria com 100+ componentes?
2. **Performance**: Shadow DOM para cada componente tem impacto?
3. **Persistência**: O estado é salvo automaticamente ou manual?
4. **Colaboração**: Múltiplos usuários editando o mesmo projeto?
5. **Versionamento**: Como versionar componentes entre projetos?

---

## 📚 Padrões de Projeto Identificados

| Padrão | Onde | Status |
|--------|------|--------|
| Observer | ObserverModule | ✅ Bem implementado |
| Singleton | ProjectState | ⚠️ Deveria ser dividido |
| Service Layer | componentFileService | ✅ Bom |
| Event Delegation | handleStates.js | ✅ Recém-implementado |
| Dependency Injection | - | ❌ Não implementado ainda |

---

## 📊 Métricas de Código

| Métrica | Estimativa | Objetivo |
|---------|-------------|----------|
| Linhas por arquivo | ~300-500 (projectState) | <300 |
| Comentários vs Código | Muito alto (morto) | <10% |
| Acoplamento | Alto | Baixo |
| Coesão | Média | Alta |

---

**Conclusão:**

O sistema tem **fundamentos sólidos** (Observer pattern, Electron security, Service Layer), mas sofre com **acoplamento** e **responsabilidades mistas**. As refatorações recentes foram na direção certa, mas ainda há espaço para evolução.

Focado em **pequenas melhoras incrementais** é melhor que refatoração gigante.
