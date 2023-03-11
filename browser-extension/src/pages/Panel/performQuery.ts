import { AlertStatus } from '@chakra-ui/react';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { ContentType } from '../../common/getPageContent';

export interface RecordedMessage {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
  type: AlertStatus;
}

export async function performQuery(
  messages: RecordedMessage[],
  pageContent: ContentType
) {
  const initialMessageContent = formatIntialMessageContent(pageContent);
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: (await chrome.storage.sync.get('openai-key'))['openai-key'],
    })
  );

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: initialMessageContent },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      max_tokens: 500,
    });
    console.log('completion', completion);

    return completion.data.choices[0].message?.content?.trim();
  } catch (error: any) {
    throw new Error(error.response.data.error.message);
  }
}

export function formatIntialMessageContent(pageContent: ContentType) {
  return `You are a research assistant named Leo. Read the following page, and answer any questions that the user asks. You may use your own knowledge as well as the page's contents.

-------
Title: ${pageContent.title}

Content:
${pageContent.markdown}
-------

`;
}
