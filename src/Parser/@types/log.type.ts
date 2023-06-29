import { LogSeverity } from '..';
import { ProjectType } from '../../Config';

export type LogType = {
  ruleId: string;
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
  valid: boolean;
  type: ProjectType;
};
