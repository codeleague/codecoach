import { LogSeverity } from './@enums/log.severity.enum';
import { LogType } from './@types';
import { DotnetBuildParser } from './DotnetBuildParser';

describe('DotnetBuildParser tests', () => {
  const cwdWin = 'C:\\source';
  const cwdUnix = '/dir';

  const logWithSource = `1:7>C:\\source\\Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\source\\Broken.csproj]`;
  const logWithNoSource = `1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:\\source\\Broken.csproj]`;
  const logWithUnrelatedSource = `9:8>/usr/share/dotnet/sdk/3.1.402/Microsoft.Common.CurrentVersion.targets(2084,5): warning MSB3277: some message [/dir/Tests/project.csproj]`;
  const contentWithNoPathAtTheEnd = `13:11>/dir/File.csproj : warning NU1701: This package may not be fully compatible with your project.`;

  it('Should parse log with source path correctly', () => {
    const result = new DotnetBuildParser(cwdWin).parse(logWithSource);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.cs`,
      severity: LogSeverity.warning,
      line: 6,
      lineOffset: 8,
      msg: `AG0030: Prevent use of dynamic`,
      log: logWithSource,
      valid: true,
    } as LogType);
  });

  it('Should parse log without source path correctly and flag as invalid and use csproj as source', () => {
    const result = new DotnetBuildParser(cwdWin).parse(logWithNoSource);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.csproj`,
      severity: LogSeverity.error,
      line: NaN,
      lineOffset: NaN,
      msg: `CS5001: Program does not contain a static 'Main' method suitable for an entry point`,
      log: logWithNoSource,
      valid: false,
    } as LogType);
  });

  it('Should parse log unrelated source path correctly and flag as invalid and use csproj as source', () => {
    const result = new DotnetBuildParser(cwdUnix).parse(logWithUnrelatedSource);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `project.csproj`,
      severity: LogSeverity.warning,
      line: 2084,
      lineOffset: 5,
      msg: `MSB3277: some message`,
      log: logWithUnrelatedSource,
      valid: false,
    } as LogType);
  });

  it('Should do nothing if put empty string', () => {
    const result = new DotnetBuildParser(cwdWin).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new DotnetBuildParser(cwdWin).parse(':')).toThrowError();
  });

  it('should be able to handle log with no csproj file at the end', () => {
    expect(() =>
      new DotnetBuildParser(cwdUnix).parse(contentWithNoPathAtTheEnd),
    ).not.toThrowError();
  });
});
