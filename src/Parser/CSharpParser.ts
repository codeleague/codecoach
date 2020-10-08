import { relative, resolve } from 'path';
import slash from 'slash';
import LogSeverity from './@enums/log.severity.enum';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types/log.type';
import lineBreakUtil from './utils/lineBreak.util';

export class CSharpParser implements Parser {
  private logs: LogType[] = [];

  // todo: customizable line splitter ?

  getLogs(): LogType[] {
    return this.logs;
  }

  withContent(content: string): Parser {
    const lineSplitter = lineBreakUtil(content);

    const logs = content
      .split(lineSplitter)
      .map((line) => line.trim())
      .filter((line) => line !== '' && line !== lineSplitter)
      .map(CSharpParser.toLog)
      .filter((log) => log);

    this.logs.push(...logs);
    return this;
  }

  private static toLog(log: string): LogType {
    const structureMatch = log.match(
      />([^\s()]+)(?:\((\d+),(\d+)\))?\s*:\s*(\w+)\s*(\w+)\s*:\s*([^\[]+)(?:\[(.+)])?$/,
    );
    if (!structureMatch) throw new Error(`CSharpParser Error: ${log}`);
    const [, src, lineN, offset, severity, code, content, _projectSrc] = structureMatch;
    const projectSrc = slash(_projectSrc);

    let relativeSrc: string;
    const line = Number(lineN) || undefined;
    const lineOffset = Number(offset) || undefined;

    if (line && lineOffset) {
      const fileRelativeSrcMatch = src.match(/^.+[\\/]tmp[\\/]repo[\\/](.+)$/);
      if (!fileRelativeSrcMatch) throw new Error(`CSharpParser Error: ${line}`);
      const [, _relativeSrc] = fileRelativeSrcMatch;
      relativeSrc = slash(_relativeSrc);
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
    };
  }
}
