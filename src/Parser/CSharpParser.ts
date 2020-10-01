import * as path from 'path';
import slash from 'slash';
import LogSeverity from './@enums/log.severity.enum';
import LogType from './@types/log.type';

export type CSharpParserType = LogType;

export default (line: string): CSharpParserType => {
  // line = line.replace(/\\/g, '/');
  const structureMatch = line.match(
    />([^\s()]+)(\(.+\))?\s*:\s*(\w+)\s*(\w+)\s*:\s*([^\[]+)(?:\[(.+)\])?$/,
  );
  if (!structureMatch) throw new Error(`CSharpParser Error: ${line}`);
  const [, src, position, severity, code, content, _projectSrc] = structureMatch;
  const projectSrc = slash(_projectSrc);

  let relativeSrc: string;
  let lineNumber: number | undefined;
  let lineOffset: number | undefined;

  if (position) {
    const fileRelativeSrcMatch = src.match(/^.+(?:\\|\/)tmp(?:\\|\/)repo(?:\\|\/)(.+)$/);
    if (!fileRelativeSrcMatch) throw new Error(`CSharpParser Error: ${line}`);
    const [, _relativeSrc] = fileRelativeSrcMatch;
    relativeSrc = slash(_relativeSrc);

    const lineNumberMatch = position.match(/(\d+),(\d+)/);
    if (!lineNumberMatch) throw new Error('Cannot match line number');
    const [, lineN, offset] = lineNumberMatch;
    lineNumber = Number(lineN);
    lineOffset = Number(offset);
  } else {
    const project_root = path.resolve(projectSrc, '../');
    relativeSrc = path.relative(project_root, projectSrc);
  }

  return {
    log: line,
    msg: `${code.trim()}: ${content.trim()}`,
    line: lineNumber,
    lineOffset,
    source: relativeSrc,
    severity: severity as LogSeverity,
  };
};
