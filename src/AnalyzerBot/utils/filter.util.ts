import { LogSeverity, LintItem } from '../../Parser';
import { Diff } from '../../Git/@types/PatchTypes';

export const onlyIn = (diffs: Diff[]) => (item: LintItem): boolean =>
  diffs.some(
    (d) =>
      d.file === log.source &&
      d.patch.some((p) => !log.line || (log.line >= p.from && log.line <= p.to)),
  );
export const onlySeverity = (...severities: LogSeverity[]) => (item: LintItem): boolean =>
  severities.includes(log.severity);
