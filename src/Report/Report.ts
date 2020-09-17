import { LogSeverity, Log } from '../Parser/Log';

export type ReportType = {
  overviewMsg: string;
  warning: Issues;
  error: Issues;
  info: Issues;
};

export type Issues = {
  n: number;
  issues: Issue[];
};

export type Issue = {
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
};

export class Report {
  private static mapLogToComment(log: Log): Issue {
    return {
      msg: log.msg,
      severity: log.severity,
      source: log.source,
      line: log.line,
      lineOffset: log.lineOffset,
    };
  }
  private static selectLogType(logs: Log[], type: LogSeverity) {
    return logs.filter((f) => f.severity === type).map(this.mapLogToComment);
  }

  static parse(logs: Log[]): ReportType {
    const warningLogs: Issue[] = this.selectLogType(logs, LogSeverity.warning);
    const warning: Issues = {
      n: warningLogs.length,
      issues: warningLogs,
    };

    const errorLogs: Issue[] = this.selectLogType(logs, LogSeverity.error);
    const error: Issues = {
      n: errorLogs.length,
      issues: errorLogs,
    };

    const infoLogs: Issue[] = this.selectLogType(logs, LogSeverity.info);
    const info: Issues = {
      n: infoLogs.length,
      issues: infoLogs,
    };
    return {
      overviewMsg: '',
      warning,
      error,
      info,
    };
  }
}
