import { ESLintIssue } from './ESLintIssue';

export type ESLintLog = {
  filePath: string;
  messages: ESLintIssue[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source: string;
};
