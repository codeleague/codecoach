import { LogSeverity, LogType } from '../Parser';
import { createHash } from 'crypto';

export type OutputFormatter = (logs: LogType[]) => string;

type GitLabSeverity = 'info' | 'minor' | 'major' | 'critical' | 'blocker';

type GitLabOutputFormat = {
  description: string;
  check_name: string;
  fingerprint: string;
  severity: GitLabSeverity;
  location: {
    path: string;
    lines: {
      begin?: number;
      end?: number;
    };
  };
};

const mapGitLabSeverity = (severity: LogSeverity): GitLabSeverity => {
  switch (severity) {
    case 'error':
      return 'blocker';
    case 'warning':
      return 'minor';
    default:
      return 'info';
  }
};

export const gitLab: OutputFormatter = (logs: LogType[]) => {
  const gitlabReport = logs.map((log) => {
    const fingerprint = createHash('sha256');
    fingerprint.update(`${log.ruleId}${log.source}${log.line}${log.lineOffset}`);

    const format: GitLabOutputFormat = {
      description: log.msg,
      check_name: log.ruleId,
      fingerprint: fingerprint.digest('hex'),
      severity: mapGitLabSeverity(log.severity),
      location: {
        path: log.source,
        lines: {
          begin: log.line ?? 1,
        },
      },
    };
    return format;
  });

  return JSON.stringify(gitlabReport, null, 2);
};

export const defaultFormatter: OutputFormatter = (logs: LogType[]) => {
  return JSON.stringify(logs, null, 2);
};
