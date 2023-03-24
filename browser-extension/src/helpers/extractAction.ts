import { DOMActionPayload } from './domActions';

type ExecutableAction =
  | {
      type: 'clickElement';
      args: DOMActionPayload<'clickElement'>;
    }
  | {
      type: 'setValue';
      args: DOMActionPayload<'setValue'>;
    }
  | {
      type: 'finish';
      args: {};
    };

export type ExtractedAction = {
  thought: string;
  action: string;
  executableAction: ExecutableAction;
};

export default function extractAction(text: string): ExtractedAction | null {
  // The string should have a substring with the format <Thought>...</Thought> and another with the format <Action>...</Action>. Extract the thought and action.

  const thought = text.match(/<Thought>(.*?)<\/Thought>/)?.[1];
  const action = text.match(/<Action>(.*?)<\/Action>/)?.[1];

  if (!thought || !action) {
    return null;
  }

  // The action should have the format click(number) or setValue(number, string). Extract the executable action with proper types.
  const actionType = action.match(/(click|setValue|finish)\(/)?.[1];

  if (!actionType) {
    return null;
  }

  let executableAction: ExecutableAction | null = null;

  if (actionType === 'click') {
    const index = action.match(/click\((\d+)\)/)?.[1];

    if (!index) return null;

    executableAction = {
      type: 'clickElement',
      args: {
        id: parseInt(index, 10),
      },
    };
  } else if (actionType === 'setValue') {
    const index = action.match(/setValue\((\d+),\s*(.*?)\)/)?.[1];
    const value = action.match(/setValue\((\d+),\s*(.*?)\)/)?.[2];

    if (!index || !value) return null;

    executableAction = {
      type: 'setValue',
      args: {
        id: parseInt(index, 10),
        value: JSON.parse(value) as string,
      },
    };
  } else if (actionType === 'finish') {
    executableAction = {
      type: 'finish',
      args: {},
    };
  }

  if (!executableAction) return null;

  return {
    thought,
    action,
    executableAction,
  };
}
