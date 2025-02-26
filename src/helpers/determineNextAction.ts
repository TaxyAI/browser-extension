import OpenAI from 'openpipe/openai';
import { useAppState } from '../state/store';
import { formattedActions } from './availableActions';
import { ParsedResponseSuccess } from './parseResponse';

const getSystemMessage = () => `
You are a browser automation assistant.

You can use the following tools:

${formattedActions}

You will be be given a task to perform and the current state of the DOM. You will also be given previous actions that you have taken. You may retry a failed action up to one time.

This is an example of an action:

<CurrentStep>1</CurrentStep>
<Thought>I should click the add to cart button</Thought>
<Action>click(223)</Action>

CurrentStep is the step of the plan that you are currently on. It is a string that you can increment. Some steps may take more than one action to complete.
You must always include the <Thought>, <CurrentStep>, and <Action> open/close tags or else your response will be marked as invalid.`;

async function generatePlan(taskInstructions: string, simplifiedDOM: string) {
  const model = useAppState.getState().settings.selectedModel;
  const openAIKey = useAppState.getState().settings.openAIKey;
  const openPipeKey = useAppState.getState().settings.openPipeKey;

  if (!openAIKey) {
    throw new Error('No OpenAI key found');
  }

  const openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true,
    openpipe: {
      apiKey: openPipeKey ?? undefined,
    },
  });

  const planPrompt = `
You are a browser automation planner. Create a step-by-step plan to accomplish the following task:

${taskInstructions}

Provide a numbered list of high-level steps to complete this task. Where each step corresponds to a click. Be specific but concise.
`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: planPrompt }],
      max_completion_tokens: 1000,
      reasoning_effort: model === 'o1' ? 'low' : undefined,
      temperature: 0,
      store: openPipeKey ? true : false,
    });

    const plan = completion.choices[0].message?.content?.trim();
    console.log('plan', plan);
    return plan;
  } catch (error: any) {
    console.error('Error generating plan:', error);
    throw new Error(`Failed to generate plan: ${error.message}`);
  }
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  pageContents: string,
  plan?: string
) {
  let previousActionsString = '';

  if (previousActions.length > 0) {
    const serializedActions = previousActions
      .map(
        (action) =>
          `<Thought>${action.thought}</Thought>\n<CurrentStep>${action.currentStep}</CurrentStep>\n<Action>${action.action}</Action>`
      )
      .join('\n\n');
    previousActionsString = `You have already taken the following actions: \n${serializedActions}\n\n`;
  }

  const planInfo = plan
    ? `Here is the plan for completing this task:\n${plan}\n\n 
    Follow this plan to complete the task. \n\n`
    : '';

  return `The user requests the following task:

${taskInstructions}

${planInfo}${previousActionsString}

Current page contents:
${pageContents}`;
}

export async function determineNextAction(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  simplifiedDOM: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
  existingPlan?: string | null
) {
  const model = useAppState.getState().settings.selectedModel;
  const openAIKey = useAppState.getState().settings.openAIKey;
  const openPipeKey = useAppState.getState().settings.openPipeKey;

  if (!openAIKey) {
    notifyError?.('No OpenAI key found');
    return null;
  }

  let plan = existingPlan || undefined;
  if (!plan && previousActions.length === 0) {
    try {
      plan = await generatePlan(taskInstructions, simplifiedDOM);
    } catch (error: any) {
      notifyError?.(error.message);
    }
  }

  const prompt = formatPrompt(
    taskInstructions,
    previousActions,
    simplifiedDOM,
    plan || undefined
  );

  const openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true,
    openpipe: {
      apiKey: openPipeKey ?? undefined,
    },
  });

  console.log('prompt', prompt);
  console.log('getSystemMessage', getSystemMessage());
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: getSystemMessage(),
          },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: 5000,
        reasoning_effort: model === 'o1' ? 'low' : undefined,
        temperature: model === 'o1' ? undefined : 0,
        stop: ['</Action>'],
        store: openPipeKey ? true : false,
      });

      const response =
        completion.choices[0].message?.content?.trim() + '</Action>';

      console.log('OpenAI response:', response);

      return {
        usage: completion.usage,
        prompt,
        response: completion.choices[0].message?.content?.trim() + '</Action>',
        plan: plan || undefined,
      };
    } catch (error: any) {
      console.log('determineNextAction error', error);
      if (error.message.includes('server error')) {
        if (notifyError) {
          notifyError(error.message);
        }
      } else {
        throw new Error(error.message);
      }
    }
  }
  throw new Error(
    `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
  );
}
