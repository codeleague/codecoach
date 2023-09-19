import { LintSeverity, LintItem } from '../../Parser';
import { Diff } from '../../Git/@types/PatchTypes';

export const onlyIn = (diffs: Diff[]) => (item: LintItem): boolean =>
  diffs.some(
    (d) =>
      d.file === item.source &&
      d.patch.some((p) => !item.line || (item.line >= p.from && item.line <= p.to)),
  );
export const onlySeverity = (...severities: LintSeverity[]) => (
  item: LintItem,
): boolean => severities.includes(item.severity);
