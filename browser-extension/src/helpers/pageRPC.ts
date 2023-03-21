import getAnnotatedDOM, {
  getElementCenterCoordinates,
} from './getAnnotatedDOM';

export const rpcMethods = {
  getAnnotatedDOM,
  getElementCenterCoordinates,
} as const;

export type RPCMethods = typeof rpcMethods;
type MethodName = keyof RPCMethods;
type Payload<T extends MethodName> = Parameters<RPCMethods[T]>;
type MethodRT<T extends MethodName> = ReturnType<RPCMethods[T]>;

// Call this function from the content script
export const callRPC = async <T extends MethodName>(
  type: keyof typeof rpcMethods,
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
  return type in rpcMethods;
};

// This function should run in the content script
export const watchForRPCRequests = () => {
  // @ts-ignore
  window.rpc = rpcMethods;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('got message!', message.type, message.payload);
    const type = message.type;
    if (isKnownMethodName(type)) {
      // @ts-ignore
      const resp = rpcMethods[type](...message.payload);
      if (resp instanceof Promise) {
        resp.then(sendResponse);
        return true;
      } else {
        sendResponse(resp);
      }
    }
  });
};
