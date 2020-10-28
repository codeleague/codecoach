import { LogSeverity } from '..';

export type LogType = {
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
  valid: boolean;
};
