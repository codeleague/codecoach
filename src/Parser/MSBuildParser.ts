import { join } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { splitByLine } from './utils/lineBreak.util';

export class MSBuildParser extends Parser {
  withContent(content: string): Parser {
    const logs = splitByLine(content)
      .map((log) => this.toLog(log))
      .filter((log) => log);

    this.logs.push(...logs);
    return this;
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
      severity,
      code,
      content,
      _csprojFullPath,
    ] = structureMatch;

    const line = Number(_line) || undefined;
    const lineOffset = Number(_lineOffset) || undefined;
    const fileFullPath = slash(join(slash(_csprojFullPath), '..', slash(_filepath)));
    const fileRelativePath = getRelativePath(this.cwd, fileFullPath);

    return {
      log,
      line,
      lineOffset,
      msg: `${code.trim()}: ${content.trim()}`,
      source: fileRelativePath ?? fileFullPath,
      severity: severity as LogSeverity,
      valid: fileRelativePath !== null,
    };
  }
}
