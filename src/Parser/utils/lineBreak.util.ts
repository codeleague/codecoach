const NEW_LINE = '\n';
const CRLF = '\r\n';
const LF = '\r';

export function getLineBreakChar(file: string): string {
  const indexOfLF = file.indexOf(NEW_LINE, 1);
  if (indexOfLF === -1) {
    if (file.indexOf(LF) !== -1) return LF;
    return NEW_LINE;
  }
  if (file[indexOfLF - 1] === LF) return CRLF;
  return NEW_LINE;
}

export function splitByLine(content: string): string[] {
  const lineBreak = getLineBreakChar(content);

  return content
    .split(lineBreak)
    .map((line) => line.trim())
    .filter((line) => line !== '' && line !== lineBreak);
}
