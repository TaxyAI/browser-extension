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

// @ts-ignore
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// @ts-ignore
async function simulateTyping(element, text, delay = 10) {
  if (!element) {
    console.error('No element provided');
    return;
  }

  if (
    !['INPUT', 'TEXTAREA'].includes(element.tagName) &&
    !(
      element.getAttribute('role') === 'textbox' &&
      element.getAttribute('contenteditable')
    )
  ) {
    console.error(
      'Element must be an input, textarea, or div with role of textbox and contenteditable attribute'
    );
    return;
  }

  element.focus();

  // Clear the existing text content
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = '';
  } else if (element.getAttribute('contenteditable')) {
    element.textContent = '';
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);
    const keydownEvent = new KeyboardEvent('keydown', {
      key: char,
      charCode: charCode,
      keyCode: charCode,
      which: charCode,
      bubbles: true,
    });
    const keypressEvent = new KeyboardEvent('keypress', {
      key: char,
      charCode: charCode,
      keyCode: charCode,
      which: charCode,
      bubbles: true,
    });
    const inputEvent = new InputEvent('input', { data: char, bubbles: true });

    element.dispatchEvent(keydownEvent);
    element.dispatchEvent(keypressEvent);

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value += char;
    } else if (element.getAttribute('contenteditable')) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(char));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.log('No selection found');
      }
    }

    element.dispatchEvent(inputEvent);

    // Wait for the specified delay before typing the next character
    await sleep(delay);
  }

  element.blur();
}

function simulateFocusedInputEdit(newValue: string) {
  // Get the currently focused input element
  var inputElement = document.activeElement;

  // Check if the input element is of the correct type
  if (!inputElement) {
    console.error('No text input or textarea is currently focused');
    return;
  }

  simulateTyping(inputElement, newValue);

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

// @ts-ignore
window.clickAndEdit = (x, y, newValue) => clickAndEdit({ x, y }, newValue);
