export function click({ x, y }: { x: number; y: number }) {
  // Get the element at the specified coordinates
  const targetElement = document.elementFromPoint(x, y);

  // If an element is found, create and dispatch mouse events
  if (targetElement) {
    const mouseEvents = [
      'touchstart',
      'touchend',
      'touchmove',
      'pointerdown',
      'pointerup',
      'pointermove',
      'mousedown',
      'mouseup',
      'click',
    ];

    mouseEvents.forEach((eventType, index) => {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      });

      setTimeout(() => targetElement.dispatchEvent(event), index * 10);
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
    if (
      ['INPUT', 'TEXTAREA'].includes(targetElement.tagName) ||
      targetElement.getAttribute('contenteditable')
    ) {
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
  if (!inputElement) {
    console.error('No text input or textarea is currently focused');
    return;
  }

  if (
    inputElement.tagName.toLowerCase() === 'input' ||
    inputElement.tagName.toLowerCase() === 'textarea'
  ) {
    // @ts-ignore
    inputElement.value = newValue;
  } else if (inputElement.getAttribute('contenteditable')) {
    inputElement.textContent = newValue;
  } else {
    // Send a keyboard event for each character in the new value
    for (var i = 0; i < newValue.length; i++) {
      var key = newValue[i];
      var keyPressEvent = new KeyboardEvent('keypress', {
        key,
        bubbles: true,
        cancelable: true,
      });
      inputElement.dispatchEvent(keyPressEvent);
    }
  }

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
  // Click the element 3 times, with a 10ms delay between each click
  click(coords);
  setTimeout(() => click(coords), 10);
  setTimeout(() => click(coords), 20);

  // Wait for the element to be focused
  setTimeout(() => {
    // Edit the input value
    simulateFocusedInputEdit(newValue);
  }, 1000);
}
