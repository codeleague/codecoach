import { Log, LogSeverity } from './Log';
import * as path from 'path';

export type CSharpParserType = Log;

const msgToDetail = (
  msg: string,
): { code: string; content: string; location: string } => {
  const match = msg.match(/(\w+)\s*:\s*([^\[|]+)\[(.+)\]/);
  if (!match) throw new Error('Cannot match mssage to detail');
  const [, code, content, location] = match;
  return { code, content, location };
};

const SHOW_DETAIL = false;

export default (line: string): CSharpParserType => {
  const extract = line.match(
    />([\w|\/|\\|.]+)\s*(\(.+\))?\s*:\s*(\w+)\s*(\w+)\s*:\s*([^\[]+)(\[.+\])?/,
  );
  if (!extract) {
    throw new Error(`CSharpParser Error: ${line}`);
  }

  const [, file, lineDetail, level, code, content] = extract;
  let source = file;
  let lineNumber: number | undefined;
  let lineOffset: number | undefined;

  if (!!lineDetail) {
    const lineNumberMatch = lineDetail.match(/(\d+),(\d+)/);
    if (!lineNumberMatch) throw new Error('Cannot match line number');
    const [, lineN, offset] = lineNumberMatch;
    lineNumber = Number(lineN);
    lineOffset = Number(offset);
  } else {
    const extract = line.match(
      />([\w|\/|\\|.]+)\s*(\(.+\))?\s*:\s*(\w+)\s*(\w+)\s*:\s*([^\[]+)\[(.+)\]/,
    );
    if (!extract) {
      console.warn('CSharpParser Error: ', line);
      throw new Error('error CSharp parsing');
    }
    const [, file, lineDetail, level, code, content, src] = extract;
    const project_root = path.resolve(src, '../');
    source = path.relative(project_root, src);
  }

  return {
    log: line,
    msg: `${code.trim()}: ${content.trim()}`,
    line: lineNumber,
    lineOffset,
    source,
    severity: level as LogSeverity,
  };
};
