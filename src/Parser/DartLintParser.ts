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
      .filter((f: LogType | null) => f != null) as LogType[];
  }

  private static lineToLog(line: string): LogType | null {
    const lineParts = line.split(DartIndicatorEnum.lineItem);
    return DartLintParser.isLineValid(lineParts)
      ? DartLintParser.linePartsToLog(lineParts)
      : null;
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
      source: location.fileLocation,
      severity: DartLintParser.stringToSeverity(lineParts[DartLineEnum.Severity].trim()),
      valid: true,
    };
  }

  private static linePartsToLocation(lineParts: string[]): DartLocation {
    return {
      fileLocation: lineParts[DartLocationLineEnum.FileLocation],
      line: Number(DartLocationLineEnum.Line),
      offset: Number(DartLocationLineEnum.Offset),
    };
  }

  private static stringToSeverity(levelText: string): LogSeverity {
    switch (levelText) {
      case 'error':
        return LogSeverity.error;
      case 'info':
        return LogSeverity.info;
      default:
        return LogSeverity.unknown;
    }
  }

  private static isLineValid(lines: string[]): boolean {
    return lines.length == Object.keys(DartLineEnum).length;
  }
}
