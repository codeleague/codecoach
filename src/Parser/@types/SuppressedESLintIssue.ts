import { ESLintIssue } from './ESLintIssue';
import { SuppressionInfo } from './SuprressionInfo';

export type SuppressedESLintIssue = ESLintIssue & {
  suppressions: SuppressionInfo[];
};
