import { LogSeverity } from './@enums/log.severity.enum';
import { LogType } from './@types/log.type';
import { CSharpParser } from './CSharpParser';

describe('CSharpParser tests', () => {
  const cwdWin = 'C:\\source';
  const cwdUnix = '/dir';

  const contentWithLineOffset =
    '1:7>C:\\source\\Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\source\\Broken.csproj]';

  const contentNoLineOffset =
    "1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:\\source\\Broken.csproj]";

  const contentWithNotValid = `
  3:9>/dir/Tests/File.cs(17,43): warning CS0649: Field 'SearchResultMockBuilder._urgencyScore' is never assigned to, and will always have its default value null [/dir/Tests/project.csproj]
  17:6>/dir/Tests/File2.cs(226,17): warning CS0219: The variable 'langId' is assigned but its value is never used [/dir/Tests/project.csproj]
    9:8>/usr/share/dotnet/sdk/3.1.402/Microsoft.Common.CurrentVersion.targets(2084,5): warning MSB3277: Found conflicts between different versions of "Microsoft.Extensions.Configuration.Json" that could not be resolved.  These reference conflicts are listed in the build log when log verbosity is set to detailed. [/dir/Tests/project.csproj]`;

  it('Should parse correctly when (line, offset) is provided', () => {
    const result = new CSharpParser(cwdWin).withContent(contentWithLineOffset).getLogs();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.cs`,
      severity: LogSeverity.warning,
      line: 6,
      lineOffset: 8,
      msg: `AG0030: Prevent use of dynamic`,
      log: contentWithLineOffset,
      valid: true,
    } as LogType);
  });

  it('Should parse correctly when (line, offset) is not provided', () => {
    const result = new CSharpParser(cwdWin).withContent(contentNoLineOffset).getLogs();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.csproj`,
      severity: LogSeverity.error,
      line: undefined,
      lineOffset: undefined,
      msg: `CS5001: Program does not contain a static 'Main' method suitable for an entry point`,
      log: contentNoLineOffset,
      valid: true,
    } as LogType);
  });

  it('Should be able to call `withContent` multiple times and add all content together', () => {
    const result = new CSharpParser(cwdWin)
      .withContent(contentWithLineOffset)
      .withContent(contentNoLineOffset)
      .getLogs();

    expect(result).toHaveLength(2);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new CSharpParser(cwdUnix).withContent(contentWithNotValid).getLogs();
    const valid = result.filter((el) => el.valid);
    const invalid = result.filter((el) => !el.valid);
    expect(valid).toHaveLength(2);
    expect(invalid).toHaveLength(1);
  });

  it('Should do nothing if put empty string', () => {
    const result = new CSharpParser(cwdWin).withContent('').getLogs();
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new CSharpParser(cwdWin).withContent(':')).toThrowError();
  });
});
