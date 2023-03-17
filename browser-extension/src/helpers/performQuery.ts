import { Configuration, OpenAIApi } from 'openai';

export async function performQuery(
  instructions: string,
  simplifiedDOM: string
) {
  const prompt = formatPrompt(instructions, simplifiedDOM);
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: (await chrome.storage.sync.get('openai-key'))['openai-key'],
    })
  );

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a tool to help users automate actions in their browser.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });
    console.log('completion', completion);

    return completion.data.choices[0].message?.content?.trim() || '';
  } catch (error: any) {
    throw new Error(error.response.data.error.message);
  }
}

export function formatPrompt(instructions: string, simplifiedDOM: string) {
  return `Here is a simplified version of the DOM of a webpage, with many non-interactive elements removed:
  
\`\`\`
${simplifiedDOM}
\`\`\`

Write a javascript function to do the following, interacting only with the elements we provide:

${instructions}`;
}
