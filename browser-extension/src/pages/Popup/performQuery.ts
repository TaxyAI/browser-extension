import { Configuration, OpenAIApi } from 'openai';
import { ContentType } from '../../common/getPageContent';

export async function performQuery(query: string, pageContent: ContentType) {
  const prompt = formatPrompt(query, pageContent);
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: (await chrome.storage.sync.get('openai-key'))['openai-key'],
    })
  );

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content:
            'You are a helpful human assistant who really wants to give an answer to any question. You always do your best to answer any question you are asked.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });
    console.log('completion', completion);

    return completion.data.choices[0].message?.content?.trim();
  } catch (error: any) {
    throw new Error(error.response.data.error.message);
  }
}

export function formatPrompt(query: string, pageContent: ContentType) {
  return `You are a research assistant. Read the following page, and answer the question at the end. You may use your own knowledge as well as the page's contents to answer the question. Return only the answer. Return the answer as markdown.
  
-------
Title: ${pageContent.title}

Content:
${pageContent.markdown}
-------

Prompt: ${query}

Answer:`;
}
