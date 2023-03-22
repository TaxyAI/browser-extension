// console.log('Content script loaded..');

import { watchForRPCRequests } from '../../helpers/pageRPC';

// @ts-ignore
window.logMouseCoordinates = function logMouseCoordinates() {
  document.addEventListener('mousemove', function (event) {
    console.log(`Mouse coordinates: (${event.clientX}, ${event.clientY})`);
  });
};

watchForRPCRequests();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('got message in generic receiver', message.type, message.payload);
  if (message.type === 'TESTING') {
    setTimeout(() => {
      sendResponse('hello from content script');
    }, 5000);
    return true;
  }
});
