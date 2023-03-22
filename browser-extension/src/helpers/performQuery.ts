import { Configuration, OpenAIApi } from 'openai';
import { getValueFromStorage, SELECTED_OPENAI_MODEL } from '../state';
import { ExtractedAction } from './extractAction';

const systemMessage = `
You are a browser automation assistant.

You can use the following tools:

1. click(elementId: number): clicks on an element
2. setValue(elementId: number, value: string): focuses on and sets the value of an input element
3. finish(): indicates the task is finished, or that you are unable to complete the task

You will be be given a task to perform and the current state of the DOM. You will also be given previous thoughts and actions that you have taken. 

You should respond with an action to take in the following format:

<Thought>I should...</Thought>
<Action>click(number) or setValue(number, string)</Action>`;

export async function performQuery(
  taskInstructions: string,
  previousActions: ExtractedAction[],
  simplifiedDOM: string
) {
  const model = (await getValueFromStorage(
    SELECTED_OPENAI_MODEL,
    'gpt-3.5-turbo'
  )) as string;
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: (await chrome.storage.sync.get('openai-key'))['openai-key'],
    })
  );

  try {
    const completion = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0,
      stop: ['</Action>'],
    });

    return completion.data.choices[0].message?.content?.trim() + '</Action>';
  } catch (error: any) {
    throw new Error(error.response.data.error.message);
  }
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: ExtractedAction[],
  pageContents: string
) {
  let previousActionsString = '';

  if (previousActions.length > 0) {
    const serializedActions = previousActions
      .map(
        (action) =>
          `<Thought>${action.thought}</Thought>\n<Action>${action.action}</Action>`
      )
      .join('\n\n');
    previousActionsString = `You have already taken the following actions: \n${serializedActions}\n\n`;
  }

  return `The user requests the following task:

${taskInstructions}

${previousActionsString}

Current page contents:
${pageContents}`;
}
