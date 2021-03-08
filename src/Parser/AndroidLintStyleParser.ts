import { Log } from '../Logger';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { xml2js } from 'xml-js';
import { AndroidLintStyleIssue } from './@types/AndroidLintStyleIssue';
import { AndroidLintStyleLog } from './@types/AndroidLintStyleLog';
import { AndroidLintStyleLocation } from './@types/AndroidLintStyleLocation';

export class AndroidLintStyleParser extends Parser {
  parse(content: string): LogType[] {
    try {
      if (!content) return [];

      return (
        AndroidLintStyleParser.xmlToLog(content).issues[0]?.issue?.flatMap(
          (issue: AndroidLintStyleIssue) => {
            return AndroidLintStyleParser.toLog(issue, issue.location[0]);
          },
        ) ?? []
      );
    } catch (err) {
      Log.warn('AndroidStyle Parser: parse with content error', content);
      throw err;
    }
  }

  private static toLog(
    issue: AndroidLintStyleIssue,
    location: AndroidLintStyleLocation,
  ): LogType {
    return {
      log: issue._attributes.errorLine1.trim(),
      line: location._attributes.line,
      lineOffset: location._attributes.column,
      msg: issue._attributes.message,
      source: location._attributes.file,
      severity: AndroidLintStyleParser.getSeverity(
        issue._attributes.severity.toLowerCase(),
      ),
      valid: true,
    };
  }

  private static getSeverity(levelText: string): LogSeverity {
    switch (levelText) {
      case 'info':
        return LogSeverity.info;
      case 'warning':
        return LogSeverity.warning;
      case 'error':
        return LogSeverity.error;
      default:
        return LogSeverity.unknown;
    }
  }

  private static xmlToLog(xmlContent: string): AndroidLintStyleLog {
    return xml2js(xmlContent, convertOption) as AndroidLintStyleLog;
  }
}

const convertOption = {
  compact: true,
  nativeType: true,
  nativeTypeAttributes: true,
  alwaysArray: true,
};
