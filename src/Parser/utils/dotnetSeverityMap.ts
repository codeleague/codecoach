import { LintSeverity } from '../@enums/LintSeverity';

export function mapSeverity(levelText: string): LintSeverity {
  switch (levelText) {
    case 'fatal':
    case 'error':
      return LintSeverity.error;
    case 'warning':
      return LintSeverity.warning;
    case 'info':
      return LintSeverity.info;
    case 'hidden':
      return LintSeverity.ignore;
    default:
      return LintSeverity.unknown;
  }
}
