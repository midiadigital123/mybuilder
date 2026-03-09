# Sequência de Commits - Componentes Estruturais

**Data:** 2026-02-12
**Branch:** `separacao-de-codigo`
**Objetivo:** Implementar Layout e Tipografia como componentes estruturais

---

## 📋 Ordem de Commits

Cada commit deve ser **atômico** (uma mudança por vez) com mensagem clara.

---

### Commit 1: Adicionar Componentes Estruturais ao Mock

**Arquivo:** `src/renderer/modules/componentManager/mock/componentMockData.js`

**O que fazer:**
- Adicionar Layout (`id: "comp-layout"`)
- Adicionar Tipografia (`id: "comp-tipografia"`)
- Adicionar flag `isStructural: true` para ambos
- Setar `isActive: true` para ambos

**Comando:**
```bash
git add src/renderer/modules/componentManager/mock/componentMockData.js
git commit -m "feat: adiciona componentes estruturais (Layout e Tipografia) ao mock data

- Adiciona Layout com isStructural: true
- Adiciona Tipografia com isStructural: true
- Componentes iniciam como isActive: true
- Prepara para auto-ativação no init()"
```

---

### Commit 2: Implementar Auto-Ativação de Estruturais

**Arquivo:** `src/renderer/temp/state/projectState.js`

**O que fazer:**
1. Criar método `#activateStructuralComponents()`
2. Chamar esse método no `init()` antes de registrar eventos
3. Método deve:
   - Filtrar componentes com `isStructural: true`
   - Para cada um: fazer `fetchData()` + `componentFileService.create()`
   - Logar sucesso/erro

**Comando:**
```bash
git add src/renderer/temp/state/projectState.js
git commit -m "feat: implementa auto-ativação de componentes estruturais no init

- Cria método #activateStructuralComponents()
- Busca arquivos do servidor automaticamente
- Cria arquivos temporários para Layout e Tipografia
- Executa antes de registrar eventos"
```

---

### Commit 3: Previnir Desativação de Estruturais

**Arquivo:** `src/renderer/temp/state/projectState.js`

**O que fazer:**
- No início de `#handleComponentActivation()`, verificar:
  ```javascript
  if (component.isStructural && !value) {
    console.warn(...);
    return;
  }
  ```

**Comando:**
```bash
git add src/renderer/temp/state/projectState.js
git commit -m "feat: previne desativação de componentes estruturais

- Verifica isStructural antes de desativar
- Retorna early sem executar lógica de desativação
- Loga warning no console"
```

---

### Commit 4: Adicionar Badge Estrutural na UI

**Arquivo:** CSS do componentManager (descobrir qual arquivo)

**O que fazer:**
- Adicionar CSS para badge `::after` com texto "Estrutural"
- Adicionar estilo para quando `data-structural="true"`

**Comando:**
```bash
git add src/renderer/modules/componentManager/[arquivo-css]
git commit -m "style: adiciona badge visual para componentes estruturais

- Badge 'Estrutural' no topo do card
- Aplica quando data-structural='true'
- Estilo cinza escuro"
```

---

### Commit 5: Desabilitar Toggle de Estruturais

**Arquivo:** `src/renderer/modules/componentManager/handleStates.js`

**O que fazer:**
- No event listener do toggle, verificar `isStructural`
- Se for estrutural, mostrar mensagem e não executar toggle

**Comando:**
```bash
git add src/renderer/modules/componentManager/handleStates.js
git commit -m "feat: desabilita toggle para componentes estruturais

- Verifica isStructural antes de toggle
- Mostra warning visual ao tentar desativar
- Não executa lógica de ativação/desativação"
```

---

### Commit 6: Adicionar CSS para Toggle Desabilitado

**Arquivo:** CSS do componentManager

**O que fazer:**
- Adicionar regra para `.component-card[data-structural="true"] .component-toggle`
- Setar `opacity: 0.6`, `cursor: not-allowed`, `pointer-events: none`

**Comando:**
```bash
git add src/renderer/modules/componentManager/[arquivo-css]
git commit -m "style: desabilita visualmente toggle de componentes estruturais

- Toggle fica com opacidade reduzida
- Cursor muda para 'not-allowed'
- Remove pointer-events para impedir cliques"
```

---

### Commit 7: Atualizar README (Opcional)

**Arquivo:** `README.md`

**O que fazer:**
- Adicionar nota sobre componentes estruturais
- Explicar que Layout/Tipografia são obrigatórios

**Comando:**
```bash
git add README.md
git commit -m "docs: documenta componentes estruturais no README

- Layout e Tipografia são sempre ativos
- Não podem ser desativados
- Explicação do conceito"
```

---

## 🔄 Verificação Entre Commits

Após cada commit, verifique:

```bash
# Ver o que mudou
git show HEAD --stat

# Ver diff completo
git show HEAD

# Testar aplicação
npm start
```

---

## 🚀 Sequência Completa (Script)

Caso queira executar tudo de uma vez (após fazer TODAS as mudanças):

```bash
# Commit 1
git add src/renderer/modules/componentManager/mock/componentMockData.js
git commit -m "feat: adiciona componentes estruturais (Layout e Tipografia) ao mock data"

# Commit 2
git add src/renderer/temp/state/projectState.js
git commit -m "feat: implementa auto-ativação de componentes estruturais no init"

# Commit 3
git add src/renderer/temp/state/projectState.js
git commit -m "feat: previne desativação de componentes estruturais"

# Commit 4
git add src/renderer/modules/componentManager/[css-file]
git commit -m "style: adiciona badge visual para componentes estruturais"

# Commit 5
git add src/renderer/modules/componentManager/handleStates.js
git commit -m "feat: desabilita toggle para componentes estruturais"

# Commit 6
git add src/renderer/modules/componentManager/[css-file]
git commit -m "style: desabilita visualmente toggle de componentes estruturais"

# Commit 7 (opcional)
git add README.md
git commit -m "docs: documenta componentes estruturais no README"
```

---

## 📊 Histórico Final Esperado

```bash
git log --oneline -7

# Saída esperada:
a1b2c3d docs: documenta componentes estruturais no README
b2c3d4e style: desabilita visualmente toggle de componentes estruturais
c3d4e5f feat: desabilita toggle para componentes estruturais
d4e5f6g style: adiciona badge visual para componentes estruturais
e5f6g7h feat: previne desativação de componentes estruturais
f6g7h8i feat: implementa auto-ativação de componentes estruturais no init
g7h8i9j feat: adiciona componentes estruturais (Layout e Tipografia) ao mock data
```

---

## 💡 Dicas de Boas Práticas

### Prefix de Commits
- `feat:` nova funcionalidade
- `style:` mudanças de CSS
- `fix:` correção de bug
- `docs:` documentação
- `refactor:` refatoração
- `test:` adição de testes

### Mensagens de Commit
- **Primeira linha:** resumo curto (50 caracteres)
- **Linhas seguintes:** detalhes em bullet points
- **Imperativo:** "adiciona" não "adicionando" ou "adicionado"

### Exemplo:
```
feat: adiciona auto-ativação de componentes estruturais

- Cria método #activateStructuralComponents()
- Busca arquivos do servidor automaticamente
- Executa no init() antes de registrar eventos
- Garante que Layout e Tipografia estão sempre ativos
```

---

## ⚠️ Antes de Push

Antes de dar push para origin/main:

```bash
# 1. Verificar branch atual
git branch

# 2. Verificar se está em separacao-de-codigo
# Se não, mudar:
git checkout separacao-de-codigo

# 3. Verificar commits
git log --oneline -10

# 4. Verificar se há mudanças não commitadas
git status

# 5. Fazer pull dos changes remotos (se houver)
git pull origin separacao-de-codigo

# 6. Push
git push origin separacao-de-codigo
```

---

## 🎯 Checklist Antes de Começar

- [ ] Estou no branch `separacao-de-codigo`
- [ ] Li completamente o documento `COMPONENTES_ESTRUTURAIS_IMPLEMENTACAO.md`
- [ ] Entendo a ordem lógica dos commits
- [ ] Sei quais arquivos preciso alterar
- [ ] Testarei após cada commit

---

**Boa sorte!** 🚀
