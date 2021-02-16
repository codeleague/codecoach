import { AndroidLintStyleIssue } from './AndroidLintStyleIssue';

export type AndroidLintStyleLog = {
  issues: { issue?: AndroidLintStyleIssue[] }[];
};
