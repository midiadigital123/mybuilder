const normalizeHex = (text) => {
  // Normaliza o texto para o formato hexadecimal
  if (!text) return '#000000';
  if (!text.startsWith('#')) {
    text = `#${text}`;
  }
  if (text.length > 7) {
    text = text.substring(0, 7);
  }
  return text;
}


const verifyIfValidColor = (color) => {
  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
  if (!isValidHex) {
    alert('O texto copiado não é uma cor hexadecimal válida!');
    return false;
  }
  return true;
}

export { normalizeHex, verifyIfValidColor };