export enum LogSeverity {
  info = 'info',
  warning = 'warning',
  error = 'error',
  unknown = 'unknown',
}

export type Log = {
  log: string;
  msg: string;
  severity: LogSeverity;
  source: string;
  line?: number;
  lineOffset?: number;
};
