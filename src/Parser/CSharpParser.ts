import { resolve, relative } from 'path';
import slash from 'slash';
import LogSeverity from './@enums/log.severity.enum';
import LogType from './@types/log.type';

export type CSharpParserType = LogType;

export default (log: string): CSharpParserType => {
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
};
