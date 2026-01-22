/**
 * 
 * @param {object} element 
 * @returns {number} number of characters in the element if it is a text element, otherwise 0
*/
const elementCharCounter = (element) => {
    const textTagNames = ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6"];
    
    if(textTagNames.includes(element.tagName)) {
        return element.textContent.length;
    }
    console.error("Provided element is not a text element.");
    return 0;
}