import { basename } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { splitByLine } from './utils/lineBreak.util';

export class DotnetBuildParser extends Parser {
  withContent(content: string): Parser {
    const logs = splitByLine(content)
      .map((log) => this.toLog(log))
      .filter((log) => log);

    this.logs.push(...logs);
    return this;
  }

  private toLog(log: string): LogType {
    const structureMatch = log.match(
      />([^\s()]+)(?:\((\d+),(\d+)\))?\s*:\s*(\w+)\s*(\w+)\s*:\s*([^\[]+)(?:\[(.+)])?$/,
    );
    if (!structureMatch) {
      const message = "DotnetBuildParser Error: log structure doesn't match";
      Log.error(message, { log });
      throw new Error(message);
    }

    const [
      ,
      src,
      _line,
      _lineOffset,
      _severity,
      errorCode,
      content,
      _csproj,
    ] = structureMatch;

    const relativeSrcPath = getRelativePath(this.cwd, src);

    if (!relativeSrcPath) {
      Log.warn(`DotnetBuildParser Error: source path is not a relative to root`, {
        src,
      });
    }

    return {
      log,
      line: Number(_line),
      lineOffset: Number(_lineOffset),
      msg: `${errorCode.trim()}: ${content.trim()}`,
      source: relativeSrcPath ?? basename(slash(_csproj)),
      severity: _severity as LogSeverity,
      valid: !!relativeSrcPath,
    };
  }
}
