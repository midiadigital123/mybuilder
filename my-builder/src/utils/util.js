/**
 * 
 * @param {object} element 
 * @returns {number} número de caracteres em um elemento se este elemento for um elemento de texto.
 * Do contrário gera erro no console e retorna 0.
*/
const elementCharCounter = (element) => {
    const textTagNames = ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6"];
    
    if(textTagNames.includes(element.tagName)) {
        return element.textContent.length;
    }
    console.error("Elemento de entrada não é um elemento de texto");
    return 0;
}