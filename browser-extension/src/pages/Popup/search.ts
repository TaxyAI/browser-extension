export default async function performSearch(query) {
  const html = await getPageContents();
  return html;
}

async function getPageContents() {
  let queryOptions = { active: true, currentWindow: true };
  let activeTab = (await chrome.tabs.query(queryOptions))[0];

  // console.log(activeTab, activeTab.title);
  if (!activeTab?.id) throw new Error('No active tab found');
  const response = await chrome.tabs.sendMessage(activeTab.id, {
    type: 'get-page-contents',
  });
  console.log('got resp', response);

  return response.html;
}
