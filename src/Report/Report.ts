import { LogType } from '../Parser';
import { IssuesType } from './@types/issues.type';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import IssueType from './@types/Issue.type';
import ReportType from './@types/report.type';

export class Report {
  private static mapLogToComment(log: LogType): IssueType {
    return {
      msg: log.msg,
      severity: log.severity,
      source: log.source,
      line: log.line,
      lineOffset: log.lineOffset,
    };
  }

  private static selectLogType(logs: LogType[], type: LogSeverity) {
    return logs.filter((f) => f.severity === type).map(this.mapLogToComment);
  }

  static parse(logs: LogType[]): ReportType {
    const warningLogs: IssueType[] = this.selectLogType(logs, LogSeverity.warning);
    const warning: IssuesType = {
      n: warningLogs.length,
      issues: warningLogs,
    };

    const errorLogs: IssueType[] = this.selectLogType(logs, LogSeverity.error);
    const error: IssuesType = {
      n: errorLogs.length,
      issues: errorLogs,
    };

    return {
      overviewMsg: '',
      warning,
      error,
    };
  }
}
