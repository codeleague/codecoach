import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types/log.type';
import { TSLintLog } from './@types/TSLintLog';

export class TSLintParser extends Parser {
  withContent(content: string): Parser {
    try {
      if (content) {
        const logsJson = JSON.parse(content) as TSLintLog[];
        const logs = logsJson.map((el) => this.toLog(el));
        this.logs.push(...logs);
      }

      return this;
    } catch (err) {
      Log.warn('TSLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLog(log: TSLintLog): LogType {
    const parsed: LogType = {
      log: JSON.stringify(log),
      line: log.startPosition.line + 1,
      lineOffset: log.startPosition.character,
      // there are no code portion present in tslint output
      msg: log.failure,
      source: '',
      severity: log.ruleSeverity.toLowerCase() as LogSeverity,
      valid: true,
    };

    const source = getRelativePath(this.cwd, log.name);
    if (!source) return { ...parsed, valid: false };

    return { ...parsed, source };
  }
}
