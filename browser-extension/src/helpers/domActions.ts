import { callRPC } from './pageRPC';

async function getCenterCoordinates(
  id: number
): Promise<{ x: number; y: number }> {
  return callRPC('getElementCenterCoordinates', [id]);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wrap the chrome.debugger.sendCommand in a Promise
function sendCommand(
  tabId: number,
  method: string,
  params?: Object
): Promise<any> {
  console.log('Sending command', method, params, tabId);
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result || {});
      }
    });
  });
}

const delayBetweenClicks = 200; // Set this value to control the delay between clicks
const delayBetweenKeystrokes = 100; // Set this value to control typing speed

async function clickAtPosition(
  activeTabId: number,
  x: number,
  y: number,
  clickCount: number = 1
): Promise<void> {
  await sendCommand(activeTabId, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await sendCommand(activeTabId, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await sleep(delayBetweenClicks);
}

async function clickElement(activeTabId: number, payload: { id: number }) {
  const { x, y } = await getCenterCoordinates(payload.id);
  await clickAtPosition(activeTabId, x, y);
}

async function selectAllText(activeTabId: number, x: number, y: number) {
  await clickAtPosition(activeTabId, x, y, 3);
}

async function typeText(activeTabId: number, text: string): Promise<void> {
  for (const char of text) {
    await sendCommand(activeTabId, 'Input.dispatchKeyEvent', {
      type: 'keyDown',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
    await sendCommand(activeTabId, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
  }
}

async function blurFocusedElement(activeTabId: number) {
  const blurFocusedElementScript = `
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `;
  await sendCommand(activeTabId, 'Runtime.evaluate', {
    expression: blurFocusedElementScript,
  });
}

async function setValue(
  activeTabId: number,
  payload: { id: number; text: string }
): Promise<void> {
  const { x, y } = await getCenterCoordinates(payload.id);

  await selectAllText(activeTabId, x, y);
  await typeText(activeTabId, payload.text);
  // blur the element
  await blurFocusedElement(activeTabId);
}

export const domActions = {
  clickElement,
  setValue,
} as const;

export type DOMActions = typeof domActions;
type ActionName = keyof DOMActions;
export type DOMActionPayload<T extends ActionName> = Parameters<
  DOMActions[T]
>[1];

// Call this function from the content script
export const callDOMAction = async <T extends ActionName>(
  type: keyof typeof domActions,
  payload: DOMActionPayload<T>
): Promise<void> => {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');
  console.log('taking DOM action', type, payload, activeTab.id);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  chrome.debugger.attach({ tabId: activeTab.id }, '1.2', async () => {
    if (chrome.runtime.lastError) {
      console.error(
        'Failed to attach debugger:',
        chrome.runtime.lastError.message
      );
      throw new Error(
        `Failed to attach debugger: ${chrome.runtime.lastError.message}`
      );
    } else {
      console.log('attached to debugger');
      (async () => {
        try {
          // @ts-ignore
          await domActions[type](activeTab.id, payload);
        } finally {
          chrome.debugger.detach({ tabId: activeTab.id });
        }
      })();
    }
  });
};
