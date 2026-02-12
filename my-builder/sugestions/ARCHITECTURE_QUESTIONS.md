# Perguntas e Questionamentos sobre a Arquitetura

**Data:** 2026-02-12
**Propósito:** Entender as decisões arquiteturais antes de propor mudanças

---

## 🎯 Entendimento Atual do Sistema

### O que é o myBuilder?
Uma aplicação Electron para **criar e gerenciar projetos de cursos** que serão integrados a plataformas de ensino (Moodle).

### Fluxo básico identificado:
```
1. Usuário inicia um projeto
   ↓
2. Configura infos do curso (nome, tempo, classe)
   ↓
3. Escolhe paleta de cores (light/dark)
   ↓
4. Faz upload de assets (imagens)
   ↓
5. Ativa componentes (Destaque, Citação, Tipografia, etc.)
   ↓
6. Para cada componente: escolhe modelo + versão
   ↓
7. (Opcional) Edita HTML/CSS/JS dos componentes
   ↓
8. Preview em tempo real com Shadow DOM
   ↓
9. [TODO] Gera build final para Moodle
```

---

## ❓ Perguntas Fundamentais

### 1. **Propósito dos Arquivos Temporários**

**Observação:**
Você criou toda uma arquitetura de arquivos temporários em `.vite/build/2026-X/temp/components/` que são criados quando um componente é ativado e deletados quando desativado.

**Minha dúvida:**
Por que **arquivos em disco** ao invés de manter na **memória**?

**Opções que vejo:**

| Abordagem | Vantagens | Desvantagens |
|-----------|-----------|--------------|
| **Arquivos temp (atual)** | • Persiste se app crashar<br>• Fácil debug (pode abrir o arquivo)<br>• Possível integração com editores externos | • I/O de disco é lento<br>• Precisa gerenciar ciclo de vida<br>• Complexidade extra |
| **Memória** | • Performance muito melhor<br>• Zero latência<br>• Código mais simples | • Perde dados se crashar<br>• Difícil debug |

**Perguntas:**
- Você planeja permitir edição com **editores externos** (VS Code, Sublime)?
- O **crash do app** é um cenário real que precisa ser protegido?
- A performance de I/O foi um problema ou vai ser?

---

### 2. **Mock Data Hardcoded**

**Observação:**
O `projectState.js` carrega dados mockados hardcoded do `componentMockData.js`:

```javascript
#fillStateWithMockData() {
  componentsData.forEach((component) => {
    this.#state.components.push({ ... });
  });
}
```

**Minha dúvida:**
Por que **hardcoded** ao invés de carregar de um arquivo de configuração ou API?

**Perguntas:**
- Essa lista de componentes **muda frequentemente**?
- Como você planeja **adicionar novos componentes** no futuro?
- A lista de modelos/versões é **dinâmica** (vem do servidor) ou **estática**?
- Existe um **endpoint de API** que lista componentes disponíveis?
- O mock é só para **desenvolvimento** ou ficará em **produção**?

**Ideia que me vem:**
Não seria melhor ter:
```javascript
// Desenvolvimento
if (DEV_MODE) {
  this.#loadMockComponents();
}

// Produção
else {
  this.#await fetch('https://api.seuservico.com/components')
    .then(comps => this.#state.components = comps);
}
```

---

### 3. **Modelos e Versões**

**Observação:**
Cada componente tem `models` e `versions`:
```javascript
{
  alias: "destaque",
  models: ["m1", "m2", "m3", "m4"],
  versions: ["v1", "v2", "v3"]
}
```

E os arquivos no servidor seguem o padrão:
```
https://recursos-moodle.caeddigital.net/projetos/componentes/2026/destaque/m1v1/index.html
                                                                    ^^^^ ^^
                                                                    modelo versão
```

**Minhas dúvidas:**

**Sobre Modelos:**
- O que significa **m1, m2, m3, m4**? São layouts diferentes?
- Os modelos são **mutuamente exclusivos**? (só pode ter um por vez?)
- Por que não ter nomes mais descritivos como "layout-simple", "layout-card", etc?

**Sobre Versões:**
- **v1, v2, v3** são correções de bugs ou funcionalidades diferentes?
- Por que alguém escolheria **v1** se existe **v3**? (compatibilidade?)
- As versões são **globais** (todos componentes) ou **por componente**?

**Sobre a combinação:**
- **m1v1, m1v2, m2v1, m2v2** = 4 combinações possíveis?
- Todas as combinações são **válidas**? Ou alguns modelos não têm certas versões?

---

### 4. **Shadow DOM vs Outras Abordagens**

**Observação:**
Você usa **Shadow DOM** para isolar o preview dos componentes.

**Minha dúvida:**
Por que **Shadow DOM** ao invés de:

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Shadow DOM (atual)** | • Isolamento de CSS perfeito<br>• Pode ter variáveis CSS locais<br>• Nativo do browser | • Complexidade extra<br>• Web Components devem ser usados<br>• Limitações com scripts globais |
| **iframe** | • Isolamento completo (CSS + JS)<br>• Sandbox de segurança<br>• Mais comum | • Performance pior<br>• Comunicação mais complexa |
| **Renderização normal** | • Simples<br>• Performance melhor<br>• Fácil debug | • CSS pode vazar<br>• Conflitos com nomes |

**Perguntas:**
- Você teve **problemas com CSS vazando** antes?
- Precisa de **variáveis CSS diferentes** para cada componente?
- Os componentes usam **scripts globais** (como Bootstrap) que precisam do contexto principal?

---

### 5. **Product: A Build Final**

**Observação:**
No `TODO.md` você fala sobre build:

```markdown
# O que ainda falta fazer?
-> Preciso estruturar o sistema de build usando SASS.
-> Para efetuar a build, preciso montar um arquivo CSS completo
-> Preciso criar a função do backend que monta a estrutura e cria as pastas finais
```

**Minha dúvida:**
Qual será **exatamente** o produto final da build?

**Perguntas:**
1. **Formato de saída:**
   - É um **ZIP** com arquivos HTML/CSS/JS?
   - É uma **estrutura de pastas** para copiar para o Moodle?
   - É um **arquivo único** (tipo SCORM)?

2. **O que entra na build:**
   - Apenas os componentes **ativos**?
   - Todos os componentes mesmo os inativos?
   - Scripts globais (Bootstrap, Highlight.js) entram?

3. **CSS final:**
   - Será **um arquivo CSS único** com tudo inline?
   - Múltiplos arquivos CSS separados por componente?
   - Usa **SASS** ou **CSS puro**?

4. **Integração com Moodle:**
   - Qual o formato que o Moodle espera?
   - Há um **manifest.xml** ou arquivo de configuração?
   - Como o Moodle sabe quais componentes usar?

5. **Personalizações do usuário:**
   - Se o usuário **editou o código** de um componente, isso vai para a build?
   - As **cores personalizadas** ficam hardcoded no CSS?
   - Os **assets (imagens)** são copiados ou referenciados por URL?

---

### 6. **Fluxo de Persistência**

**Observação:**
Não vi nenhum código que **salva o projeto** do usuário para continuar depois.

**Minha dúvida:**
Como o usuário **salva seu trabalho**?

**Perguntas:**
- Existe um botão **"Salvar Projeto"**?
- O projeto é salvo em **JSON**, **SQLite**, **arquivo binário**?
- Ao abrir o app novamente, como o usuário **continua um projeto anterior**?
- Existe **autossalvo** automático?
- O usuário pode ter **múltiplos projetos** simultâneos?

**Ideia:**
Talvez algo como:
```javascript
// Salvar estado atual
projectState.saveToFile("~/meus-projeto/curso-x.json");

// Carregar projeto existente
projectState.loadFromFile("~/meus-projeto/curso-x.json");
```

---

### 7. **Preview Mode vs Edit Mode**

**Observação:**
Existem arquivos `previewMode.js` e `editMode.js` mas ambos estão **completamente comentados**.

**Minha dúvida:**
Qual a **diferença** entre preview mode e edit mode?

**Perguntas:**
- **Edit Mode** é para editar HTML/CSS/JS com um editor de código?
- Vai usar um editor como **CodeMirror**, **Monaco**, **Ace**?
- Como o usuário **alterna** entre preview e edit?
- As mudanças no edit mode são **WYSIWYG** (ao vivo) ou precisam clicar "Apply"?
- Existe um **diff** para ver o que mudou?

---

### 8. **Estrutura de Pastas: {YEAR}-X**

**Observação:**
Todos os arquivos ficam em pastas como `2026-X/`:
```
2026-X/
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
├── content/docs/
└── temp/components/
```

**Minha dúvida:**
Por que esse padrão `{YEAR}-X`?

**Perguntas:**
- O **"X"** significa algo? É um contador?
- Você trabalha com **múltiplos anos simultaneamente**?
- Se um projeto é de 2025, muda toda a estrutura?
- Por que não usar o **nome do projeto** ou um **UUID**?
- Existe um **calendar publishing** onde cada ano é uma edição?

---

### 9. **Componentes Especiais (Layout, Tipografia)**

**Observação:**
No `TODO.md` você menciona:

```markdown
-> O que fazer com a tipografia? Ela vai se tornar um componente no electron app?
-> Posso considerar que 'layout', 'tipografia' farão parte dos componentes
   mas que eles não poderão ser desativados.
```

**Minha dúvida:**
Como você pensa em diferenciar **componentes normais** de **componentes de sistema**?

**Perguntas:**
- **Tipografia** é um componente ou configuração global?
- Se é componente, por que **não pode ser desativado**?
- Como funciona a **herança** de tipografia para os outros componentes?
- Não seria melhor um arquivo **base.css** com essas configs ao invés de "componente"?

---

### 10. **Observador de Mudanças (Observer Pattern)**

**Observação:**
Você implementou um **Observer pattern** customizado (`observerModule.js`).

**Minha dúvida:**
Por que ** Observer customizado** ao invés de:

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Observer customizado (atual)** | • Controle total<br>• Simplificado para suas necessidades<br>• Zero dependências | • Mais código para manter<br>• Menos recursos que soluções maduras |
| **EventEmitter (Node)** | • Nativo do Node.js<br>• Bem testado<br>• API padrão da indústria | • Mais pesado |
| **BroadcastChannel** | • Comunica entre contexts (iframes)<br>• Nativo | • API menos intuitiva |
| **Redux/Zustand** | • Estado centralizado<br>• DevTools<br>• Time-travel debug | • Curva de aprendizado<br>• Overkill para simples cases |

**Perguntas:**
- O Observer customizado atende todas suas necessidades?
- Você precisa de **recursos avançados** (once, off, namespaces)?
- Já considerou usar **EventEmitter2** ou similar?

---

### 11. **Comunicação Assíncrona (Race Conditions)**

**Observação:**
Nós acabamos de corrigir um bug de race condition no `#setFocusedComponent()`:

```javascript
componentFileService.read(component.alias).then((result) => {
  if (result.success && component.isActive) {  // ← Verificação adicionada
    this.#notify("component:focused", { ... });
  }
});
```

**Minha dúvida:**
Você considera esse pattern (adicionar verificação no `.then()`) a **melhor solução**?

**Opções:**

| Opção | Complexidade | Robustez |
|-------|--------------|-----------|
| **Verificação no .then()** (atual) | Baixa | Média |
| **Cancellation Tokens** | Média | Alta |
| **Request ID** | Média | Alta |
| **AbortController** | Baixa | Alta |

**Perguntas:**
- Race conditions são **comuns** no sistema?
- Você prefere **prevenir** (cancelar request) ou **curar** (verificar no resultado)?
- Já pensou em usar **AbortController** nativo?

---

### 12. **Componentes no Servidor Remoto**

**Observação:**
Os componentes são buscados de:
```
https://recursos-moodle.caeddigital.net/projetos/componentes/2026/
```

**Minha dúvida:**
Por que **servidor remoto** ao invés de **bundle com o app**?

**Perguntas:**
- Os componentes **mudam dinamicamente** no servidor?
- Você quer **atualizar componentes** sem precisar atualizar o app?
- Existe um **workflow de aprovação** para novos componentes?
- O que acontece se o **servidor cair** ou não tiver internet?
- Os componentes são **públicos** ou **privados** (autenticação)?
- Não seria melhor ter um **cache local** e fallback?

---

## 🤔 Questões de Design

### 13. **Nomenclatura em Inglês vs Português**

**Observação:**
O código tem um **mix** de inglês e português:
- Variáveis: `colorScheme`, `components` (inglês)
- Comentários: "Criado arquivo de sugestão" (português)
- Eventos: `component:focused`, `color:updated` (inglês)
- TODOs: "O que ainda falta fazer?" (português)

**Minha dúvida:**
Qual a estratégia de **internacionalização**?

**Perguntas:**
- O **código deve ser 100% em inglês**?
- **Comentários e TODOs** devem ser em qual idioma?
- Existe uma **convenência de codificação** definida?
- A interface do usuário (UI) será **bilingue** ou só português?

---

### 14. **Constantes (CONSTANTS.js)**

**Observação:**
Existe um arquivo `CONSTANTS.js` mas não tive acesso a ele.

**Perguntas:**
- O que tem nesse arquivo?
- Por que `CONSTANTS.YEAR` é uma constante se muda todo ano?
- Não seria melhor ter um **config file** (JSON/TOML) para isso?

---

## 🎨 Perguntas sobre UX

### 15. **Fluxo de Uso do Usuário**

**Observação:**
Pela estrutura, o fluxo parece ser:
1. Preenche form
2. Escolhe cores
3. Ativa componentes
4. Preview
5. (Opcional) Edita código
6. Gera build

**Minha dúvida:**
Esse fluxo foi **testado com usuários reais**?

**Perguntas:**
- Usuários reclamaram que o fluxo é **muito linear**?
- Existe **undo/redo** para mudanças?
- O usuário pode **voltar passos** ou só avança?
- Existe **wizard/guided tour** para primeira vez?
- O que acontece se o usuário **fechar o app sem salvar**?

---

## 📊 Perguntas sobre Performance

### 16. **Escalabilidade**

**Observação:**
Você tem 3 componentes no mock (Destaque, Citação, Tipografia).

**Minha dúvida:**
Como o sistema se comporta com **muitos componentes**?

**Perguntas:**
- Qual o **número máximo** de componentes esperado?
- Se um projeto tiver **50 componentes ativos**, a performance é aceitável?
- Shadow DOM para cada componente tem **custo de memória**?
- Já fez **testes de carga**?
- O preview precisa recarregar **todos** ou só o que mudou?

---

## 🔒 Perguntas sobre Segurança

### 17. **Código de Terceiros nos Componentes**

**Observação:**
Os componentes vêm de um servidor remoto e podem ter **scripts arbitrários**.

**Minha dúvida:**
Existe algum tipo de **sanitização** ou **sandbox**?

**Perguntas:**
- Você **confia** em todos os componentes do servidor?
- O que acontece se um componente tiver **código malicioso**?
- Shadow DOM isola **CSS** mas não **JS** (executa no contexto principal)
- Existe **Content Security Policy (CSP)**?
- O **preview mode** deveria estar em um iframe isolado?

---

## 🧪 Perguntas sobre Testes

### 18. **Estratégia de Testes**

**Observação:**
Não vi nenhum código de testes.

**Perguntas:**
- Você planeja adicionar **testes automatizados**?
- **Unit tests** para serviços?
- **Integration tests** para IPC?
- **E2E tests** com Playwright/Spectron?
- Como você garante que **refatorações** não quebram nada?

---

## 📦 Perguntas sobre Distribuição

### 19. **Deploy e Atualizações**

**Observação:**
É uma app Electron com `electron-forge`.

**Perguntas:**
- Como você distribui para os usuários?
- Existe **auto-update** (electron-updater)?
- É **software interno** da CAED ou público?
- Precisa de **instalador** ou portable basta?
- Como você **versiona** as releases?

---

## 🎯 Minhas Principais Incertezas

### TOP 5 - O que eu mais preciso entender:

1. **🥇 Por que arquivos temporários em disco?**
   - Memória não seria suficiente?

2. **🥈 Qual o produto final da build?**
   - ZIP? Pastas? SCORM? O que exatamente o Moodle recebe?

3. **🥉 Modelos e versões: por que essa estrutura?**
   - Qual a diferença semântica entre m1, m2, v1, v2?

4. **🏅 Como o usuário salva seu trabalho?**
   - Existe persistência ou tudo é temporário?

5. **🏅 Por que Shadow DOM?**
   - Teve problemas com CSS vazando? Quais as limitações encontradas?

---

## 💡 Ideias que Me Vieram (Aguardando Respostas)

### Só faço sentido se você responder as perguntas:

1. **Se arquivos temp são para persistir em crash:**
   - Que tal usar **IndexedDB** ou **SQLite** ao invés de sistema de arquivos?

2. **Se a build gera um ZIP:**
   - Podemos usar **JSZip** para gerar no browser sem IPC com main process

3. **Se componentes mudam dinamicamente:**
   - Podemos ter um **sistema de cache** com versionamento

4. **Se o fluxo é muito linear:**
   - Podemos implementar um **stepper wizard** com navegação livre

5. **Se existem muitos componentes:**
   - Podemos implementar **lazy loading** e **virtual scrolling**

---

## 📝 Próximos Passos

**Aguardando suas respostas para:**

1. Entender o **porquê** das decisões atuais
2. Verificar se minhas **preocupações** são válidas
3. Propor mudanças que fazem sentido no **contexto real**
4. Não refatorar por refatorar - só se agregar valor

---

**Conclusão:**

Eu posso estar **completamente errado** em minhas suposições. Por favor, corrija-me onde eu estiver fazendo **julgamentos de valor sem contexto**. Minhas perguntas são genuínas - eu realmente quero entender o raciocínio por trás da arquitetura antes de sugerir qualquer mudança.

Algumas decisões podem parecer "estranhas" isoladamente, mas fazem **todo sentido** quando entendemos o **contexto completo**, **restrições de negócio**, **histórico técnico** e **limitações da plataforma**.
