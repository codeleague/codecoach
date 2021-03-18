import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { DartIndicatorEnum } from './@enums/dart.indicator.enum';
import { LogSeverity } from './@enums/log.severity.enum';
import { DartLocation } from './@types/DartLocation';
import { DartLineEnum } from './@enums/dart.line.enum';
import { DartLocationLineEnum } from './@enums/dart.location.line.enum';

export class DartLintParser extends Parser {
  parse(content: string): LogType[] {
    return content
      .split(DartIndicatorEnum.newLine)
      .map((line: string) => DartLintParser.lineToLog(line))
      .filter((f: LogType) => f != DartLintParser.emptyLog);
  }

  private static lineToLog(line: string): LogType {
    const lineParts = line.split(DartIndicatorEnum.lineItem);
    return DartLintParser.isLineValid(lineParts)
      ? DartLintParser.linePartsToLog(lineParts)
      : DartLintParser.emptyLog;
  }

  private static linePartsToLog(lineParts: string[]): LogType {
    const location = DartLintParser.linePartsToLocation(
      lineParts[DartLineEnum.Location].split(DartIndicatorEnum.locationItem),
    );
    return {
      log: lineParts[DartLineEnum.Log].trim(),
      line: location.line,
      lineOffset: location.offset,
      msg: lineParts[DartLineEnum.Message].trim(),
      source: location.fileLocation.trim(),
      severity: DartLintParser.stringToSeverity(lineParts[DartLineEnum.Severity].trim()),
      valid: true,
    };
  }

  private static linePartsToLocation(lineParts: string[]): DartLocation {
    return {
      fileLocation: lineParts[DartLocationLineEnum.FileLocation],
      line: Number(lineParts[DartLocationLineEnum.Line]),
      offset: Number(lineParts[DartLocationLineEnum.Offset]),
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

  private static isLineValid(lines: string[]): boolean {
    return lines.length == Object.keys(DartLineEnum).length / 2;
  }

  private static emptyLog: LogType = {
    log: '',
    msg: '',
    severity: LogSeverity.unknown,
    source: '',
    valid: false,
  };
}
