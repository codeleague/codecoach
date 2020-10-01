import LogSeverity from './@enums/log.severity.enum';
import CSharpParser, { CSharpParserType } from './CSharpParser';

describe('CSharpParser tests', () => {
  const mock = [
    `1:7>C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]`,
    `1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]`,
  ];

  it('Should parse correctly when (line, offset) is provided', () => {
    const result = CSharpParser(mock[0]);
    expect(result).toEqual({
      source: `Broken.cs`,
      severity: LogSeverity.warning,
      line: 6,
      lineOffset: 8,
      msg: `AG0030: Prevent use of dynamic`,
      log: mock[0],
    } as CSharpParserType);
  });

  it('Should parse correctly when (line, offset) is not provided', () => {
    const result = CSharpParser(mock[1]);
    expect(result).toEqual({
      source: `Broken.csproj`,
      severity: LogSeverity.error,
      line: undefined,
      lineOffset: undefined,
      msg: `CS5001: Program does not contain a static 'Main' method suitable for an entry point`,
      log: mock[1],
    } as CSharpParserType);
  });

  it('Should throw if put empty string', () => {
    expect(() => CSharpParser('')).toThrowError();
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => CSharpParser(':')).toThrowError();
  });
});
