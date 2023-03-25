import { WEBAGENT_ELEMENT_SELECTOR } from '../constants';
import { useAppState } from '../state/store';
import { callRPC } from './pageRPC';
import { scrollScriptString } from './runtimeFunctionStrings';
import { sleep } from './utils';

async function sendCommand(method: string, params?: any) {
  const tabId = useAppState.getState().currentTask.tabId;
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

const delayBetweenClicks = 1000; // Set this value to control the delay between clicks
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
  const objectId = await getObjectId(payload.id);
  await scrollIntoView(objectId);
  const { x, y } = await getCenterCoordinates(objectId);

  await selectAllText(x, y);
  await typeText(payload.value);
  // blur the element
  await blurFocusedElement();
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
  console.log('taking DOM action', type, payload);

  const blacklistedExtensionIds = [
    // Dashlane
    'fdjamakpfbbddfjaooikfcpapjohcfmg',
    // LastPass
    'hdokiejnpimakedhajhdlcegeplioahd',
  ];

  const enabledBlacklistedExtensions = await new Promise<
    chrome.management.ExtensionInfo[]
  >((resolve, reject) => {
    chrome.management.getAll((extensions) => {
      if (chrome.runtime.lastError) {
        console.error(
          'Failed to get extensions:',
          chrome.runtime.lastError.message
        );
        reject(chrome.runtime.lastError);
      } else {
        resolve(
          extensions.filter(
            (extension) =>
              extension.type === 'extension' &&
              extension.enabled &&
              blacklistedExtensionIds.includes(extension.id)
          )
        );
      }
    });
  });

  for (const extension of enabledBlacklistedExtensions) {
    chrome.management.setEnabled(extension.id, false, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Failed to disable extension ${extension.id}:`,
          chrome.runtime.lastError.message
        );
      }
    });
  }

  // @ts-ignore
  await domActions[type](payload);
  console.log('DOM action complete');

  for (const extension of enabledBlacklistedExtensions) {
    chrome.management.setEnabled(extension.id, true, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Failed to enable extension ${extension.id}:`,
          chrome.runtime.lastError.message
        );
      }
    });
  }
};
