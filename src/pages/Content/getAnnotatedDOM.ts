import { TAXY_ELEMENT_SELECTOR } from '../../constants';

function isInteractive(
  element: HTMLElement,
  style: CSSStyleDeclaration
): boolean {
  return (
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'BUTTON' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA' ||
    element.hasAttribute('onclick') ||
    element.hasAttribute('onmousedown') ||
    element.hasAttribute('onmouseup') ||
    element.hasAttribute('onkeydown') ||
    element.hasAttribute('onkeyup') ||
    style.cursor === 'pointer'
  );
}

function isVisible(element: HTMLElement, style: CSSStyleDeclaration): boolean {
  return (
    style.opacity !== '' &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

let currentElements: HTMLElement[] = [];

function traverseDOM(node: Node, pageElements: HTMLElement[]) {
  const clonedNode = node.cloneNode(false) as Node;

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const style = window.getComputedStyle(element);

    const clonedElement = clonedNode as HTMLElement;

    pageElements.push(element);
    clonedElement.setAttribute('data-id', (pageElements.length - 1).toString());
    clonedElement.setAttribute(
      'data-interactive',
      isInteractive(element, style).toString()
    );
    clonedElement.setAttribute(
      'data-visible',
      isVisible(element, style).toString()
    );
  }

  node.childNodes.forEach((child) => {
    const result = traverseDOM(child, pageElements);
    clonedNode.appendChild(result.clonedDOM);
  });

  return {
    pageElements,
    clonedDOM: clonedNode,
  };
}

/**
 * getAnnotatedDom returns the pageElements array and a cloned DOM
 * with data-pe-idx attributes added to each element in the copy.
 */
export default function getAnnotatedDOM() {
  currentElements = [];
  const result = traverseDOM(document.documentElement, currentElements);
  return (result.clonedDOM as HTMLElement).outerHTML;
}

// idempotent function to get a unique id for an element
export function getUniqueElementSelectorId(id: number): string {
  const element = currentElements[id];
  // element may already have a unique id
  let uniqueId = element.getAttribute(TAXY_ELEMENT_SELECTOR);
  if (uniqueId) return uniqueId;
  uniqueId = Math.random().toString(36).substring(2, 10);
  element.setAttribute(TAXY_ELEMENT_SELECTOR, uniqueId);
  return uniqueId;
}
