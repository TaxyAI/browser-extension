function isInteractive(element: HTMLElement, style: CSSStyleDeclaration): boolean {
  return (
    element.tagName === "A" ||
    element.tagName === "INPUT" ||
    element.tagName === "BUTTON" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA" ||
    element.hasAttribute("onclick") ||
    element.hasAttribute("onmousedown") ||
    element.hasAttribute("onmouseup") ||
    element.hasAttribute("onkeydown") ||
    element.hasAttribute("onkeyup") ||
    style.cursor === "pointer"
  );
}

function isVisible(element: HTMLElement, style: CSSStyleDeclaration): boolean {
  return (
    style.opacity !== "" &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

let currentElements: HTMLElement[] = [];

function traverseDOM(node: Node, pageElements: HTMLElement[]) {
  console.log("traverseDOM", node, pageElements);
  const clonedNode = node.cloneNode(false) as Node;

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const style = window.getComputedStyle(element);

    const clonedElement = clonedNode as HTMLElement;

    pageElements.push(element);
    clonedElement.setAttribute("data-id", (pageElements.length - 1).toString());
    clonedElement.setAttribute("data-interactive", isInteractive(element, style).toString());
    clonedElement.setAttribute("data-visible", isVisible(element, style).toString());
  }

  node.childNodes.forEach((child) => {
    const result = traverseDOM(child, pageElements);
    clonedNode.appendChild(result.clonedDOM);
  });

  return {
    pageElements,
    clonedDOM: clonedNode,
  };
}

/**
 * getAnnotatedDom returns the pageElements array and a cloned DOM
 * with data-pe-idx attributes added to each element in the copy.
 */
export default function getAnnotatedDOM(dom: HTMLElement) {
  console.log("in the top", dom);
  console.log(dom.cloneNode(false));
  currentElements = [];
  const result = traverseDOM(dom, currentElements);
  console.log("currentElements length", currentElements.length);
  // console.log(result);
  // console.log(result.clonedDOM.outerHTML);
  return result.clonedDOM.outerHTML;
}

export function clickElement(id: number) {
  const element = currentElements[id];
  if (element) {
    element.click();
  }
}

export function setValue(id: number, value: string) {
  const element = currentElements[id];
  console.log("setValue", id, value, element);
  if (element && "value" in element) {
    element.value = value;
  }
}
