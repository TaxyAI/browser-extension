export function click({ x, y }: { x: number; y: number }) {
  // Get the element at the specified coordinates
  const targetElement = document.elementFromPoint(x, y);

  // If an element is found, create and dispatch mouse events
  if (targetElement) {
    const mouseEvents = ['mousedown', 'mouseup', 'click'];

    mouseEvents.forEach((eventType) => {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      });

      targetElement.dispatchEvent(event);
    });

    // Custom focus event for input and textarea elements
    // @ts-ignore
    function focusElement(element) {
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      element.dispatchEvent(focusEvent);
      element.focus();
    }

    // If the target element is an input or textarea, trigger the custom focus event
    if (['INPUT', 'TEXTAREA'].includes(targetElement.tagName)) {
      focusElement(targetElement);
    }
  } else {
    console.warn(`No element found at the specified coordinates (${x}, ${y})`);
  }
}
// @ts-ignore
window.click = (x, y) => click({ x, y });

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

export function clickAndEdit(
  coords: { x: number; y: number },
  newValue: string
) {
  // Click the element

  click(coords);

  // Wait for the element to be focused
  setTimeout(() => {
    // Edit the input value
    simulateFocusedInputEdit(newValue);
  }, 1000);
}
