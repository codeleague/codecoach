import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { xml2js } from 'xml-js';
import { ScalaStyleLog } from './@types/ScalaStyleLog';
import { ScalaStyleError } from './@types/ScalaStyleError';

export class ScalaStyleParser extends Parser {
  parse(content: string): LogType[] {
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
            ScalaStyleParser.toLog(log, source, rawError[rawIndex++]),
          );
        }) ?? []
      );
    } catch (err) {
      Log.warn('ScalaStyle Parser: parse with content error', content);
      throw err;
    }
  }

  private static toLog(
    log: ScalaStyleError,
    source: string | null,
    raw: string | null,
  ): LogType {
    return {
      log: raw ?? '',
      line: log._attributes.line ?? undefined,
      lineOffset: log._attributes.column,
      msg: log._attributes.message,
      source: source ?? '',
      severity: ScalaStyleParser.getSeverity(log._attributes.severity),
      valid: source !== null,
    };
  }

  private static getSeverity(ScalaStyleLevel: string): LogSeverity {
    switch (ScalaStyleLevel) {
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
}
