import { Methods } from './pageRPC';

type Action =
  | {
      type: 'click-element';
      args: Parameters<Methods['click-element']>;
    }
  | {
      type: 'set-value';
      args: Parameters<Methods['set-value']>;
    };

export default function extractActions(text: string): Action[] {
  const actionRegex = /^Action \d+:\s*(\w+)\(([^)]*)\)/gm;
  const actions: Action[] = [];

  let match;

  while ((match = actionRegex.exec(text)) !== null) {
    const action = match[1];
    const args = match[2]
      .split(',')
      .map((arg) => arg.trim())
      .map((arg) => arg.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));

    if (action === 'click') {
      actions.push({
        type: 'click-element',
        args: [parseInt(args[0].replace(/^element\((\d+)\)$/, '$1'))],
      });
    } else if (action === 'setValue') {
      actions.push({
        type: 'set-value',
        args: [parseInt(args[0].replace(/^element\((\d+)\)$/, '$1')), args[1]],
      });
    }
    // actions.push([action, args]);
  }

  return actions;
}
