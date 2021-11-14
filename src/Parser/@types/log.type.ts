import { LogSeverity } from '..';
import { ProjectType } from '../../Config';

export type LogType = {
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
  valid: boolean;
  linter?: ProjectType;
};

export type Issue = { message: string; filePath: string; column?: number } & Omit<
  LogType,
  'msg' | 'valid' | 'lineOffset' | 'log' | 'source'
>;

export type Run = {
  id: number;
  timestamp: Date;
  headCommit: {
    sha: string;
  };
  repository: {
    url: string;
  };
  branch: string;
  issues: Issue[];
};
