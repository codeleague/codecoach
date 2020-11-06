export type ESLintIssue = {
  ruleId: string | null;
  fatal: boolean;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  endLine: number;
  endColumn: number;
};
