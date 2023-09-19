import { ProjectType } from '../Config/@enums';
import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { LintSeverity } from './@enums/LintSeverity';
import { Parser } from './@interfaces/parser.interface';
import { LintItem, TSLintLog } from './@types';

export class TSLintParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      const logsJson = JSON.parse(content) as TSLintLog[];
      return logsJson.map((el) => this.toLintItem(el));
    } catch (err) {
      Log.warn('TSLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLintItem(log: TSLintLog): LintItem {
    const parsed: LintItem = {
      ruleId: log.ruleName,
      log: JSON.stringify(log),
      line: log.startPosition.line + 1,
      lineOffset: log.startPosition.character,
      // there are no code portion present in tslint output
      msg: log.failure,
      source: '',
      severity: log.ruleSeverity.toLowerCase() as LintSeverity,
      valid: true,
      type: ProjectType.tslint,
    };

    const source = getRelativePath(this.cwd, log.name);
    if (!source) return { ...parsed, valid: false };

    return { ...parsed, source };
  }
}
