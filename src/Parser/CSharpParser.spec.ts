import LogSeverity from './@enums/log.severity.enum';
import { LogType } from './@types/log.type';
import { CSharpParser } from './CSharpParser';

describe('CSharpParser tests', () => {
  const contentWithLineOffset =
    '1:7>C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]';

  const contentNoLineOffset =
    "1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]";

  it('Should parse correctly when (line, offset) is provided', () => {
    const result = new CSharpParser().withContent(contentWithLineOffset).getLogs();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.cs`,
      severity: LogSeverity.warning,
      line: 6,
      lineOffset: 8,
      msg: `AG0030: Prevent use of dynamic`,
      log: contentWithLineOffset,
    } as LogType);
  });

  it('Should parse correctly when (line, offset) is not provided', () => {
    const result = new CSharpParser().withContent(contentNoLineOffset).getLogs();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Broken.csproj`,
      severity: LogSeverity.error,
      line: undefined,
      lineOffset: undefined,
      msg: `CS5001: Program does not contain a static 'Main' method suitable for an entry point`,
      log: contentNoLineOffset,
    } as LogType);
  });

  it('Should be able to call `withContent` multiple times and add all content together', () => {
    const result = new CSharpParser()
      .withContent(contentWithLineOffset)
      .withContent(contentNoLineOffset)
      .getLogs();

    expect(result).toHaveLength(2);
  });

  it('Should do nothing if put empty string', () => {
    const result = new CSharpParser().withContent('').getLogs();
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new CSharpParser().withContent(':')).toThrowError();
  });
});
