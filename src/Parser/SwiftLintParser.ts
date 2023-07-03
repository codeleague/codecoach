import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { mapSeverity } from './utils/dotnetSeverityMap';
import { splitByLine } from './utils/lineBreak.util';
import { ProjectType } from '../Config/@enums';

export class SwiftLintParser extends Parser {
  parse(content: string): LogType[] {
    return splitByLine(content)
      .map((log) => this.toLog(log))
      .filter((log) => log);
  }

  private toLog(log: string): LogType {
    const structureMatch = log.match(
      /^([\\\/\w\d.:_ ()-]+)(?::(\d+):(\d+)): (\w+): ([^\(]+)(?:\((.+)\))?$/,
    );
    if (!structureMatch) {
      const message = "SwiftLintParser Error: log structure doesn't match";
      Log.error(message, { log });
      throw new Error(message);
    }

    const [, _filepath, _line, _lineOffset, severityText, content, code] = structureMatch;

    const fileRelativePath = getRelativePath(this.cwd, _filepath);

    return {
      ruleId: code,
      log,
      line: Number(_line),
      lineOffset: Number(_lineOffset),
      msg: content.trim(),
      source: fileRelativePath ?? _filepath,
      severity: mapSeverity(severityText),
      valid: true,
      type: ProjectType.swiftlint,
    };
  }
}
