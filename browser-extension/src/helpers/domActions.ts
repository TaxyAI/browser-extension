import { WEBAGENT_ELEMENT_SELECTOR } from '../constants';
import { callRPC } from './pageRPC';
import { scrollScriptString } from './runtimeFunctionStrings';
import { sleep } from './sleep';

async function getObjectId(tabId: number, originalId: number) {
  const uniqueId = await callRPC('getUniqueElementSelectorId', [originalId]);
  // get node id
  const document = (await chrome.debugger.sendCommand(
    { tabId },
    'DOM.getDocument'
  )) as any;
  const { nodeId } = (await chrome.debugger.sendCommand(
    { tabId },
    'DOM.querySelector',
    {
      nodeId: document.root.nodeId,
      selector: `[${WEBAGENT_ELEMENT_SELECTOR}="${uniqueId}"]`,
    }
  )) as any;
  if (!nodeId) {
    throw new Error('Could not find node');
  }
  // get object id
  const result = (await chrome.debugger.sendCommand(
    { tabId },
    'DOM.resolveNode',
    { nodeId }
  )) as any;
  const objectId = result.object.objectId;
  if (!objectId) {
    throw new Error('Could not find object');
  }
  return objectId;
}

async function scrollIntoView(tabId: number, objectId: string) {
  await chrome.debugger.sendCommand(
    { tabId: tabId },
    'Runtime.callFunctionOn',
    { objectId, functionDeclaration: scrollScriptString }
  );
  await sleep(500);
}

async function getCenterCoordinates(tabId: number, objectId: string) {
  const { model } = (await chrome.debugger.sendCommand(
    { tabId: tabId },
    'DOM.getBoxModel',
    { objectId }
  )) as any;
  const [x1, y1, x2, y2, x3, y3, x4, y4] = model.border;
  const centerX = (x1 + x3) / 2;
  const centerY = (y1 + y3) / 2;
  return { x: centerX, y: centerY };
}

const delayBetweenClicks = 200; // Set this value to control the delay between clicks
const delayBetweenKeystrokes = 100; // Set this value to control typing speed

async function clickAtPosition(
  tabId: number,
  x: number,
  y: number,
  clickCount: number = 1
): Promise<void> {
  await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await sleep(delayBetweenClicks);
}

async function clickElement(tabId: number, payload: { id: number }) {
  const objectId = await getObjectId(tabId, payload.id);
  await scrollIntoView(tabId, objectId);
  const { x, y } = await getCenterCoordinates(tabId, objectId);
  await clickAtPosition(tabId, x, y);
}

async function selectAllText(tabId: number, x: number, y: number) {
  await clickAtPosition(tabId, x, y, 3);
}

async function typeText(tabId: number, text: string): Promise<void> {
  for (const char of text) {
    await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
      type: 'keyDown',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
    await chrome.debugger.sendCommand({ tabId }, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
  }
}

async function blurFocusedElement(tabId: number) {
  const blurFocusedElementScript = `
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `;
  await chrome.debugger.sendCommand({ tabId }, 'Runtime.evaluate', {
    expression: blurFocusedElementScript,
  });
}

async function setValue(
  tabId: number,
  payload: { id: number; text: string }
): Promise<void> {
  const objectId = await getObjectId(tabId, payload.id);
  await scrollIntoView(tabId, objectId);
  const { x, y } = await getCenterCoordinates(tabId, objectId);

  await selectAllText(tabId, x, y);
  await typeText(tabId, payload.text);
  // blur the element
  await blurFocusedElement(tabId);
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

  const tabId = activeTab.id;
  if (!tabId) throw new Error('No active tab found');
  console.log('taking DOM action', type, payload);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  chrome.debugger.attach({ tabId }, '1.2', async () => {
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

      await chrome.debugger.sendCommand({ tabId }, 'DOM.enable');
      await chrome.debugger.sendCommand({ tabId }, 'Runtime.enable');

      (async () => {
        try {
          // @ts-ignore
          await domActions[type](tabId, payload);
        } finally {
          chrome.debugger.detach({ tabId });
        }
      })();
    }
  });
};
