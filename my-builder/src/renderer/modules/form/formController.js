import observerModule from '../../../services/observerModule.js';

// monitora os inputs de texto para atualizar o tempObject
const monitorTextInputs = () => {
  const form = document.getElementById('project-form');
  form.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
      const field = event.target.id;
      const value = event.target.value;
      console.log(`[FormController] Notificando 'form:inputChanged' para o campo ${field}`);
      observerModule.sendNotify('form:inputChanged', { field, value });
    }
  });
};

const monitorFormSubmit = () => {
  const form = document.getElementById('project-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // A notificação de submit ainda pode ser útil para outros módulos
    observerModule.sendNotify('form:submitted');
  });
};

// A função que lê o estado ATUAL da UI e notifica
// const loadInitialData = () => {
//     console.log('[FormController] Lendo dados iniciais do DOM...');
//     const initialData = {
//         'course-name': document.getElementById('courseName').value,
//         'course-time': document.getElementById('courseWorkload').value,
//         'course-moodle-id': document.getElementById('moodleId').value,
//         'course-moodle-url': document.getElementById('moodleUrl').value,
//         'course-encapsulation-class': document.getElementById('encapsulateClass').value,
//         colorScheme: {},
//     };
    
//     // Notifica o estado com um pacote de dados iniciais
//     observerModule.sendNotify('form:initialDataLoaded', initialData);
// };



const init = () => {
  console.log('[FormController] Inicializando o Form Controller...');
  monitorTextInputs();
  monitorFormSubmit();
};

 const formController = {
  init,
  // loadInitialData,
};

export default formController;
