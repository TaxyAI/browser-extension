// console.log('Content script loaded..');

import { callRPC } from './pageRPC';
import { truthyFilter } from './utils';

export async function getSimplifiedDom() {
  const fullDom = await callRPC('getAnnotatedDOM', [], 3);
  if (!fullDom) return null;

  const dom = new DOMParser().parseFromString(fullDom, 'text/html');

  // Mount the DOM to the document in an iframe so we can use getComputedStyle

  const interactiveElements: HTMLElement[] = [];

  const simplifiedDom = generateSimplifiedDom(
    dom.documentElement,
    interactiveElements
  ) as HTMLElement;

  return simplifiedDom;
}

function generateSimplifiedDom(
  element: ChildNode,
  interactiveElements: HTMLElement[]
): ChildNode | null {
  if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
    return document.createTextNode(element.textContent + ' ');
  }

  if (!(element instanceof HTMLElement || element instanceof SVGElement))
    return null;

  const isVisible = element.getAttribute('data-visible') === 'true';
  if (!isVisible) return null;

  let children = Array.from(element.childNodes)
    .map((c) => generateSimplifiedDom(c, interactiveElements))
    .filter(truthyFilter);

  // Don't bother with text that is the direct child of the body
  if (element.tagName === 'BODY')
    children = children.filter((c) => c.nodeType !== Node.TEXT_NODE);

  const interactive =
    element.getAttribute('data-interactive') === 'true' ||
    element.hasAttribute('role');
  const hasLabel =
    element.hasAttribute('aria-label') || element.hasAttribute('name');
  const includeNode = interactive || hasLabel;

  if (!includeNode && children.length === 0) return null;
  if (!includeNode && children.length === 1) {
    return children[0];
  }

  const container = document.createElement(element.tagName);

  const allowedAttributes = [
    'aria-label',
    'data-name',
    'name',
    'type',
    'placeholder',
    'value',
    'role',
    'title',
  ];

  for (const attr of allowedAttributes) {
    if (element.hasAttribute(attr)) {
      container.setAttribute(attr, element.getAttribute(attr) as string);
    }
  }
  if (interactive) {
    interactiveElements.push(element as HTMLElement);
    container.setAttribute('id', element.getAttribute('data-id') as string);
  }

  children.forEach((child) => container.appendChild(child));

  return container;
}
