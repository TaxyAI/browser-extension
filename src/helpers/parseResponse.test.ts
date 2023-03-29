import { it, expect, describe } from '@jest/globals';
import { parseResponse } from './parseResponse';

describe('parseResponse', () => {
  it('should parse a response', () => {
    expect(
      parseResponse(
        `<Thought>Click the "Sign Up" button</Thought>\n<Action>click(123)</Action>`
      )
    ).toEqual({
      thought: 'Click the "Sign Up" button',
      action: 'click(123)',
      parsedAction: {
        name: 'click',
        args: {
          elementId: 123,
        },
      },
    });
  });

  it('should return an error if the thought is not found', () => {
    expect(parseResponse(`<Action>click(123)</Action>`)).toEqual({
      error: 'Invalid response: Thought not found in the model response.',
    });
  });

  it('should return an error if the action is not found', () => {
    expect(
      parseResponse(`<Thought>Click the "Sign Up" button</Thought>`)
    ).toEqual({
      error: 'Invalid response: Action not found in the model response.',
    });
  });

  it('should return an error if the action is invalid', () => {
    expect(
      parseResponse(
        `<Thought>Click the "Sign Up" button</Thought>\n<Action>click(123, 456)</Action>`
      )
    ).toEqual({
      error:
        'Invalid number of arguments: Expected 1 for action "click", but got 2.',
    });
  });

  it('should parse a response with multiple arguments', () => {
    expect(
      parseResponse(
        `<Thought>Click the "Sign Up" button</Thought>\n<Action>setValue(123, "hello")</Action>`
      )
    ).toEqual({
      thought: 'Click the "Sign Up" button',
      action: 'setValue(123, "hello")',
      parsedAction: {
        name: 'setValue',
        args: {
          elementId: 123,
          value: 'hello',
        },
      },
    });
  });

  it("Should call the 'finish' action", () => {
    expect(
      parseResponse(
        `<Thought>Click the "Sign Up" button</Thought>\n<Action>finish()</Action>`
      )
    ).toEqual({
      thought: 'Click the "Sign Up" button',
      action: 'finish()',
      parsedAction: {
        name: 'finish',
        args: {},
      },
    });
  });
});
