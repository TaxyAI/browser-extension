import { Methods } from './pageRPC';

type Action =
  | {
      type: 'clickElement';
      args: Parameters<Methods['clickElement']>;
    }
  | {
      type: 'setValue';
      args: Parameters<Methods['setValue']>;
    };

export default function extractActions(text: string): Action[] {
  const actionRegex =
    /^Action \d+:\s*([\w\s\S]*?)\(([\s\S]*?)(?=\):END_ACTION)/gm;
  const actions: Action[] = [];

  let match;

  while ((match = actionRegex.exec(text)) !== null) {
    const action = match[1];
    const args = match[2]
      .split(',')
      .map((arg) => arg.trim())
      .map((arg) => arg.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'))
      // unescape newlines
      .map((arg) => arg.replace(/\\n/g, '\n'));

    if (action === 'click') {
      actions.push({
        type: 'clickElement',
        args: [parseInt(args[0].replace(/^element\((\d+)\)$/, '$1'))],
      });
    } else if (action === 'setValue') {
      actions.push({
        type: 'setValue',
        args: [parseInt(args[0].replace(/^element\((\d+)\)$/, '$1')), args[1]],
      });
    }
    // actions.push([action, args]);
  }

  return actions;
}
