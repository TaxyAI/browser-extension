export function click({ x, y }: { x: number; y: number }) {
  const mousedownEvent = new MouseEvent('mousedown', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const mouseUpEvent = new MouseEvent('mouseup', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y,
  });

  const el: any = document.elementFromPoint(x, y);

  el.dispatchEvent(mousedownEvent);
  el.dispatchEvent(mouseUpEvent);
  el.dispatchEvent(clickEvent);
}

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
