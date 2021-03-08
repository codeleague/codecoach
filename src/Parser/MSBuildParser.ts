import { join } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { mapSeverity } from './utils/dotnetSeverityMap';
import { splitByLine } from './utils/lineBreak.util';

export class MSBuildParser extends Parser {
  parse(content: string): LogType[] {
    return splitByLine(content)
      .map((log) => this.toLog(log))
      .filter((log) => log);
  }

  private toLog(log: string): LogType {
    const structureMatch = log.match(
      /^(.+)(?:\((\d+),(\d+)\)): (\w+) (\w+): ([^\[]+)(?:\[(.+)])?$/,
    );
    if (!structureMatch) {
      const message = "MSBuildParser Error: log structure doesn't match";
      Log.error(message, { log });
      throw new Error(message);
    }

    const [
      ,
      _filepath,
      _line,
      _lineOffset,
      severityText,
      code,
      content,
      _csprojFullPath,
    ] = structureMatch;

    const fileFullPath = slash(join(slash(_csprojFullPath), '..', slash(_filepath)));
    const fileRelativePath = getRelativePath(this.cwd, fileFullPath);

    return {
      log,
      line: Number(_line),
      lineOffset: Number(_lineOffset),
      msg: `${code.trim()}: ${content.trim()}`,
      source: fileRelativePath ?? fileFullPath,
      severity: mapSeverity(severityText),
      valid: fileRelativePath !== null,
    };
  }
}
