// ==================== State Management ====================
const state = {
    activeComponents: new Set(),
    currentTheme: 'light',
    currentEditingComponent: null,
    componentData: {}
};

// ==================== DOM Elements ====================
const elements = {
    componentsList: document.getElementById('componentsList'),
    previewContent: document.getElementById('previewContent'),
    previewContainer: document.getElementById('previewContainer'),
    previewEmpty: document.querySelector('.preview-empty'),
    previewLoading: document.querySelector('.preview-loading'),
    activeCount: document.getElementById('activeCount'),
    themeButtons: document.querySelectorAll('.btn-theme'),
    modal: document.getElementById('codeEditorModal'),
    htmlEditor: document.getElementById('htmlEditor'),
    cssEditor: document.getElementById('cssEditor'),
    jsEditor: document.getElementById('jsEditor'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),
    btnSaveCode: document.getElementById('btnSaveCode')
};

// ==================== Component Management ====================
function initializeComponents() {
    const cards = document.querySelectorAll('.component-card');
    
    cards.forEach(card => {
        const componentType = card.dataset.component;
        const toggleBtn = card.querySelector('.btn-toggle');
        const editBtn = card.querySelector('.btn-edit');
        const modelSelect = card.querySelector('.select-model');
        const versionSelect = card.querySelector('.select-version');
        
        // Toggle Component
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleComponent(card, componentType);
        });
        
        // Edit Code
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCodeEditor(componentType);
        });
        
        // Model/Version Change
        modelSelect.addEventListener('change', () => {
            if (state.activeComponents.has(componentType)) {
                updateComponentPreview(componentType, modelSelect.value, versionSelect.value);
            }
        });
        
        versionSelect.addEventListener('change', () => {
            if (state.activeComponents.has(componentType)) {
                updateComponentPreview(componentType, modelSelect.value, versionSelect.value);
            }
        });
    });
}

function toggleComponent(card, componentType) {
    const toggleBtn = card.querySelector('.btn-toggle');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const statusText = card.querySelector('.card-status');
    const isActive = toggleBtn.dataset.active === 'true';
    
    if (isActive) {
        // Desativar
        card.classList.remove('active');
        toggleBtn.dataset.active = 'false';
        toggleText.textContent = 'Ativar';
        statusText.textContent = 'Inativo';
        state.activeComponents.delete(componentType);
        
        // Remove do preview
        removeComponentFromPreview(componentType);
    } else {
        // Ativar
        card.classList.add('active');
        toggleBtn.dataset.active = 'true';
        toggleText.textContent = 'Desativar';
        statusText.textContent = 'Ativo';
        state.activeComponents.add(componentType);
        
        // Buscar e renderizar
        const model = card.querySelector('.select-model').value;
        const version = card.querySelector('.select-version').value;
        fetchAndRenderComponent(componentType, model, version);
    }
    
    updateActiveCount();
    updatePreviewVisibility();
}

function updateActiveCount() {
    const count = state.activeComponents.size;
    elements.activeCount.textContent = `${count} ${count === 1 ? 'ativo' : 'ativos'}`;
}

// ==================== Preview Management ====================
function updatePreviewVisibility() {
    if (state.activeComponents.size === 0) {
        elements.previewEmpty.classList.remove('hidden');
        elements.previewContainer.classList.add('hidden');
        elements.previewLoading.classList.add('hidden');
    } else {
        elements.previewEmpty.classList.add('hidden');
    }
}

function showLoading() {
    elements.previewLoading.classList.remove('hidden');
    elements.previewContainer.classList.add('hidden');
}

function hideLoading() {
    elements.previewLoading.classList.add('hidden');
    elements.previewContainer.classList.remove('hidden');
}

async function fetchAndRenderComponent(componentType, model, version) {
    showLoading();
    
    try {
        // Simula fetch de dados (substitua pela sua API real)
        const data = await fetchComponentData(componentType, model, version);
        
        state.componentData[componentType] = data;
        renderComponentInPreview(componentType, data);
        
        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar componente:', error);
        hideLoading();
        showErrorInPreview(componentType);
    }
}

async function fetchComponentData(componentType, model, version) {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Dados mockados (substitua pela sua API)
    const mockData = {
        destaque: {
            html: `
                <div class="destaque-component">
                    <div class="destaque-header">
                        <h2>Componente Destaque</h2>
                        <span class="badge-info">${model} - ${version}</span>
                    </div>
                    <div class="destaque-content">
                        <p>Este é um exemplo de componente de destaque.</p>
                        <button class="btn-action">Saiba Mais</button>
                    </div>
                </div>
            `,
            css: `
                .destaque-component {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .destaque-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .badge-info {
                    background: rgba(255,255,255,0.2);
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                }
                .destaque-content {
                    margin-top: 1rem;
                }
                .btn-action {
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .btn-action:hover {
                    transform: translateY(-2px);
                }
            `,
            js: `
                console.log('Destaque component loaded: ${model}-${version}');
                const btn = document.querySelector('.btn-action');
                if (btn) {
                    btn.addEventListener('click', () => {
                        alert('Botão de destaque clicado!');
                    });
                }
            `
        },
        carrossel: {
            html: `
                <div class="carrossel-component">
                    <div class="carrossel-header">
                        <h2>Carrossel de Imagens</h2>
                        <span class="badge-info">${model} - ${version}</span>
                    </div>
                    <div class="carrossel-items">
                        <div class="carrossel-item active">Slide 1</div>
                        <div class="carrossel-item">Slide 2</div>
                        <div class="carrossel-item">Slide 3</div>
                    </div>
                    <div class="carrossel-controls">
                        <button class="prev">←</button>
                        <button class="next">→</button>
                    </div>
                </div>
            `,
            css: `
                .carrossel-component {
                    background: #f3f4f6;
                    padding: 2rem;
                    border-radius: 1rem;
                }
                .carrossel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .carrossel-items {
                    position: relative;
                    height: 200px;
                    background: #e5e7eb;
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .carrossel-item {
                    position: absolute;
                    inset: 0;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: bold;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                }
                .carrossel-item.active {
                    display: flex;
                }
                .carrossel-controls {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    justify-content: center;
                }
                .carrossel-controls button {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: #4f46e5;
                    color: white;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1.5rem;
                }
            `,
            js: `
                let currentSlide = 0;
                const items = document.querySelectorAll('.carrossel-item');
                const prev = document.querySelector('.prev');
                const next = document.querySelector('.next');
                
                function showSlide(index) {
                    items.forEach(item => item.classList.remove('active'));
                    items[index].classList.add('active');
                }
                
                prev.addEventListener('click', () => {
                    currentSlide = (currentSlide - 1 + items.length) % items.length;
                    showSlide(currentSlide);
                });
                
                next.addEventListener('click', () => {
                    currentSlide = (currentSlide + 1) % items.length;
                    showSlide(currentSlide);
                });
            `
        },
        grid: {
            html: `
                <div class="grid-component">
                    <div class="grid-header">
                        <h2>Grid Layout</h2>
                        <span class="badge-info">${model} - ${version}</span>
                    </div>
                    <div class="grid-items">
                        <div class="grid-item">Item 1</div>
                        <div class="grid-item">Item 2</div>
                        <div class="grid-item">Item 3</div>
                        <div class="grid-item">Item 4</div>
                        <div class="grid-item">Item 5</div>
                        <div class="grid-item">Item 6</div>
                    </div>
                </div>
            `,
            css: `
                .grid-component {
                    padding: 2rem;
                }
                .grid-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .grid-items {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }
                .grid-item {
                    aspect-ratio: 1;
                    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .grid-item:hover {
                    transform: scale(1.05);
                }
            `,
            js: `
                console.log('Grid component loaded: ${model}-${version}');
                const gridItems = document.querySelectorAll('.grid-item');
                gridItems.forEach((item, index) => {
                    item.addEventListener('click', () => {
                        alert('Clicou no item ' + (index + 1));
                    });
                });
            `
        }
    };
    
    return mockData[componentType] || mockData.destaque;
}

function renderComponentInPreview(componentType, data) {
    // Cria ou atualiza seção do componente
    let componentSection = elements.previewContainer.querySelector(`[data-component="${componentType}"]`);
    
    if (!componentSection) {
        componentSection = document.createElement('div');
        componentSection.dataset.component = componentType;
        componentSection.className = 'component-preview-section';
        elements.previewContainer.appendChild(componentSection);
    }
    
    // Cria Shadow DOM para isolamento
    if (!componentSection.shadowRoot) {
        componentSection.attachShadow({ mode: 'open' });
    }
    
    const shadowRoot = componentSection.shadowRoot;
    
    // Limpa conteúdo anterior
    shadowRoot.innerHTML = '';
    
    // Injeta CSS
    const style = document.createElement('style');
    style.textContent = data.css;
    shadowRoot.appendChild(style);
    
    // Injeta HTML
    const container = document.createElement('div');
    container.innerHTML = data.html;
    shadowRoot.appendChild(container);
    
    // Injeta JS
    if (data.js) {
        const script = document.createElement('script');
        script.textContent = data.js;
        shadowRoot.appendChild(script);
    }
}

function removeComponentFromPreview(componentType) {
    const componentSection = elements.previewContainer.querySelector(`[data-component="${componentType}"]`);
    if (componentSection) {
        componentSection.remove();
    }
}

function updateComponentPreview(componentType, model, version) {
    showLoading();
    fetchAndRenderComponent(componentType, model, version);
}

function showErrorInPreview(componentType) {
    const errorHTML = `
        <div style="padding: 2rem; text-align: center; color: #ef4444;">
            <h3>Erro ao carregar componente</h3>
            <p>Não foi possível carregar o componente ${componentType}</p>
        </div>
    `;
    
    let componentSection = elements.previewContainer.querySelector(`[data-component="${componentType}"]`);
    if (!componentSection) {
        componentSection = document.createElement('div');
        componentSection.dataset.component = componentType;
        elements.previewContainer.appendChild(componentSection);
    }
    
    componentSection.innerHTML = errorHTML;
    hideLoading();
}

// ==================== Theme Management ====================
function initializeTheme() {
    elements.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
        });
    });
}

function setTheme(theme) {
    state.currentTheme = theme;
    elements.previewContainer.dataset.theme = theme;
    
    elements.themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

// ==================== Code Editor ====================
function initializeCodeEditor() {
    // Tab switching
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Modal controls
    elements.btnCloseModal.addEventListener('click', closeCodeEditor);
    elements.btnCancelEdit.addEventListener('click', closeCodeEditor);
    elements.btnSaveCode.addEventListener('click', saveCodeChanges);
    
    // Close on overlay click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeCodeEditor();
        }
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
            closeCodeEditor();
        }
    });
}

function switchTab(tab) {
    elements.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    elements.tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === tab);
    });
}

function openCodeEditor(componentType) {
    state.currentEditingComponent = componentType;
    
    const data = state.componentData[componentType];
    
    if (data) {
        elements.htmlEditor.value = data.html.trim();
        elements.cssEditor.value = data.css.trim();
        elements.jsEditor.value = data.js.trim();
    } else {
        elements.htmlEditor.value = '';
        elements.cssEditor.value = '';
        elements.jsEditor.value = '';
    }
    
    elements.modal.classList.remove('hidden');
    switchTab('html');
}

function closeCodeEditor() {
    elements.modal.classList.add('hidden');
    state.currentEditingComponent = null;
}

function saveCodeChanges() {
    if (!state.currentEditingComponent) return;
    
    const componentType = state.currentEditingComponent;
    
    // Atualiza dados
    state.componentData[componentType] = {
        html: elements.htmlEditor.value,
        css: elements.cssEditor.value,
        js: elements.jsEditor.value
    };
    
    // Re-renderiza preview
    renderComponentInPreview(componentType, state.componentData[componentType]);
    
    // Fecha modal
    closeCodeEditor();
    
    // Feedback visual
    showToast('Código salvo e aplicado com sucesso!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        animation: slideInUp 0.3s ease;
        z-index: 9999;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
    .component-preview-section {
        margin-bottom: 2rem;
    }
`;
document.head.appendChild(style);

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeComponents();
    initializeTheme();
    initializeCodeEditor();
    updateActiveCount();
});