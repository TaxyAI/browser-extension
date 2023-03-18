import getAnnotatedDOM, { clickElement, setValue } from './getAnnotatedDOM';

export const methods = {
  'get-annotated-dom': getAnnotatedDOM,
  'click-element': clickElement,
  clickElement,
  'set-value': setValue,
  setValue,
} as const;

export type Methods = typeof methods;
type MethodName = keyof Methods;
type Payload<T extends MethodName> = Parameters<Methods[T]>;
type MethodRT<T extends MethodName> = ReturnType<Methods[T]>;

// Call this function from the content script
export const callRPC = async <T extends MethodName>(
  type: keyof typeof methods,
  payload?: Payload<T>
): Promise<MethodRT<T>> => {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  if (!activeTab?.id) throw new Error('No active tab found');
  console.log('sending message', type, payload, activeTab.id);
  const response: MethodRT<T> = await chrome.tabs.sendMessage(activeTab.id, {
    type,
    payload: payload || [],
  });
  console.log('got response', response);

  return response;
};

const isKnownMethodName = (type: string): type is MethodName => {
  return type in methods;
};

// This function should run in the content script
export const watchForRPCRequests = () => {
  window.rpc = methods;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('got message!', message.type, message.payload);
    const type = message.type;
    if (isKnownMethodName(type)) {
      // console.log('got message', type, message.payload);
      const resp = methods[type](...message.payload);
      if (resp instanceof Promise) {
        resp.then(sendResponse);
        return true;
      } else {
        sendResponse(resp);
      }
    }
  });
};
