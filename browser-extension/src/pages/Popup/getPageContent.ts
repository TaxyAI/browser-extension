import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const turnDown = new TurndownService();

// ContentType is the return type of getPageContent
export type ContentType = NonNullable<
  Awaited<ReturnType<typeof getPageContent>>
>;

export default async function getPageContent() {
  const html = await getHTML();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const reader = new Readability(doc);
  const parsed = reader.parse();

  console.log('parsed', parsed);
  if (parsed != null) {
    return {
      ...parsed,
      markdown: turnDown.turndown(parsed.content),
    };
  }
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

  return response.html;
}
