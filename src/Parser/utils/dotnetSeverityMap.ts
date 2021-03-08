import { LogSeverity } from '../@enums/log.severity.enum';

export function mapSeverity(levelText: string): LogSeverity {
  switch (levelText) {
    case 'fatal':
    case 'error':
      return LogSeverity.error;
    case 'warning':
      return LogSeverity.warning;
    case 'info':
      return LogSeverity.info;
    case 'hidden':
      return LogSeverity.ignore;
    default:
      return LogSeverity.unknown;
  }
}
