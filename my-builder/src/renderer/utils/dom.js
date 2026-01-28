 const createEl = (options = {
    tag: "",
    className: "",
    id: "",
    attributes: {},
    html: "",
}) =>{
    const { tag, className, id, attributes, html } = options;
    const el = document.createElement(tag);
    if(className) el.className = className;
    if(id) el.id = id;
    if(html) el.innerHTML = html;
    if(attributes && typeof attributes === 'object'){
        Object.keys(attributes).forEach(attrKey => {
            el.setAttribute(attrKey, attributes[attrKey]);
        });
    }
    return el;
}

export default createEl;

/**
 * Exmplo de uso:
 * createEl('div', {
 *   className: 'my-class',
 *   id: 'my-id',
 *  attributes: { 'data-role': 'container', 'title': 'My Div' },
 *  html: '<p>Hello World</p>'
 * });
 */



// const createEl = (tag, { html = "", attr = "", cls = "", style = "" } = {}) => {
//   const el = document.createElement(tag);
//   if (html !== "") el.innerHTML = html;
//   if (cls !== "") el.classList.add(cls);
//   if (attr !== "") el.setAttribute('attr', attr);
//   if (style !== "") el.setAttribute('style', style);
//   return el;
// };

// classe, id, atributos, html