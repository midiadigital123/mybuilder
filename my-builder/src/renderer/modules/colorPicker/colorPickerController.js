const pasteColors = () => {
  const putInSpanHex = (currentCard, text) => {
  if (!currentCard) return;
  const spanHex = currentCard.querySelector('.hex');
  spanHex.textContent = text;
}



const updateColorPreview = (currentCard, color) => {
  // Atualiza a cor de fundo do card
  if (!currentCard) return;
  const preview = currentCard.querySelector('.color-preview');
  preview.style.backgroundColor = color;
  // Atualiza a cor no objeto tempObject
  const colorKey = currentCard.getAttribute('data-var');
  tempObject.colorScheme[colorKey] = color;
}


  // Lista os cards de cores que podem ser clicados
  const cards = document.querySelectorAll('.color-card');
  
  cards.forEach(card => { // Itera sobre cada card 
    card.addEventListener('click', async () => {
      window.api.getClipboardText() // Chama a função exposta no preload.js e espera o resultado vindo de main.js
        .then(text => {
          let color = normalizeHex(text);
          if (verifyIfValidColor(color)){
          putInSpanHex(card, color);
          updateColorPreview(card, color);
          } 
      })
        .catch(err => {
        console.error('Erro ao obter o texto da área de transferência:', err);
      });
    }
    );
  });
}

pasteColors();