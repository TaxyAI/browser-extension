// console.log('Content script loaded..');

import { watchForRPCRequests } from '../../helpers/pageRPC';

// Listen for the popup to send the `get-page-contents` message, and respond
// with the full HTML of the current page

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-page-contents') {
    sendResponse({
      html: document.documentElement.outerHTML,
    });
  }
});

// @ts-ignore
window.click = function click(x: number, y: number) {
  const ev = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const el: any = document.elementFromPoint(x, y);

  el.dispatchEvent(ev);
};

// @ts-ignore
window.logMouseCoordinates = function logMouseCoordinates() {
  document.addEventListener('mousemove', function (event) {
    console.log(`Mouse coordinates: (${event.clientX}, ${event.clientY})`);
  });
};

// @ts-ignore
window.simulateFocusedInputEdit = function simulateFocusedInputEdit(newValue) {
  // Get the currently focused input element
  var inputElement = document.activeElement;

  // Check if the input element is of the correct type
  if (
    !inputElement ||
    (inputElement.tagName.toLowerCase() !== 'input' &&
      inputElement.tagName.toLowerCase() !== 'textarea')
  ) {
    console.error('No text input or textarea is currently focused');
    return;
  }

  // Edit the input value
  inputElement.value = newValue;

  // Trigger the input event to simulate an update
  var inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  inputElement.dispatchEvent(inputEvent);

  // Trigger the change event to simulate an update after losing focus
  var changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true,
  });
  inputElement.dispatchEvent(changeEvent);
};

// @ts-ignore
window.clickAndEdit = function clickAndEdit(x, y, newValue) {
  // Click the element
  window.click(x, y);

  // Wait for the element to be focused
  setTimeout(() => {
    // Edit the input value
    window.simulateFocusedInputEdit(newValue);
  }, 100);
};

watchForRPCRequests();
