import { relative, resolve } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from '../Provider/utils/path.util';
import { LogSeverity } from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import lineBreakUtil from './utils/lineBreak.util';

export class DotnetBuildParser extends Parser {
  withContent(content: string): Parser {
    const lineSplitter = lineBreakUtil(content);

    const logs = content
      .split(lineSplitter)
      .map((line) => line.trim())
      .filter((line) => line !== '' && line !== lineSplitter)
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
    const [, src, lineN, offset, severity, code, content, _projectSrc] = structureMatch;

    let relativeSrc: string;
    const line = Number(lineN) || undefined;
    const lineOffset = Number(offset) || undefined;

    if (!_projectSrc) {
      return {
        log,
        line,
        lineOffset,
        msg: `${code.trim()}: ${content.trim()}`,
        source: '',
        severity: severity as LogSeverity,
        valid: false,
      };
    }

    const projectSrc = slash(_projectSrc);

    if (line && lineOffset) {
      const _relativeSrc = getRelativePath(this.cwd, src);
      if (!_relativeSrc) {
        // HOTFIX ignore this log with valid:false
        Log.warn(`DotnetBuildParser Error: source path is not a relative of root`, {
          src,
        });
        return {
          log,
          line,
          lineOffset,
          msg: `${code.trim()}: ${content.trim()}`,
          source: '',
          severity: severity as LogSeverity,
          valid: false,
        };
      }
      relativeSrc = _relativeSrc;
    } else {
      const project_root = resolve(projectSrc, '../');
      relativeSrc = relative(project_root, projectSrc);
    }

    return {
      log,
      line,
      lineOffset,
      msg: `${code.trim()}: ${content.trim()}`,
      source: relativeSrc,
      severity: severity as LogSeverity,
      valid: true,
    };
  }
}
