import { callRPC } from './pageRPC';

async function getCenterCoordinates(
  id: number
): Promise<{ x: number; y: number }> {
  return callRPC('getElementCenterCoordinates', [id]);
}

const delayBetweenClicks = 100; // Set this value to control the delay between clicks
const delayBetweenKeystrokes = 100; // Set this value to control typing speed

async function clickAtPosition(
  x: number,
  y: number,
  activeTabId: number
): Promise<void> {
  await new Promise((resolve) => {
    chrome.debugger.sendCommand(
      { tabId: activeTabId },
      'Input.dispatchMouseEvent',
      {
        type: 'mousePressed',
        x: x,
        y: y,
        button: 'left',
        clickCount: 1,
      },
      () => {
        chrome.debugger.sendCommand(
          { tabId: activeTabId },
          'Input.dispatchMouseEvent',
          {
            type: 'mouseReleased',
            x: x,
            y: y,
            button: 'left',
            clickCount: 1,
          },
          () => {
            setTimeout(resolve, delayBetweenClicks);
          }
        );
      }
    );
  });
}

async function clickElement(payload: { id: number }, activeTabId: number) {
  const { x, y } = await getCenterCoordinates(payload.id);
  await clickAtPosition(x, y, activeTabId);
}

async function typeText(text: string, activeTabId: number): Promise<void> {
  for (const char of text) {
    await new Promise((resolve) => {
      chrome.debugger.sendCommand(
        { tabId: activeTabId },
        'Input.dispatchKeyEvent',
        {
          type: 'keyDown',
          text: char,
        },
        () => {
          setTimeout(resolve, delayBetweenKeystrokes / 2);
        }
      );
    });

    await new Promise((resolve) => {
      chrome.debugger.sendCommand(
        { tabId: activeTabId },
        'Input.dispatchKeyEvent',
        {
          type: 'keyUp',
          text: char,
        },
        () => {
          setTimeout(resolve, delayBetweenKeystrokes / 2);
        }
      );
    });
  }
}

async function setValue(
  payload: { id: number; text: string },
  activeTabId: number
): Promise<void> {
  console.log('setting value', payload, activeTabId);
  const { x, y } = await getCenterCoordinates(payload.id);

  for (let i = 0; i < 3; i++) {
    await clickAtPosition(x, y, activeTabId);
  }
  await typeText(payload.text, activeTabId);
}

export const domActions = {
  clickElement,
  setValue,
} as const;

export type DOMActions = typeof domActions;
type ActionName = keyof DOMActions;
export type DOMActionPayload<T extends ActionName> = Parameters<
  DOMActions[T]
>[0];

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
          await domActions[type](payload, activeTab.id);
        } finally {
          chrome.debugger.detach({ tabId: activeTab.id });
        }
      })();
    }
  });
};
