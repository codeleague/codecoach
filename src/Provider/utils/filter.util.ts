import { LogSeverity, LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';

export const onlyIn = (diffs: Diff[]) => (log: LogType): boolean =>
  diffs.some(
    (d) =>
      d.file === log.source &&
      d.patch.some((p) => !log.line || (log.line >= p.from && log.line <= p.to)),
  );
export const onlySeverity = (...severities: LogSeverity[]) => (log: LogType): boolean =>
  severities.includes(log.severity);
