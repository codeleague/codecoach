import { LintSeverity } from '..';
import { ProjectType } from '../../Config';

export type LintItem = {
  ruleId: string;
  log: string;
  msg: string;
  severity: LintSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
  nLines?: number;
  valid: boolean;
  type: ProjectType;
};
