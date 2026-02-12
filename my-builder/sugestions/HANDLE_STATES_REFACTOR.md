# Sugestão: Refatoração do handleStates.js

**Data:** 2026-02-12  
**Tipo:** Bug Fix / Refatoração  
**Prioridade:** Alta

---

## 🐛 Problema Identificado

O evento de clique no header estava sendo disparado junto com o evento de change do toggle, causando:

1. Usuário desativa componente (toggle change)
2. `component:setActivation` com `value: false` → `clearPreview()`
3. **MAS** o clique propaga para o header
4. `component:setFocus` dispara → `updatePreview()` sobrescreve o clear

---

## 🔧 Solução

Reescrever a função usando:
- **Event delegation** (um listener no container ao invés de vários)
- **Flag de controle** para evitar conflito entre toggle e header
- **Helpers** para organizar a lógica

---

## 📝 Código Novo

Substituir **todo o conteúdo** de `src/renderer/modules/componentManager/handleStates.js` por:

```javascript
import observerModule from "../../../services/observerModule";

// Flag to prevent focus event during toggle change
let isToggleChanging = false;

const manageComponentActivity = () => {
  const componentsSection = document.getElementById("components-section");
  if (!componentsSection) return;

  const componentBoxes = Array.from(
    componentsSection.querySelectorAll(".component-box")
  );

  // Helper: Remove focus from all boxes except the specified one
  const clearFocusExcept = (exceptBox) => {
    componentBoxes.forEach((box) => {
      if (box !== exceptBox) {
        box.setAttribute("focused", "false");
      }
    });
  };

  // Helper: Activate component
  const activateComponent = (box) => {
    box.classList.add("active");
    box.setAttribute("focused", "true");
    clearFocusExcept(box);
    observerModule.sendNotify("component:setActivation", {
      id: box.id,
      value: true,
    });
  };

  // Helper: Deactivate component
  const deactivateComponent = (box) => {
    box.classList.remove("active");
    box.setAttribute("focused", "false");
    observerModule.sendNotify("component:setActivation", {
      id: box.id,
      value: false,
    });
  };

  // Helper: Focus component (only if active)
  const focusComponent = (box) => {
    const toggle = box.querySelector(".component-toggle");
    if (!toggle.checked) return;

    box.setAttribute("focused", "true");
    clearFocusExcept(box);
    observerModule.sendNotify("component:setFocus", {
      id: box.id,
      value: true,
    });
  };

  // Event delegation for toggle changes
  componentsSection.addEventListener("change", (e) => {
    const toggle = e.target.closest(".component-toggle");
    if (!toggle) return;

    const box = toggle.closest(".component-box");
    if (!box) return;

    // Set flag to prevent header click from firing
    isToggleChanging = true;

    if (toggle.checked) {
      activateComponent(box);
    } else {
      deactivateComponent(box);
    }

    // Reset flag after event propagation completes
    setTimeout(() => {
      isToggleChanging = false;
    }, 100);
  });

  // Event delegation for header clicks (focus)
  componentsSection.addEventListener("click", (e) => {
    // Ignore if toggle is changing
    if (isToggleChanging) return;

    // Ignore clicks on the toggle itself
    if (e.target.closest(".component-toggle")) return;

    // Check if clicked on header
    const header = e.target.closest(".box-header");
    if (!header) return;

    const box = header.closest(".component-box");
    if (!box) return;

    focusComponent(box);
  });
};

const watchModelAndVersionChanges = () => {
  const componentsContainer = document.getElementById("components-section");
  if (!componentsContainer) return;

  componentsContainer.addEventListener("change", (e) => {
    const target = e.target;

    // Ignore toggle changes (handled by manageComponentActivity)
    if (target.closest(".component-toggle")) return;

    const componentBox = target.closest(".component-box");
    if (!componentBox) return;

    const componentId = componentBox.id;

    if (target.classList.contains("model")) {
      observerModule.sendNotify("component:setModel", {
        id: componentId,
        value: target.value,
      });
    } else if (target.classList.contains("version")) {
      observerModule.sendNotify("component:setVersion", {
        id: componentId,
        value: target.value,
      });
    }
  });
};

const init = () => {
  manageComponentActivity();
  watchModelAndVersionChanges();
};

const handleStates = {
  init,
};

export default handleStates;
```

---

## ✅ Melhorias Aplicadas

| Antes | Depois |
|-------|--------|
| Múltiplos listeners por componente | Event delegation (2 listeners no container) |
| Conflito toggle/header | Flag `isToggleChanging` previne conflito |
| Lógica duplicada | Helpers reutilizáveis |
| Sem validações | Verificações de null safety |
| Propriedades extras no notify | Apenas `id` e `value` (mais limpo) |

---

## 🧪 Teste

1. Ativar componente → deve mostrar preview
2. Desativar componente → deve limpar preview (sem "lixo" visual)
3. Clicar no header de componente ativo → deve mudar foco
4. Mudar modelo/versão → deve atualizar preview
