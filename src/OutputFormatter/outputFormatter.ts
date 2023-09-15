import { LogSeverity, LogType } from "../Parser";

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
    }
  };
}

const mapGitLabSeverity = (severity: LogSeverity): GitLabSeverity => {
  switch (severity) {
    case 'error':
      return 'blocker';
    case 'warning':
      return 'minor';
    default:
      return 'info';
  }
}

export const gitLab: OutputFormatter = (logs: LogType[]) => {
  // create fingerprint by take ruleId + source + line + lineOffset and hash she it
  const 

  const gitlabReport = logs.map((log) => {
    const format: GitLabOutputFormat = {
      description: log.msg,
      check_name: log.ruleId,
      fingerprint: log.ruleId,
      severity: mapGitLabSeverity(log.severity),
      location: {
        path: log.source,
        lines: {
          begin: log.line ?? 1,
        }
      }
    }
    return format;
  })

  return JSON.stringify(gitlabReport, null, 2);
}

export const defaultFormatter: OutputFormatter = (logs: LogType[]) => {
  return JSON.stringify(logs, null, 2);
}