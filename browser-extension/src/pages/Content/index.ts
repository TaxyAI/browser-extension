// console.log('Content script loaded..');

// Listen for the popup to send the `get-page-contents` message, and respond
// with the full HTML of the current page

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-page-contents') {
    sendResponse({
      html: document.documentElement.outerHTML,
    });
  }
});
