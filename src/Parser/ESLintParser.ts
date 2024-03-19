import { ProjectType } from '../Config/@enums';
import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { LintSeverity } from './@enums/LintSeverity';
import { Parser } from './@interfaces/parser.interface';
import { ESLintIssue, ESLintLog, LintItem } from './@types';

export class ESLintParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      const logs = JSON.parse(content) as ESLintLog[];
      return logs
        .filter((log) => log.messages.length !== 0)
        .concat(
          logs
            .filter((log) => log.suppressedMessages?.length !== 0)
            .map((log) => {
              const messages =
                log.suppressedMessages?.map((msg) => ({
                  ...msg,
                  severity: 0,
                })) ?? [];
              return { ...log, messages: messages };
            }),
        )
        .flatMap((log) => {
          const source = getRelativePath(this.cwd, log.filePath);
          return log.messages.map((msg) => ESLintParser.toLintItem(msg, source));
        });
    } catch (err) {
      Log.warn('ESLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private static toLintItem(log: ESLintIssue, source: string | null): LintItem {
    return {
      ruleId: log.ruleId ?? '',
      log: JSON.stringify(log),
      line: log.line,
      lineOffset: log.column,
      msg: log.message,
      source: source ?? '',
      severity: ESLintParser.getSeverity(log.severity),
      valid: source !== null,
      type: ProjectType.eslint,
    };
  }

  private static getSeverity(esLevel: number): LintSeverity {
    switch (esLevel) {
      case 0:
        return LintSeverity.ignore;
      case 1:
        return LintSeverity.warning;
      case 2:
        return LintSeverity.error;
      default:
        return LintSeverity.unknown;
    }
  }
}
