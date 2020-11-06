import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { ESLintIssue, ESLintLog, LogType } from './@types';

export class ESLintParser extends Parser {
  withContent(content: string): Parser {
    try {
      if (content) {
        const logs = JSON.parse(content) as ESLintLog[];
        logs.forEach((log) => {
          if (log.messages.length > 0) {
            const source = getRelativePath(this.cwd, log.filePath);

            log.messages.forEach((msg) => {
              this.logs.push(ESLintParser.toLog(msg, source));
            });
          }
        });
      }

      return this;
    } catch (err) {
      Log.warn('ESLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private static toLog(log: ESLintIssue, source: string | null): LogType {
    return {
      log: JSON.stringify(log),
      line: log.line + 1,
      lineOffset: log.column,
      msg: log.message,
      source: source ?? '',
      severity: ESLintParser.getSeverity(log.severity),
      valid: source !== null,
    };
  }

  private static getSeverity(esLevel: number): LogSeverity {
    switch (esLevel) {
      case 0:
        return LogSeverity.ignore;
      case 1:
        return LogSeverity.warning;
      case 2:
        return LogSeverity.error;
      default:
        return LogSeverity.unknown;
    }
  }
}
