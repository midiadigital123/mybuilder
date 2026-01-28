import observerModule from '../../../services/observerModule.js';
class ProjectState {
  #state = {
    'course-name': '',
    'course-time': '',
    'course-moodle-id': '',
    'course-moodle-url': '',
    'course-encapsulation-class': '',
    colorScheme: {
      'primary-color-light': '#000000',
      'primary-color-dark': '#000000',
      'secondary-color-light': '#ffffff',
      'secondary-color-dark': '#ffffff',
      'intermediate-color-1-light': '#cccccc',
      'intermediate-color-2-light': '#999999',  
      'intermediate-color-3-light': '#666666',  
      'intermediate-color-1-bg-light': '#f0f0f0',
      'intermediate-color-2-bg-light': '#e0e0e0',
      'intermediate-color-3-bg-light': '#d0d0d0',
      'intermediate-color-1-dark': '#444444',
      'intermediate-color-2-dark': '#777777',  
      'intermediate-color-3-dark': '#aaaaaa',
      'intermediate-color-1-bg-dark': '#2c2c2c',
      'intermediate-color-2-bg-dark': '#3c3c3c',
      'intermediate-color-3-bg-dark': '#4c4c4c',
      'active-light': '#0d6efd',
      'active-dark': '#0d6efd',
      'active-hover-light': '#0b5ed7',
      'active-hover-dark': '#0b5ed7',
    },
    assets: {
      images: [],
      videos: [],
      documents: [],
    },
    components: [],
  };

  constructor() {}

  get() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  
  #updateCourseInfo(field, value) {
    if (this.#state[field] !== undefined) {
      this.#state[field] = value;
      observerModule.sendNotify('state:changed', { type: 'courseInfo', field, value });
    }
  }

  #updateColor(colorKey, colorValue) {
    if (this.#state.colorScheme[colorKey] !== undefined) {
      this.#state.colorScheme[colorKey] = colorValue;
      observerModule.sendNotify('state:changed', { type: 'colorScheme', colorKey, colorValue });
    }
  }

  #updateInitialData(initialData) {
    for (const key of ['course-name', 'course-time', 'course-moodle-id', 'course-moodle-url', 'course-encapsulation-class']) {
      if (initialData[key] !== undefined) {
        this.#state[key] = initialData[key];
      }
    }

    // Atualiza o esquema de cores
    if (initialData.colorScheme) {
      for (const [colorKey, colorValue] of Object.entries(initialData.colorScheme)) {
        if (this.#state.colorScheme[colorKey] !== undefined) {
          this.#state.colorScheme[colorKey] = colorValue;
        }
      }
    }
    observerModule.sendNotify('state:initialized', this.get());
  }

   #updateComponenteTempData(componentName, html, css, js) {
    // if (this.#state.colorScheme[colorKey] !== undefined) {
    //   this.#state.colorScheme[colorKey] = colorValue;
    //   observerModule.sendNotify('state:changed', { type: 'colorScheme', colorKey, colorValue });
    // }
  }

    #updateFocusedComponente() {
    // if (this.#state.colorScheme[colorKey] !== undefined) {
    //   this.#state.colorScheme[colorKey] = colorValue;
    //   observerModule.sendNotify('state:changed', { type: 'colorScheme', colorKey, colorValue });
    // }
  }

  // O método init onde a classe se inscreve para ouvir eventos do MUNDO EXTERNO
  init() {
    console.log('[ProjectState] Inicializando e ouvindo eventos...');

    observerModule.subscribeTo('form:inputChanged', (data) => {
      console.log(`[ProjectState] Ouvi 'form:inputChanged':`, data);
      this.#updateCourseInfo(data.field, data.value);
    });

    observerModule.subscribeTo('color:changed', (data) => {
      console.log(`[ProjectState] Ouvi 'color:changed':`, data);
      // console.log(projectState.get());
      this.#updateColor(data.colorKey, data.colorValue);
    });

    observerModule.subscribeTo('form:initialDataLoaded', (initialData) => {
        console.log('[ProjectState] Recebendo carga inicial de dados:', initialData);
        this.#updateInitialData(initialData);
    });

    observerModule.subscribeTo('component:updateInEditMode', (data) => {
      // Servirá para enviar ao backend os arquivos do componente já com a modificação. 
      // Depois que o usuário clicou em Salvar(dentro do customizar código), o renderer vai disparar
      // algo como observerModule.sendNotify('component:updateInEditMode', { component: componentName ,html: html, css: css, js: js })
        this.#updateComponenteTempData(data.componentName, data.html, data.css, data.js);
    });

     observerModule.subscribeTo('component:setFocus', (data) => {
      // Servirá para enviar ao shadowDom(visualização e edit) a informação de qual componente mostrar. 
        this.#updateFocusedComponente();
    });



    // ... outras inscrições
  }
}

const projectState = new ProjectState();
export default projectState;