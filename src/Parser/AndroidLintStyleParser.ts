import { Log } from '../Logger';
import { LintSeverity } from './@enums/LintSeverity';
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

  private static getSeverity(levelText: string): LintSeverity {
    switch (levelText) {
      case 'info':
        return LintSeverity.info;
      case 'warning':
        return LintSeverity.warning;
      case 'error':
        return LintSeverity.error;
      default:
        return LintSeverity.unknown;
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
