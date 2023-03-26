// console.log('Content script loaded..');

import { watchForRPCRequests } from '../../helpers/pageRPC';

// @ts-ignore
window.logMouseCoordinates = function logMouseCoordinates() {
  document.addEventListener('mousemove', function (event) {
    console.log(`Mouse coordinates: (${event.clientX}, ${event.clientY})`);
  });
};

watchForRPCRequests();
