import {
  Configuration,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import { useAppState } from '../state/store';
import { availableActions } from './availableActions';
import { ParsedResponseSuccess } from './parseResponse';

const formattedActions = availableActions
  .map((action, i) => {
    const args = action.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(', ');
    return `${i + 1}. ${action.name}(${args}): ${action.description}`;
  })
  .join('\n');

const systemMessage = `
You are a browser automation assistant.

You can use the following tools:

${formattedActions}

You will be be given a task to perform and the current state of the DOM. You will also be given previous actions that you have taken. You may retry a failed action up to one time.

This is an example of an action:

<Thought>I should click the add to cart button</Thought>
<Action>click(223)</Action>

You must always include the <Thought> and <Action> open/close tags or else your response will be marked as invalid.`;

// interface InjectionCheckResponse {
//   isInjectionAttempt: boolean;
// }

// export async function checkForInjection(prompt: string): Promise<boolean> {
//   const pgApiKey = useAppState.getState().settings.PGKey;
//   if (pgApiKey === null) {
//     console.error("PG_API_KEY is not set. Aborting injection check.");
//     throw new Error("PG_API_KEY is not set. Aborting injection check.");
//   }

//   const response = await fetch('https://api.predictionguard.com/injection', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': pgApiKey, 
//     },
//     body: JSON.stringify({
//       prompt: prompt,
//       detect: true,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   const data = await response.json();
//   const probability = data.checks[0].probability;
//   return probability > 0.5;
// }

// In determineNextAction file or wherever checkForInjection is defined

// Assuming formatPrompt is defined elsewhere and correctly formats the input.

export async function checkForInjectionAndGetProbability(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  simplifiedDOM: string
): Promise<number> {
  const pgApiKey = useAppState.getState().settings.PGKey;
  if (!pgApiKey) {
    console.error("PG_API_KEY is not set. Aborting injection check.");
    throw new Error("PG_API_KEY is not set. Aborting injection check.");
  }
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);

  const response = await fetch('https://api.predictionguard.com/injection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': pgApiKey,
    },
    body: JSON.stringify({
      prompt: prompt,
      detect: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const probability = data.checks[0].probability;
  return probability;
}


export async function determineNextAction(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  simplifiedDOM: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void
) {
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.('No OpenAI key found');
    return null;
  }

  const openai = new OpenAIApi(new Configuration({ apiKey: key }));

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await openai.createChatCompletion({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0,
        stop: ['</Action>'],
      });

      // Include the injectionProbability in the return value
      return {
        usage: completion.data.usage as CreateCompletionResponseUsage,
        prompt,
        response: completion.data.choices[0].message?.content?.trim() + '</Action>',
      };
    } catch (error: any) {
      console.log('determineNextAction error', error);
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message.includes('server error')) {
        if (notifyError) {
          notifyError(error.response.data.error.message);
        }
      } else {
        throw new Error(error.response.data.error.message);
      }
    }
  }
  throw new Error(`Failed to complete query after ${maxAttempts} attempts. Please try again later.`);
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
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
