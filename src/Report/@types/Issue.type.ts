import LogSeverity from '../../Parser/@enums/log.severity.enum';

type IssueType = {
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
};

export default IssueType;
