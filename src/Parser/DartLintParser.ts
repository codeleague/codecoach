import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { LogSeverity } from './@enums/log.severity.enum';
import { splitByLine } from './utils/lineBreak.util';
import { ProjectType } from '../Config/@enums';

export class DartLintParser extends Parser {
  parse(content: string): LintItem[] {
    return splitByLine(content)
      .map((line: string) => DartLintParser.linetoLintItem(line))
      .filter((f: LintItem) => f != DartLintParser.emptyItem);
  }

  private static linetoLintItem(line: string): LintItem {
    const lineMatch = line.match(/^(.*) • (.*) • (.*):(\d+):(\d+) • (.*)/);
    return lineMatch
      ? DartLintParser.lineMatchtoLintItem(lineMatch)
      : DartLintParser.emptyItem;
  }

  private static lineMatchtoLintItem(lineMatch: RegExpMatchArray): LintItem {
    const [, severityText, message, source, line, offset, log] = lineMatch;
    return {
      ruleId: log,
      log: log,
      line: Number(line),
      lineOffset: Number(offset),
      msg: message,
      source: source,
      severity: DartLintParser.stringToSeverity(severityText),
      valid: true,
      type: ProjectType.dartlint,
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

  private static emptyItem: LintItem = {
    ruleId: '',
    log: '',
    msg: '',
    severity: LogSeverity.unknown,
    source: '',
    valid: false,
    type: ProjectType.dartlint,
  };
}
