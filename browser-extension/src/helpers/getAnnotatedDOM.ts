type ElementsResult = {
  pageElements: HTMLElement[];
  clonedDOM: Node;
};

function traverseDOM(
  node: Node,
  pageElements: HTMLElement[] = []
): ElementsResult {
  const clonedNode = node.cloneNode(false) as Node;

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const clonedElement = clonedNode as HTMLElement;

    pageElements.push(element);
    clonedElement.setAttribute(
      'data-llm-id',
      (pageElements.length - 1).toString()
    );
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
export default function getAnnotatedDOM() {
  const result = traverseDOM(document.documentElement);
  console.log(result);
  return result.clonedDOM.outerHTML;
}
