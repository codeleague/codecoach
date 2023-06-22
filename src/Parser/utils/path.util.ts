export function getRelativePath(cwd: string, path: string): string | null {
  const cwdCross = escapeRegExp(cwd.replace(/\\/g, '/'));
  const pathPosix = path.replace(/\\/g, '/');

  const filePathRegex = new RegExp(`^${cwdCross}/?(.+)`);
  const match = pathPosix.match(filePathRegex);

  return match ? match[1] : null;
}

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export function escapeRegExp(s: string): string {
  return reHasRegExpChar.test(s) ? s.replace(reRegExpChar, '\\$&') : s || '';
}
