import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { ProjectType } from '../Config/@enums';
import { SwiftLintLog } from './@types/SwiftLintLog';
import { LogSeverity } from './@enums/log.severity.enum';

export class SwiftLintParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      const logsJson = JSON.parse(content) as SwiftLintLog[];
      return logsJson.map((el) => this.toLintItem(el));
    } catch (err) {
      Log.warn('SwiftLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLintItem(log: SwiftLintLog): LintItem {
    const parsed: LintItem = {
      ruleId: log.rule_id,
      log: JSON.stringify(log),
      line: log.line ?? 0,
      lineOffset: log.character ?? 0,
      msg: log.reason,
      source: '',
      severity: log.severity.toLowerCase() as LogSeverity,
      valid: true,
      type: ProjectType.swiftlint,
    };

    const source = getRelativePath(this.cwd, log.file ?? '');
    if (!source) return { ...parsed, valid: false };

    return { ...parsed, source };
  }
}
