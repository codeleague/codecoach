import slash from 'slash';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types/log.type';

type TslintLogPosition = {
  character: number;
  line: number;
  position: number;
};

type TslintLog = {
  endPosition: TslintLogPosition;
  failure: string;
  name: string;
  ruleName: string;
  ruleSeverity: string;
  startPosition: TslintLogPosition;
};
export class TSLintParser implements Parser {
  private logs: LogType[] = [];

  getLogs(): LogType[] {
    return this.logs;
  }

  withContent(content: string): Parser {
    try {
      if (content) {
        const logsJson = JSON.parse(content) as TslintLog[];
        const logs = logsJson.map((el) => TSLintParser.toLog(el));
        this.logs.push(...logs);
      }

      return this;
    } catch (err) {
      console.warn('TSLint Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private static toLog(log: TslintLog): LogType {
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

    const fileSrc = slash(log.name);
    const match = fileSrc.match(/(?:\/tmp\/repo\/)(.*)/);

    if (!match) return { ...parsed, valid: false };
    const [, source] = match;
    return { ...parsed, source };
  }
}
