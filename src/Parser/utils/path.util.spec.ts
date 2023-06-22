import { escapeRegExp, getRelativePath } from './path.util';

describe('getRelativePath', () => {
  const targetFile = 'tmp/repo/Broken.cs';
  it('should handle windows path', () => {
    expect(
      getRelativePath(
        'C:\\source\\codeleague\\codecoach',
        'C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.cs',
      ),
    ).toBe(targetFile);
  });

  it('should handle POSIX path', () => {
    expect(
      getRelativePath(
        '/source/codeleague/codecoach',
        '/source/codeleague/codecoach/tmp/repo/Broken.cs',
      ),
    ).toBe(targetFile);
  });

  it('should handle trailing / in cwd', () => {
    expect(
      getRelativePath(
        '/source/codeleague/codecoach/',
        '/source/codeleague/codecoach/tmp/repo/Broken.cs',
      ),
    ).toBe(targetFile);
  });

  it('should handle cross platform style of path (win-posix)', () => {
    expect(
      getRelativePath(
        'C:\\source\\codeleague\\codecoach',
        'C:/source/codeleague/codecoach/tmp/repo/Broken.cs',
      ),
    ).toBe(targetFile);
  });

  it('should handle cross platform style of path (posix-win)', () => {
    expect(
      getRelativePath(
        'C:/source/codeleague/codecoach',
        'C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.cs',
      ),
    ).toBe(targetFile);
  });

  it('should return null if relative paths are provided', () => {
    expect(
      getRelativePath(
        'source/codeleague/codecoach',
        '/some/root/source/codeleague/codecoach/tmp/repo/Broken.cs',
      ),
    ).toBeNull();
  });

  it('should return null if paths are not related', () => {
    expect(
      getRelativePath(
        'C:\\source\\codeleague\\codecoach',
        'C:\\some\\where\\else\\tmp\\repo',
      ),
    ).toBeNull();
  });
});

describe('escapeRegExp', function () {
  const escaped = '\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\\\';
  const unescaped = '^$.*+?()[]{}|\\';

  it('should escape values', function () {
    expect(escapeRegExp(unescaped + unescaped)).toBe(escaped + escaped);
  });

  it('should handle strings with nothing to escape', function () {
    expect(escapeRegExp('abc')).toBe('abc');
  });
});
