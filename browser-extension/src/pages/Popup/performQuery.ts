import { Configuration, OpenAIApi } from 'openai';
import { ContentType } from './getPageContent';

export async function performQuery(query: string, pageContent: ContentType) {
  const prompt = formatPrompt(query, pageContent);
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: (await chrome.storage.sync.get('openai-key'))['openai-key'],
    })
  );

  // return `Answer to "${query}": ${pageContent.title}`;

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 100,
    temperature: 0,
  });
  return completion.data.choices[0].text?.trim() ?? 'Not enough information';
}

export function formatPrompt(query: string, pageContent: ContentType) {
  return `You are a research assistant. Read the following page, and answer the question at the end. You may use your own knowledge as well as the page's contents to answer the question. Return only the answer. If you don't know the answer, return "Not enough information". Return the answer as markdown.
  
-------
Title: ${pageContent.title}

Content:
${pageContent.markdown}
-------

Prompt: ${query}

Answer:`;
}
