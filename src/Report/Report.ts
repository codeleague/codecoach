import { IssuesType } from './@types/issues.type';
import ReportInterface from './@interfaces/report.interface';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import LogType from '../Parser/@types/log.type';
import IssueType from './@types/Issue.type';
import ReportType from './@types/report.type';

export class Report implements ReportInterface {
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

    const infoLogs: IssueType[] = this.selectLogType(logs, LogSeverity.info);
    const info: IssuesType = {
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
