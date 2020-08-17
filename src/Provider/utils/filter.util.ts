import { LogSeverity, LogType } from '../../Parser';

export const onlyIn = (fileList: string[]) => (log: LogType): boolean =>
  fileList.includes(log.source);

export const onlySeverity = (...severities: LogSeverity[]) => (log: LogType): boolean =>
  severities.includes(log.severity);
