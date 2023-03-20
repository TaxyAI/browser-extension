import { expect, test } from '@jest/globals';
import { tagsSelfClose } from './tagsSelfClose';

type TestCases = [string, string][];

test('shrinkHTML', () => {
  expect(tagsSelfClose('<div></div>')).toBe('<div/>');
});
