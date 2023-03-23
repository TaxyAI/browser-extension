import { WEBAGENT_ELEMENT_SELECTOR } from '../constants';
import { useAppStore } from '../state/store';
import { callRPC } from './pageRPC';
import { scrollScriptString } from './runtimeFunctionStrings';
import { sleep } from './utils';

async function sendCommand(method: string, params?: any) {
  const tabId = useAppStore.getState().currentTask.tabId;
  return chrome.debugger.sendCommand({ tabId }, method, params);
}

async function getObjectId(originalId: number) {
  const uniqueId = await callRPC('getUniqueElementSelectorId', [originalId]);
  // get node id
  const document = (await sendCommand('DOM.getDocument')) as any;
  const { nodeId } = (await sendCommand('DOM.querySelector', {
    nodeId: document.root.nodeId,
    selector: `[${WEBAGENT_ELEMENT_SELECTOR}="${uniqueId}"]`,
  })) as any;
  if (!nodeId) {
    throw new Error('Could not find node');
  }
  // get object id
  const result = (await sendCommand('DOM.resolveNode', { nodeId })) as any;
  const objectId = result.object.objectId;
  if (!objectId) {
    throw new Error('Could not find object');
  }
  return objectId;
}

async function scrollIntoView(objectId: string) {
  await sendCommand('Runtime.callFunctionOn', {
    objectId,
    functionDeclaration: scrollScriptString,
  });
  await sleep(1000);
}

async function getCenterCoordinates(objectId: string) {
  const { model } = (await sendCommand('DOM.getBoxModel', { objectId })) as any;
  const [x1, y1, x2, y2, x3, y3, x4, y4] = model.border;
  const centerX = (x1 + x3) / 2;
  const centerY = (y1 + y3) / 2;
  return { x: centerX, y: centerY };
}

const delayBetweenClicks = 200; // Set this value to control the delay between clicks
const delayBetweenKeystrokes = 100; // Set this value to control typing speed

async function clickAtPosition(
  x: number,
  y: number,
  clickCount: number = 1
): Promise<void> {
  callRPC('ripple', [x, y]);
  await sendCommand('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await sendCommand('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount,
  });
  await sleep(delayBetweenClicks);
}

async function clickElement(payload: { id: number }) {
  const objectId = await getObjectId(payload.id);
  await scrollIntoView(objectId);
  const { x, y } = await getCenterCoordinates(objectId);
  await clickAtPosition(x, y);
}

async function selectAllText(x: number, y: number) {
  await clickAtPosition(x, y, 3);
}

async function typeText(text: string): Promise<void> {
  for (const char of text) {
    await sendCommand('Input.dispatchKeyEvent', {
      type: 'keyDown',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
    await sendCommand('Input.dispatchKeyEvent', {
      type: 'keyUp',
      text: char,
    });
    await sleep(delayBetweenKeystrokes / 2);
  }
}

async function blurFocusedElement() {
  const blurFocusedElementScript = `
      if (document.activeElement) {
        document.activeElement.blur();
      }
    `;
  await sendCommand('Runtime.evaluate', {
    expression: blurFocusedElementScript,
  });
}

async function setValue(payload: { id: number; value: string }): Promise<void> {
  console.log(0);
  console.log(chrome.runtime.lastError);
  const objectId = await getObjectId(payload.id);
  console.log(1);
  console.log(chrome.runtime.lastError);
  await scrollIntoView(objectId);
  console.log(2);
  console.log(chrome.runtime.lastError);
  const { x, y } = await getCenterCoordinates(objectId);
  console.log(3);
  console.log(chrome.runtime.lastError);

  await selectAllText(x, y);
  console.log(4);
  console.log(chrome.runtime.lastError);
  await typeText(payload.value);
  console.log(5);
  console.log(chrome.runtime.lastError);
  // blur the element
  await blurFocusedElement();
  console.log(6);
  console.log(chrome.runtime.lastError);
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
  const tabId = useAppStore.getState().currentTask.tabId;
  console.log('taking DOM action', type, payload);

  // wrap in a promise so we can await the detach
  await new Promise<void>((resolve, reject) => {
    try {
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

          await sendCommand('DOM.enable');
          console.log('DOM enabled');
          await sendCommand('Runtime.enable');
          console.log('Runtime enabled');

          try {
            // @ts-ignore
            await domActions[type](payload);
            console.log('DOM action complete');
          } finally {
            chrome.debugger.detach({ tabId });
            resolve();
          }
        }
      });
    } catch (e) {
      reject();
      throw e;
    }
  });
};
