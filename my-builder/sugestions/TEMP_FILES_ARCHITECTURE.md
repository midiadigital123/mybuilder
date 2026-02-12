# Sugestão: Arquivos Temporários para Componentes

**Data:** 2026-02-12  
**Tipo:** Arquitetura / Refatoração  
**Prioridade:** Alta  
**Atualizado:** 2026-02-12 (incorporadas considerações do autor)

---

## 📋 Resumo da Proposta

Criar arquivos temporários no sistema de arquivos para cada componente ativado, ao invés de armazenar o código (HTML, CSS, JS) diretamente no objeto de estado (`projectState`).

> **Nota:** Os arquivos temporários serão criados na pasta de build do Electron (`.vite/build/2026-X/temp`), não no repositório do projeto. Isso faz sentido pois esses arquivos só existem durante a execução da aplicação.

---

## 🎯 Objetivos

1. **Desacoplar código dos componentes do estado da aplicação**
2. **Facilitar edições pelo usuário** (editar arquivo vs. editar propriedade de objeto)
3. **Simplificar o processo de build** (importar arquivos diretamente no SCSS/bundler)
4. **Reduzir complexidade do estado** (menos dados em memória)

---

## ✅ Análise: Pontos Positivos

### 1. **Separação de Responsabilidades**
O estado da aplicação (`projectState`) ficará mais leve, armazenando apenas metadados dos componentes (id, alias, modelo, versão, isActive, focused) e não o conteúdo dos arquivos.

### 2. **Edição Simplificada**
Quando o usuário clicar em "Customizar Código", ele estará editando um arquivo real no disco. Isso:
- Elimina a necessidade de sincronizar mudanças entre UI ↔ Estado ↔ Arquivo
- Permite usar o sistema de arquivos como "single source of truth" para o código
- Facilita debug (você pode abrir os arquivos temporários manualmente)

### 3. **Build Mais Direta**
Na hora da build, basta importar os arquivos da pasta temporária:
```scss
// main.scss
@import '../temp/components/destaque.scss';
@import '../temp/components/citacao.scss';
```

### 4. **Nomenclatura Simples**
Usar apenas o `alias` no nome do arquivo é uma boa decisão, já que não há múltiplas versões simultâneas:
```
temp/components/destaque.css
temp/components/destaque.js
temp/components/destaque.html
```

### 5. **Limpeza Automática**
Ao desativar um componente, basta deletar os arquivos correspondentes. Isso é mais intuitivo do que limpar propriedades de um objeto.

---

## ⚠️ Análise: Pontos de Atenção

### 1. **Operações de I/O são Assíncronas**
Toda leitura/escrita de arquivo passa pelo `ipcMain` (processo principal do Electron). Isso adiciona latência comparado a manipular objetos em memória.

> **Autor considera:** Essa latência não é um problema para o caso de uso da aplicação.

### 2. **Gestão de Erros de Arquivo**
Arquivos podem falhar ao serem criados/lidos/deletados (permissões, disco cheio, etc).

**Mitigação:**
- Implementar tratamento de erros robusto
- Fallback para estado em memória se arquivo falhar

### 3. **Sincronização Estado ↔ Arquivos**
Ainda será necessário manter o estado sincronizado com a existência dos arquivos.

**Mitigação:**
- O estado armazena apenas `isActive` e metadados
- O conteúdo sempre vem do arquivo quando necessário

### 4. **Mudança de Modelo/Versão**
Quando o usuário muda o modelo ou versão, o arquivo temporário precisa ser atualizado com o novo conteúdo do servidor.

**Ação:**
- Ao mudar modelo/versão: fetch → sobrescreve conteúdo do arquivo existente
- Não é necessário recriar o arquivo, apenas sobrescrever
- Perguntar ao usuário se ele quer perder customizações (se houver)

---

## 🏗️ Arquitetura Proposta

### Estrutura de Pastas
```
.vite/build/
└── 2026-X/
    └── temp/
        └── components/           # Pasta para arquivos temporários (runtime)
            ├── destaque.html
            ├── destaque.css
            ├── destaque.js
            ├── citacao.html
            ├── citacao.css
            └── citacao.js
```

> **Nota:** Esta estrutura existe apenas durante a execução da aplicação, dentro da pasta de build do Electron.

### Fluxo de Ativação de Componente
```
[Usuário ativa componente]
         │
         ▼
[handleStates.js dispara evento 'component:setActivation']
         │
         ▼
[projectState.js recebe evento]
         │
         ├──► Atualiza isActive = true no estado
         │
         └──► Chama serviço para criar arquivos temporários
                    │
                    ▼
              [fetchData.js busca código do servidor]
                    │
                    ▼
              [main.js (IPC) escreve arquivos em temp/components/]
                    │
                    ▼
              [Notifica shadowDOM para renderizar preview]
```

### Fluxo de Edição (Customizar Código)
```
[Usuário clica em "Customizar Código"]
         │
         ▼
[UI lê arquivo de temp/components/{alias}.{ext}]
         │
         ▼
[Usuário edita na interface]
         │
         ▼
[Usuário clica em "Salvar"]
         │
         ▼
[UI escreve alterações em temp/components/{alias}.{ext}]
         │
         ▼
[Notifica shadowDOM para atualizar preview]
```

### Fluxo de Build
```
[Usuário clica em "Gerar Build"]
         │
         ▼
[Sistema lê todos os arquivos de temp/components/]
         │
         ▼
[Concatena/importa arquivos no bundle SCSS/JS]
         │
         ▼
[Gera arquivos finais em {year}-X/assets/]
```

---

## 📝 Mudanças Necessárias no Código

### 1. **Novo Serviço: `componentFileService.js`**
Criar serviço para gerenciar operações de arquivo:

```javascript
// src/services/componentFileService.js
const componentFileService = {
  // Cria arquivos temporários para um componente
  async createTempFiles(alias, html, css, js) { },
  
  // Lê arquivos temporários de um componente
  async readTempFiles(alias) { },
  
  // Atualiza um arquivo específico
  async updateTempFile(alias, fileType, content) { },
  
  // Remove arquivos temporários de um componente
  async deleteTempFiles(alias) { },
  
  // Lista todos os componentes com arquivos temporários
  async listActiveComponents() { }
};
```

### 2. **Novos Handlers IPC em `main.js`**
```javascript
ipcMain.handle("component:createTempFiles", handleCreateTempFiles);
ipcMain.handle("component:readTempFiles", handleReadTempFiles);
ipcMain.handle("component:updateTempFile", handleUpdateTempFile);
ipcMain.handle("component:deleteTempFiles", handleDeleteTempFiles);
```

### 3. **Atualizar `projectState.js`**
- Remover propriedades `html`, `css`, `js` do estado dos componentes
- Usar o serviço de arquivos ao invés de armazenar conteúdo no estado
- Manter apenas metadados no estado

### 4. **Atualizar `preload.js`**
Expor as novas APIs para o renderer:
```javascript
contextBridge.exposeInMainWorld('api', {
  // ... APIs existentes
  createComponentTempFiles: (alias, html, css, js) => 
    ipcRenderer.invoke('component:createTempFiles', alias, html, css, js),
  readComponentTempFiles: (alias) => 
    ipcRenderer.invoke('component:readTempFiles', alias),
  // ...
});
```

---

## 🔄 Impacto nas Funcionalidades Existentes

| Funcionalidade | Impacto | Ação Necessária |
|----------------|---------|-----------------|
| Ativação de componente | Médio | Chamar serviço de criação de arquivos |
| Desativação de componente | Médio | Chamar serviço de deleção de arquivos |
| Preview (shadowDOM) | Baixo | Ler de arquivo ao invés do estado |
| Mudança de modelo/versão | Médio | Sobrescrever arquivos temporários |
| Customizar código | Alto | Refatorar para editar arquivos |
| Build final | Alto | Implementar importação de arquivos |

---

## 🎲 Veredicto

**👍 RECOMENDO a implementação desta abordagem.**

A proposta é sólida e resolve problemas reais:
1. ✅ Simplifica o estado da aplicação
2. ✅ Torna o fluxo de edição mais intuitivo
3. ✅ Facilita a build final
4. ✅ Nomenclatura simples (apenas alias)

Os pontos de atenção são gerenciáveis com boas práticas de tratamento de erros e um serviço bem estruturado.

---

## 📌 Próximos Passos Sugeridos

1. [ ] Criar pasta `temp/components/` na estrutura
2. [ ] Implementar `componentFileService.js`
3. [ ] Adicionar handlers IPC em `main.js`
4. [ ] Atualizar `preload.js` com novas APIs
5. [ ] Refatorar `projectState.js` para usar o serviço
6. [ ] Atualizar shadowDOM para ler de arquivos
7. [ ] Implementar fluxo de edição com arquivos
8. [ ] Testar cenários de erro (falha de I/O)

---

## 💡 Nota sobre Renderização no Shadow DOM

**Decisão:** Manter a abordagem atual de injetar CSS entre tags `<style>` inline.

```javascript
shadowRoot.innerHTML = `
  <style>${cssContent}</style>
  ${htmlContent}
`;
```

**Motivo:** A alternativa de usar `<link href>` apontando para arquivos temporários foi descartada pois:
- Ainda requer observer para saber quando atualizar
- Adiciona complexidade de configurar protocolo customizado no Electron
- O ganho é marginal comparado à complexidade adicionada

O fluxo permanece:
1. Arquivo é atualizado no disco
2. Observer dispara evento
3. Conteúdo é lido do arquivo via IPC
4. CSS é injetado no `<style>` do Shadow DOM
