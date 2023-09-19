import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { LintSeverity } from './@enums/LintSeverity';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { xml2js } from 'xml-js';
import { ScalaStyleLog } from './@types/ScalaStyleLog';
import { ScalaStyleError } from './@types/ScalaStyleError';
import { ProjectType } from '../Config/@enums';

export class ScalaStyleParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      const convertOption = {
        compact: true,
        nativeType: true,
        nativeTypeAttributes: true,
        alwaysArray: true,
      };
      const rawError = content
        .split(`\n`)
        .map((line) => line.trim())
        .filter((line) => line.slice(0, 6) === '<error');
      const parsedContent = xml2js(content, convertOption) as ScalaStyleLog;

      let rawIndex = 0;
      return (
        parsedContent.checkstyle[0]?.file?.flatMap((f) => {
          const source = getRelativePath(this.cwd, f._attributes.name);

          return f.error.map((log) =>
            ScalaStyleParser.toLintItem(log, source, rawError[rawIndex++]),
          );
        }) ?? []
      );
    } catch (err) {
      Log.warn('ScalaStyle Parser: parse with content error', content);
      throw err;
    }
  }

  private static toLintItem(
    log: ScalaStyleError,
    source: string | null,
    raw: string | null,
  ): LintItem {
    return {
      ruleId: log._attributes.source ?? '',
      log: raw ?? '',
      line: log._attributes.line ?? undefined,
      lineOffset: log._attributes.column,
      msg: log._attributes.message,
      source: source ?? '',
      severity: ScalaStyleParser.getSeverity(log._attributes.severity),
      valid: source !== null,
      type: ProjectType.scalastyle,
    };
  }

  private static getSeverity(ScalaStyleLevel: string): LintSeverity {
    switch (ScalaStyleLevel) {
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
}
