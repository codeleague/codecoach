const NEW_LINE = '\n';
const CRLF = '\r\n';
const LF = '\r';

export default (file: string): string => {
  const indexOfLF = file.indexOf(NEW_LINE, 1);
  if (indexOfLF === -1) {
    if (file.indexOf(LF) !== -1) return LF;
    return NEW_LINE;
  }
  if (file[indexOfLF - 1] === LF) return CRLF;
  return NEW_LINE;
};
