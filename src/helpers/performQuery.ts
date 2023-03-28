import {
  Configuration,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import { useAppState } from '../state/store';
import { ExtractedAction } from './extractAction';

const systemMessage = `
You are a browser automation assistant.

You can use the following tools:

1. click(elementId: number): clicks on an element
2. setValue(elementId: number, value: string): focuses on and sets the value of an input element
3. finish(): indicates the task is finished
4. fail(): indicates that you are unable to complete the task

You will be be given a task to perform and the current state of the DOM. You will also be given previous actions that you have taken. You may retry a failed action up to one time.

This is an example of an action:

<Thought>I should click the add to cart button</Thought>
<Action>click(223)</Action>`;

export async function performQuery(
  taskInstructions: string,
  previousActions: ExtractedAction[],
  simplifiedDOM: string,
  maxAttempts: number = 3,
  notifyError?: (error: string) => void
) {
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.('No OpenAI key found');
    return null;
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: key,
    })
  );

  for (let i = 0; i < maxAttempts; i++) {
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

      return {
        usage: completion.data.usage as CreateCompletionResponseUsage,
        prompt,
        response:
          completion.data.choices[0].message?.content?.trim() + '</Action>',
      };
    } catch (error: any) {
      console.log('performQuery error', error);
      if (error.response.data.error.message.includes('server error')) {
        // Problem with the OpenAI API, try again
        if (notifyError) {
          notifyError(error.response.data.error.message);
        }
      } else {
        // Another error, give up
        throw new Error(error.response.data.error.message);
      }
    }
  }
  throw new Error(
    `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
  );
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

Current time: ${new Date().toLocaleString()}

Current page contents:
${pageContents}`;
}
