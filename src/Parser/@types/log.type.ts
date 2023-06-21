import { LogSeverity } from '..';
import { ProjectType } from '../../Config/@enums';

export type LogType = {
  problem: string;
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
  valid: boolean;
  type: ProjectType;
};
