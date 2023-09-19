import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { LintSeverity } from './@enums/LintSeverity';
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

  private static stringToSeverity(levelText: string): LintSeverity {
    switch (levelText) {
      case 'error':
        return LintSeverity.error;
      case 'warning':
        return LintSeverity.warning;
      case 'info':
        return LintSeverity.info;
      default:
        return LintSeverity.unknown;
    }
  }

  private static emptyItem: LintItem = {
    ruleId: '',
    log: '',
    msg: '',
    severity: LintSeverity.unknown,
    source: '',
    valid: false,
    type: ProjectType.dartlint,
  };
}
