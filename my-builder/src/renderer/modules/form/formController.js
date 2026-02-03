import observerModule from '../../../services/observerModule.js';

// monitora os inputs de texto para atualizar o tempObject
const monitorTextInputs = () => {
  const form = document.getElementById('form-container');
  form.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
      const id = event.target.id;
      const value = event.target.value;
      console.log(`[FormController] Notificando 'form:inputChanged' para o campo ${id}`);
      observerModule.sendNotify('form:inputChanged', { id, value });
    }
  });
};

const monitorFormSubmit = () => {
  const form = document.getElementById('form-container');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // A notificação de submit ainda pode ser útil para outros módulos
    observerModule.sendNotify('form:submitted');
  });
};


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
