import LogSeverity from './@enums/log.severity.enum';
import CSharpParser, { CSharpParserType } from './CSharpParser';

describe('CSharpParser tests', () => {
  const mock = [
    `1:7>BookingApi/Mappers/Request/PaymentAmountMapperTests.cs(24,17): warning CS0219: The variable 'moneyInUsd' is assigned but its value is never used [C:/Users/kthuswongsa/Documents/Agoda.Gateway/Tests/PCI/Agoda.Gateway.Pci.External.Tests/Agoda.Gateway.Pci.External.Tests.csproj]`,
    `1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:/Users/bpuangthamaw/Documents/GitHub/codecoach/sample/csharp/broken.csproj]`,
  ];

  it('Should parse correctly when (line, offset) is provided', () => {
    const result = CSharpParser(mock[0]);
    expect(result).toEqual({
      source: `BookingApi/Mappers/Request/PaymentAmountMapperTests.cs`,
      severity: LogSeverity.warning,
      line: 24,
      lineOffset: 17,
      msg: `CS0219: The variable 'moneyInUsd' is assigned but its value is never used`,
      log: mock[0],
    } as CSharpParserType);
  });

  it('Should parse correctly when (line, offset) is not provided', () => {
    const result = CSharpParser(mock[1]);
    expect(result).toEqual({
      source: `broken.csproj`,
      severity: LogSeverity.error,
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
