import { ESLintIssue } from './ESLintIssue';
import { SuppressedESLintIssue } from './SuppressedESLintIssue';

export type ESLintLog = {
  filePath: string;
  messages: ESLintIssue[];
  suppressedMessages?: SuppressedESLintIssue[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source: string;
};
