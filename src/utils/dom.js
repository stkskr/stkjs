export function createElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

export function setHTML(element, html) {
  element.innerHTML = html;
}

export function addClass(element, ...classNames) {
  element.classList.add(...classNames);
}

export function removeClass(element, ...classNames) {
  element.classList.remove(...classNames);
}

export function toggleClass(element, className, force) {
  element.classList.toggle(className, force);
}
