// Get the HTML of the active tab
export async function getPageHTML() {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // If the active tab is a chrome-extension:// page, then we need to get some random other tab for testing
  if (activeTab.url?.startsWith('chrome')) {
    queryOptions = { active: false, currentWindow: true };
    activeTab = (await chrome.tabs.query(queryOptions))[0];
  }

  // console.log(activeTab, activeTab.title);
  if (!activeTab?.id) throw new Error('No active tab found');
  const response = await chrome.tabs.sendMessage(activeTab.id, {
    type: 'get-page-contents',
  });

  return response.html;
}

// Get the relevant HTML for the active tab
export const getRelevantHTML = (instructions: string, html: string) => {
  return html;
};
