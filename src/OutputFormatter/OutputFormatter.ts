import { LogSeverity, LintItem } from '../Parser';
import { createHash } from 'crypto';

export type OutputFormatter = (items: LintItem[]) => string;

type GitLabSeverity = 'info' | 'minor' | 'major' | 'critical' | 'blocker';

// https://docs.gitlab.com/ee/ci/testing/code_quality.html#implement-a-custom-tool
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

export const gitLabFormatter: OutputFormatter = (items: LintItem[]) => {
  const gitlabReport = items.map((item) => {
    const fingerprint = createHash('sha256');
    fingerprint.update(`${item.ruleId}${item.source}${item.line}${item.lineOffset}`);

    const format: GitLabOutputFormat = {
      description: item.msg,
      check_name: item.ruleId,
      fingerprint: fingerprint.digest('hex'),
      severity: mapGitLabSeverity(item.severity),
      location: {
        path: item.source,
        lines: {
          begin: item.line ?? 1,
        },
      },
    };
    return format;
  });

  return JSON.stringify(gitlabReport, null, 2);
};

export const defaultFormatter: OutputFormatter = (items: LintItem[]) => {
  return JSON.stringify(items, null, 2);
};
