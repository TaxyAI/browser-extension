// import extractor from '../../vendor/unfluff/src/unfluff';
import { Readability } from '@mozilla/readability';

export default async function getPageContent() {
  const html = await getHTML();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const reader = new Readability(doc);
  return reader.parse();
}

async function getHTML() {
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
  console.log('got resp', response);

  return response.html;
}
