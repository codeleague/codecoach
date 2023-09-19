import { Log } from '../Logger';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { xml2js } from 'xml-js';
import { AndroidLintStyleIssue } from './@types/AndroidLintStyleIssue';
import { AndroidLintStyleLog } from './@types/AndroidLintStyleLog';
import { AndroidLintStyleLocation } from './@types/AndroidLintStyleLocation';
import { ProjectType } from '../Config/@enums';

export class AndroidLintStyleParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      return (
        AndroidLintStyleParser.xmltoLintItem(content).issues[0]?.issue?.flatMap(
          (issue: AndroidLintStyleIssue) => {
            return AndroidLintStyleParser.toLintItem(issue, issue.location[0], this.cwd);
          },
        ) ?? []
      );
    } catch (err) {
      Log.warn('AndroidStyle Parser: parse with content error', content);
      throw err;
    }
  }

  private static toLintItem(
    issue: AndroidLintStyleIssue,
    location: AndroidLintStyleLocation,
    cwd: string,
  ): LintItem {
    return {
      ruleId: issue._attributes.id,
      log: issue._attributes.errorLine1?.trim(),
      line: location._attributes.line,
      lineOffset: location._attributes.column,
      msg: issue._attributes.message,
      source: location._attributes.file.replace(`${cwd}/`, ''),
      severity: AndroidLintStyleParser.getSeverity(
        issue._attributes.severity.toLowerCase(),
      ),
      valid: true,
      type: ProjectType.androidlint,
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

  private static xmltoLintItem(xmlContent: string): AndroidLintStyleLog {
    return xml2js(xmlContent, convertOption) as AndroidLintStyleLog;
  }
}

const convertOption = {
  compact: true,
  nativeType: true,
  nativeTypeAttributes: true,
  alwaysArray: true,
};
