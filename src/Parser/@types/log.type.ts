import LogSeverity from '../@enums/log.severity.enum';

type LogType = {
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
};
export default LogType;
