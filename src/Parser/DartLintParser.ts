import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { LogSeverity } from './@enums/log.severity.enum';
import { splitByLine } from './utils/lineBreak.util';

export class DartLintParser extends Parser {
  parse(content: string): LogType[] {
    return splitByLine(content)
      .map((line: string) => DartLintParser.lineToLog(line))
      .filter((f: LogType) => f != DartLintParser.emptyLog);
  }

  private static lineToLog(line: string): LogType {
    const lineMatch = line.match(/^(.*) • (.*) • (.*):(\d+):(\d+) • (.*)/);
    return lineMatch ? DartLintParser.lineMatchToLog(lineMatch) : DartLintParser.emptyLog;
  }

  private static lineMatchToLog(lineMatch: RegExpMatchArray): LogType {
    const [, severityText, message, source, line, offset, log] = lineMatch;
    return {
      log: log,
      line: Number(line),
      lineOffset: Number(offset),
      msg: message,
      source: source,
      severity: DartLintParser.stringToSeverity(severityText),
      valid: true,
    };
  }

  private static stringToSeverity(levelText: string): LogSeverity {
    switch (levelText) {
      case 'error':
        return LogSeverity.error;
      case 'warning':
        return LogSeverity.warning;
      case 'info':
        return LogSeverity.info;
      default:
        return LogSeverity.unknown;
    }
  }

  private static emptyLog: LogType = {
    log: '',
    msg: '',
    severity: LogSeverity.unknown,
    source: '',
    valid: false,
  };
}
