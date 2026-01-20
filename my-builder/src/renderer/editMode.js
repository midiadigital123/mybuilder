
const handleEditMode = (tempObject) => {
    console.log(tempObject)
const editTabs = document.querySelectorAll('.tab-button');//HTMl, CSS e JS
const codeEditSection = document.querySelector('.code-edit'); // Contexto ativo
const saveAndApplyButton = document.querySelector('.save-and-apply'); // Salvar e Aplicar
const previewSection = document.querySelector('.preview'); // Seção de visualização
const btnCustomization = document.querySelectorAll('.btn-customization');



let currentLanguage = 'html'; // Linguagem padrão

const insertCodeIntoEditor = () => {
    let activeComp = document.querySelector('.component-box.active[active-view="true"]');
    if (activeComp && activeComp.dataset.comp) {
        console.log("1")
        const compType = activeComp.dataset.comp;
        if (tempObject.components && tempObject.components[compType]) {
            console.log("2")
            if (tempObject.components[compType][currentLanguage] !==  undefined) {
                console.log("3")
                let code = tempObject.components[compType][currentLanguage];
                console.log(currentLanguage)
                insertCodeIntoEditorArea(code);
                return;
            }
        }
    }
}

btnCustomization.forEach(btn => {
    btn.addEventListener('click', () => {
    const activeComp = document.querySelector('.component-box.active[active-view="true"]');
        if (!activeComp) {
            alert('Por favor, selecione um componente para customizar o código.');
            return;
        }
         insertCodeIntoEditor();
    });
});


editTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remover a classe 'active' de todas as abas
        editTabs.forEach(t => t.classList.remove('active'));
        // Adicionar a classe 'active' à aba clicada
        tab.classList.add('active');
        // Atualizar a linguagem atual com base na aba clicada
        currentLanguage = tab.dataset.lang;
        // Carregar o código correspondente na área de edição
        insertCodeIntoEditor();
    });
});

saveAndApplyButton.addEventListener('click', () => {
    const editorArea = document.getElementById('code-textarea');
    // Obter o código do editor com base na linguagem atual
    let codeToSave = editorArea.value;
    
    // Função para salvar e aplicar o código
    saveAndApplyCode(currentLanguage, codeToSave);
    previewSection.setAttribute('active-context', '');
    codeEditSection.removeAttribute('active-context');
    btnCustomization.forEach(btn => {
        btn.classList.remove('disabled');
    });
});

const insertCodeIntoEditorArea = (code) => {
    // Lógica para inserir o código na área de edição (exemplo fictício)
    if (!code) return;
    console.log(code)
    
    const editorArea = document.getElementById('code-textarea');
    if (code === ' ' || code === null || code === undefined) {
        editorArea.textContent = '// Nenhum código disponível para esta linguagem.';
        return;    
    }
    editorArea.textContent = '';// Limpa o conteúdo anterior
    editorArea.textContent = code;
}

function saveAndApplyCode(language, code) {
    // Lógica para salvar o código (pode ser em um arquivo ou banco de dados)
    console.log(`Salvando código ${language}:`, code);
    // Lógica para aplicar o código (atualizar a visualização, etc.)
    console.log(`Aplicando código ${language}`);
}

};

export default handleEditMode ;