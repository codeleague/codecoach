import { AndroidLintStyleLocation } from './AndroidLintStyleLocation';

export type AndroidLintStyleIssue = {
  _attributes: {
    id: string;
    severity: string;
    message: string;
    category: string;
    priority: string;
    summary: string;
    explanation: string;
    errorLine1: string;
  };
  location: AndroidLintStyleLocation[];
};
