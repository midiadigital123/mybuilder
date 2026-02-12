# Sugestão: Atualização do README.md

**Data:** 2026-02-12  
**Tipo:** Documentação

---

## Problema

O arquivo `README.md` atual está com encoding UTF-16 e contém informações desorganizadas sobre a estrutura do projeto.

## Proposta

Substituir o conteúdo do `README.md` pelo seguinte:

---

```markdown
# My Builder

Aplicação desktop desenvolvida com **Electron** e **Vite** para criação e gerenciamento de projetos de cursos. A ferramenta permite configurar paletas de cores, fazer upload de assets, gerenciar componentes e gerar a estrutura final de arquivos para integração com plataformas de ensino.

## 🚀 Tecnologias

- **Electron** - Framework para aplicações desktop
- **Vite** - Bundler moderno e rápido
- **Electron Forge** - Toolchain para empacotamento e distribuição
- **Node.js** - Runtime JavaScript

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- npm

## 🔧 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Acesse a pasta do projeto
cd my-builder

# Instale as dependências
npm install
```

## ▶️ Executando

```bash
# Modo desenvolvimento
npm start

# Empacotar aplicação
npm run package

# Gerar instaladores
npm run make
```

## 📁 Estrutura do Projeto

```
src/
├── main.js                     # Processo principal do Electron
├── preload.js                  # Scripts de segurança (bridge)
├── renderer/                   # Interface do usuário (frontend)
│   ├── index.html              # HTML principal
│   ├── renderer.js             # Ponto de entrada do renderer
│   ├── modules/                # Módulos da aplicação (MVC)
│   │   ├── form/               # Módulo do formulário principal
│   │   ├── colorPicker/        # Módulo do seletor de cores
│   │   ├── assetUpload/        # Módulo de upload de arquivos
│   │   ├── componentManager/   # Módulo de gerenciamento de componentes
│   │   │   ├── preview/        # Pré-visualização de componentes
│   │   │   └── edit/           # Edição de componentes
│   │   └── observer/           # Observadores e Shadow DOM
│   ├── utils/                  # Funções utilitárias
│   │   ├── color.js            # Manipulação de cores
│   │   ├── file.js             # Funções de arquivo
│   │   └── dom.js              # Helpers para DOM
│   └── temp/                   # Dados temporários
└── services/                   # Serviços da aplicação
```

## 🔌 Módulos

| Módulo | Descrição |
|--------|-----------|
| **Form** | Controla os inputs de texto e submit do formulário |
| **Color Picker** | Gerencia a seleção e configuração de paleta de cores |
| **Asset Upload** | Controla upload e gerenciamento de imagens e arquivos |
| **Component Manager** | Ativa/desativa componentes e gerencia configurações |
| **Preview** | Renderiza pré-visualização ao vivo dos componentes |
| **Observer** | Monitora mudanças no formulário e estado da aplicação |

## 📄 Arquitetura

O projeto segue uma arquitetura **MVC (Model-View-Controller)** modular:

- **View** - Renderização dos componentes na interface de preview
- **Controller** - Lógica de ativação/desativação e configuração
- **Model** - Armazenamento de dados e estados dos componentes

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia a aplicação em modo desenvolvimento |
| `npm run package` | Empacota a aplicação |
| `npm run make` | Gera instaladores para distribuição |
| `npm run publish` | Publica a aplicação |

## 📝 Licença

MIT

## 👤 Autor

**Mídia Digital** - midia.digital@fundacaocaed.org.br
```

---

## Como aplicar

Execute no terminal:

```bash
node update-readme.js
```

O script `update-readme.js` já foi criado na raiz do projeto e contém o código necessário para sobrescrever o README.md com o novo conteúdo.

Após aplicar, pode deletar o script com:

```bash
del update-readme.js
```
