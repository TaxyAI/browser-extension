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

function click(x: number, y: number) {
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const mousedownEvent = new MouseEvent('mousedown', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const el: any = document.elementFromPoint(x, y);

  el.dispatchEvent(clickEvent);
  el.dispatchEvent(mousedownEvent);
}
// @ts-ignore
window.click = click;

// @ts-ignore
window.logMouseCoordinates = function logMouseCoordinates() {
  document.addEventListener('mousemove', function (event) {
    console.log(`Mouse coordinates: (${event.clientX}, ${event.clientY})`);
  });
};

function simulateFocusedInputEdit(newValue: string) {
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

  // @ts-ignore
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
}
// @ts-ignore
window.simulateFocusedInputEdit = simulateFocusedInputEdit;

function clickAndEdit(x: number, y: number, newValue: string) {
  // Click the element

  click(x, y);

  // Wait for the element to be focused
  setTimeout(() => {
    // Edit the input value
    simulateFocusedInputEdit(newValue);
  }, 100);
}
// @ts-ignore
window.clickAndEdit = clickAndEdit;

watchForRPCRequests();
