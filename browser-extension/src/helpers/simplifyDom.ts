// console.log('Content script loaded..');

const MESSAGE_TYPE = 'get-simplified-dom';

// Extension context

export async function requestSimplifiedDom() {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');
  const response: string = await chrome.tabs.sendMessage(activeTab.id, {
    type: MESSAGE_TYPE,
  });

  return response;
}

// Page context

function truthyFilter<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

function isInteractive(element: HTMLElement): boolean {
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
    element.hasAttribute('onkeyup')
  );
}

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
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
    'for',
    'id',
    'name',
    'type',
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
    container.setAttribute('onclick', `onclick(${index})`);
  }

  children.forEach((child) => container.appendChild(child));

  return container;
}

function generateSimplifiedDomForPage() {
  let interactiveElements: HTMLElement[] = [];

  const simplifiedDom = generateSimplifiedDom(
    document.querySelector('body') as HTMLElement,
    interactiveElements
  );

  // console.log(simplifiedDom);

  return simplifiedDom;
}

// Run this in the page context
export const watchForSimplifyDomRequest = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === MESSAGE_TYPE) {
      sendResponse(generateSimplifiedDomForPage()?.outerHTML);
    }
  });
};
