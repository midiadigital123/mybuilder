const textTagNames = ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6"];

/**
 * 
 * @param {object} elem O elemento HTML a ser avaliado
 * @param {object} result Objeto com total de elementos de texto e de caracteres
 * @returns {object} Total de elementos de texto e total de caracteres
 */
function elementCharCounter(elem, result = { nTextElements: 0, nChars: 0 }) {
  // Se for uma das tags alvo, elementCharCounterbiliza e para a descida nesse ramo
  if (textTagNames.includes(elem.tagName)) {
    result.nTextElements++;
    result.nChars += elem.textContent.length;
    return result;
  }

  // Se não for tag de texto, percorre os filhos recursivamente
  for (let child of elem.children) {
    elementCharCounter(child, result);
  }

  return result;
}