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
};

export type ParsedLogType = {
  linter: ProjectType;
  raw?: string;
  logs: LogType[];
};

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
  issues: ParsedLogType[];
};
