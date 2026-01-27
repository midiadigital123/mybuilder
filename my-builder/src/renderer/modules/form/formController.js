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
const loadInitialData = () => {
    console.log('[FormController] Lendo dados iniciais do DOM...');
    const initialData = {
        'course-name': document.getElementById('courseName').value,
        'course-time': document.getElementById('courseWorkload').value,
        'course-moodle-id': document.getElementById('moodleId').value,
        'course-moodle-url': document.getElementById('moodleUrl').value,
        'course-encapsulation-class': document.getElementById('encapsulateClass').value,
        colorScheme: {},
    };
    
    // Notifica o estado com um pacote de dados iniciais
    observerModule.sendNotify('form:initialDataLoaded', initialData);
};

// const fillTempObjectBasicInfo = () => {
//   tempObject['course-name'] = document.getElementById('courseName').value;
//   tempObject['course-time'] = document.getElementById('courseWorkload').value;
//   tempObject['course-moodle-id'] = document.getElementById('moodleId').value;
//   tempObject['course-moodle-url'] = document.getElementById('moodleUrl').value;
//   tempObject['course-encapsulation-class'] = document.getElementById('encapsulateClass').value;
//   let colors = document.querySelectorAll('.color-card');
//   colors.forEach(card => {
//     const colorKey = card.getAttribute('data-var');
//     const colorValue = card.querySelector('.hex').textContent;
//     tempObject.colorScheme[colorKey] = colorValue;
//   });
//   // console.log(tempObject)
// };

// fillTempObjectBasicInfo();

// document.getElementById('project-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

    // // 1. Pega os dados de texto (como string)
    // const dadosTexto = {}; // (Você preencheria isso com os valores dos inputs textuais)

    // // 2. Envia os dados textuais para criar a pasta
    // await window.api.gerarEstrutura(dadosTexto); 

    // // 3. Pega as imagens e envia
    // const imageInput = document.getElementById('cardImages');
    // await fazerUploadDosAssets(imageInput);
// });

const init = () => {
  console.log('[FormController] Inicializando o Form Controller...');
  monitorTextInputs();
  monitorFormSubmit();
  
};

 const formController = {
  init,
  loadInitialData,
};

export default formController;

// export { init, loadInitialData };