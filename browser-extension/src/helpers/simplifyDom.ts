// console.log('Content script loaded..');

import { callRPC } from './pageRPC';

export async function getSimplifiedDom() {
  const fullDom = await callRPC('get-annotated-dom');

  const dom = new DOMParser().parseFromString(fullDom, 'text/html');

  // Mount the DOM to the document in an iframe so we can use getComputedStyle

  let interactiveElements: HTMLElement[] = [];

  const simplifiedDom = generateSimplifiedDom(
    dom.documentElement,
    interactiveElements
  ) as HTMLElement;

  return simplifiedDom.outerHTML;
}

function truthyFilter<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

function isInteractive(element: HTMLElement): boolean {
  return element.getAttribute('data-interactive') === 'true';
}

function isVisible(element: HTMLElement): boolean {
  return element.getAttribute('data-visible') === 'true';
}

function generateSimplifiedDom(
  element: ChildNode,
  interactiveElements: HTMLElement[]
): ChildNode | null {
  if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
    return document.createTextNode(element.textContent + ' ');
  }

  if (!(element instanceof HTMLElement)) return null;

  if (!isVisible(element)) return null;

  const children = Array.from(element.childNodes)
    .map((c) => generateSimplifiedDom(c, interactiveElements))
    .filter(truthyFilter);

  const interactive = isInteractive(element);
  const hasLabel = element.hasAttribute('aria-label');
  const includeNode = interactive || hasLabel;

  if (!includeNode && children.length === 0) return null;
  if (!includeNode && children.length === 1) return children[0];

  const container = document.createElement(element.tagName);

  const allowedAttributes = [
    'aria-label',
    // 'for',
    // 'id',
    // 'name',
    // 'type',
    'placeholder',
    // 'href',
    'alt',
  ];

  for (const attr of allowedAttributes) {
    if (element.hasAttribute(attr)) {
      container.setAttribute(attr, element.getAttribute(attr) as string);
    }
  }

  if (interactive) {
    const index = interactiveElements.length;
    interactiveElements.push(element);
    container.setAttribute('id', index.toString());
  }

  children.forEach((child) => container.appendChild(child));

  return container;
}
