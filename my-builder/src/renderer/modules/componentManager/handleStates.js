import observerModule from "../../../services/observerModule";

const manageComponentActivity = () => {
  // Seleciona o switch e a caixa

  let components = document.getElementById("components-section");
  let componentesBox = Array.from(
    components.querySelectorAll(".component-box"),
  );

  componentesBox.forEach((box) => {
    const toggle = box.querySelector(".component-toggle");
    // Escuta o clique no switch
    toggle.addEventListener("change", function () {
      if (this.checked) {
        box.classList.add("active"); // Adiciona classe para abrir
        // Adiciona false aos outros componentes
        componentesBox.forEach((otherBox) => {
          if (otherBox !== box) {
            otherBox.setAttribute("active-view", "false");
          }
        });
        box.setAttribute("active-view", "true");
        observerModule.sendNotify("component:changed", {
          type: "activation",
          id: box.id,
          key: "isActive",
          value: true,
        });

        // insertDataIntoShadowDOM(box);
      } else {
        box.classList.remove("active"); // Remove classe para fechar
        box.setAttribute("active-view", "false");
        observerModule.sendNotify("component:changed", {
          type: "activation",
          id: box.id,
          key: "isActive",
          value: false,
        });
      }
    });
  });
};

const watchModelAndVersionChanges = () => {
  const componentsContainer = document.getElementById("components-section");
  componentsContainer.addEventListener("change", (event) => {
    const target = event.target;
    if (target.classList.contains("model")) {
      const componentBox = target.closest(".component-box");
      const componentId = componentBox.id;
      const selectedModel = target.value;
      observerModule.sendNotify("component:changed", {
        type: "modelChanged",
        id: componentId,
        key: "selectedModel",
        value: selectedModel,
      });
    } else if (target.classList.contains("version")) {
      const componentBox = target.closest(".component-box");
      const componentId = componentBox.id;
      const selectedVersion = target.value;
      observerModule.sendNotify("component:changed", {
        type: "versionChanged",
        id: componentId,
        key: "selectedVersion",
        value: selectedVersion,
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
