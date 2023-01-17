import { Configuration, OpenAIApi } from 'openai';
import { ContentType } from './getPageContent';

// TODO: ask the user to give us their key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_DEV_KEY,
});
const openai = new OpenAIApi(configuration);

export async function performQuery(query: string, pageContent: ContentType) {
  const prompt = formatPrompt(query, pageContent);

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
