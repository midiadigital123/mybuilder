import componentsData from "../componentManager/mock/componentMockData.js";
import createEl from "../../utils/dom.js";
import observerModule from "../../../services/observerModule.js";

/**
 * Dados mockados:
 * 
 *  
    {
        id: 'comp-1',
        name: 'Destaque',
        models: ['m1', 'm2'],
        versions: ["v1.0", "v1.1", "v2.0"],
    },
        {
        id: 'comp-2',
        name: 'Citação',
        models: ['m1'],
        versions: ["v1.0"],
    }
 * 
 * Atualmente essa parte está trabalhando com dados mockados, mas a ideia é usar o endpoint
 * dos meninos da infra para buscar os componentes disponíveis.
 * (colocar uma menção a esse arquivo no README.md)
 * 
 */

const fillLayoutWithComponentsFromAPI = () => {}; // Em breve

  
const fillLayoutWithComponentsMocked = () => {
  const componentsContainer = document.getElementById("components-section");
  componentsData.forEach((component) => {
    // Constrói HTML de cada componente
    const componentBox = buildComponentBox(component);
    const header = buildComponentHeader(component);
    const body = buildComponentBody(component);
    componentBox.appendChild(header);
    componentBox.appendChild(body);
    componentsContainer.appendChild(componentBox);
    // Envia uma notificação para que projectState saiba dos componentes possíveis
    observerModule.sendNotify('component:avaliableComponentAdded', 
      { componentId: component.id,
          name: component.name,
          models: component.models,
          versions: component.versions,
          focused: false,
          actived: false,
          alias: component.alias
      }); // Inicialmente não está focado nem ativo

  });
};

const buildComponentBox = (component) => {
    return createEl({
        tag: 'div',
        className: 'component-box', 
        id: component.id,
        attributes: { 
            'data-comp': component.id, 
            'active-view': 'false',
            'alias': component.alias
        }
    });
}

const buildComponentHeader = (component) => {
  const header = createEl({tag: 'div', className: 'box-header'});
  const headerInfo = createEl({tag: 'div', className: 'header-info'});
    const iconWrapper = createEl({tag: 'div', className: 'icon-wrapper'});
    const title = createEl({ tag: 'h3', html: component.name });

    const headerActions = createEl({ tag: 'div', className: 'header-actions' });
    const toggleSwitch = createEl({tag: 'label', className: 'toggle-switch'});
    const checkbox = createEl({tag: 'input', id: `${component.id}-toggle`, className: 'component-toggle', attributes: { type: 'checkbox'}});
    const slider = createEl({tag: 'span', className: 'slider round'});
    toggleSwitch.appendChild(checkbox);
    toggleSwitch.appendChild(slider);
    headerActions.appendChild(toggleSwitch);
    headerInfo.appendChild(iconWrapper);
    headerInfo.appendChild(title);
    header.appendChild(headerInfo);
    header.appendChild(headerActions);
    return header;
}

const buildComponentBody = (component) => {

    const body = createEl({tag: 'div',  className: 'box-body'});
    const optionsGrid = createEl({tag: 'div', className: 'options-grid'});
    const modelGroup = createEl({tag: 'div', className: 'option-group'});
    const modelLabel = createEl({tag: 'label', html: 'Modelo'});
    const modelSelect = createEl({tag: 'select', className: 'model'});
    component.models.forEach(model => {
        const option = createEl({tag: 'option', html: model});
        modelSelect.appendChild(option);
    });
    modelGroup.appendChild(modelLabel);
    modelGroup.appendChild(modelSelect);
    const versionGroup = createEl({tag: 'div', className: 'option-group'});
    const versionLabel = createEl({tag: 'label', html: 'Versão'});
    const versionSelect = createEl({tag: 'select', className: 'version'});
    component.versions.forEach(version => {
        const option = createEl({tag: 'option', html: version});
        versionSelect.appendChild(option);
    });
    versionGroup.appendChild(versionLabel);
    versionGroup.appendChild(versionSelect);
    optionsGrid.appendChild(modelGroup);
    optionsGrid.appendChild(versionGroup);
    body.appendChild(optionsGrid);
    const customActions = createEl({tag: 'div', className: 'custom-actions'});
    const customButton = createEl({
        tag: 'button', 
        className: 'btn-primary btn-customization', 
        attributes: { type: 'button', 'custom-to': component.id }, 
        html: 'Customizar Código'
    });
    customActions.appendChild(customButton);
    body.appendChild(customActions);
    return body;
}


const init = () => {
  fillLayoutWithComponentsMocked();
};

const renderView = {
  init,
};

export default renderView;
