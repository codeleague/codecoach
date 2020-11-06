import { TSLintLogPosition } from './TSLintLogPosition';

export type TSLintLog = {
  endPosition: TSLintLogPosition;
  failure: string;
  name: string;
  ruleName: string;
  ruleSeverity: string;
  startPosition: TSLintLogPosition;
};
