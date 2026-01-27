/src
├── renderer.js                 # Ponto de entrada. Apenas inicializa os módulos.
│
├── state/                      # Camada de Dados (Model)
│   └── projectState.js         # Gerencia o estado central da aplicação (o 'tempObject').
│           -> const tempObject
│
├── utils/                      # Ferramentas Genéricas
│   ├── color.js                # Funções para validar, normalizar e manipular cores.
│   │       -> verifyIfValidColor
│   │       -> normalizeHex
│   │
│   ├── file.js                 # Funções como formatBytes.
│   │       -> formatBytes
│   └── dom.js                  # Helpers para o DOM, se necessário.
│
└── modules/                    # Funcionalidades (MVC Interno)
    ├── form/                   # Módulo do formulário principal
    │   └── formController.js   # Controla os inputs de texto e o submit do formulário.
    │
    ├── colorPicker/            # Módulo do seletor de cores
    │   └── colorPickerController.js # Controla o clique nos cards de cor.
    │           -> pasteColors
    │           -> putInSpanHex
    │
    ├── assetUpload/            # Módulo de upload de arquivos
    │   └── assetUploadController.js # Controla a seleção e upload de assets.
    │           -> handleUploadDosAssets
    │           -> fazerUploadDosAssets
    │
    ├── componentManager/       # Módulo de gerenciamento de componentes
    │   │
    │   ├── componentManagerController.js # Controla a ativação dos componentes e busca os dados.
    │   │
    │   ├── preview/                # Módulo de pré-visualização 
    │   │    └── previewController.js  # Controla tudo relacionado
    │   │
    │   └── edit/                # Módulo de edição de componentes
    │       └── editController.js  
    │
    └── observer/                  # Módulo de instância de observadores
        └── observerController.js  # Controla tudo relacionado ao Shadow DOM.


