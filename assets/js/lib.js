export function createElm(className = null, tag = "div") {
  var elm = document.createElement(tag);
  if (className) elm.classList.add(className);
  return elm;
}