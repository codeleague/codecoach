import { LogSeverity } from './@enums/log.severity.enum';
import { LogType } from './@types/log.type';
import { CSharpParser } from './CSharpParser';

describe('CSharpParser tests', () => {
  const contentWithLineOffset =
    '1:7>C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]';

  const contentNoLineOffset =
    "1:7>CSC : error CS5001: Program does not contain a static 'Main' method suitable for an entry point [C:\\source\\codeleague\\codecoach\\tmp\\repo\\Broken.csproj]";

  const contentWithNotValid = `
  3:9>/opt/buildagent/work/8e09d9d554a92a80/tmp/repo/Tests/Agoda.Gateway.Core.Tests/Mocks/SearchResultMockBuilder.cs(17,43): warning CS0649: Field 'SearchResultMockBuilder._urgencyScore' is never assigned to, and will always have its default value null [/opt/buildagent/work/8e09d9d554a92a80/tmp/repo/Tests/Agoda.Gateway.Core.Tests/Agoda.Gateway.Core.Tests.csproj]
  17:6>/opt/buildagent/work/8e09d9d554a92a80/tmp/repo/Tests/PCI/Agoda.Gateway.Pci.External.Tests/BookingApi/Mappers/Request/CreateBookingRequestMapperTests.cs(226,17): warning CS0219: The variable 'langId' is assigned but its value is never used [/opt/buildagent/work/8e09d9d554a92a80/tmp/repo/Tests/PCI/Agoda.Gateway.Pci.External.Tests/Agoda.Gateway.Pci.External.Tests.csproj]
    9:8>/usr/share/dotnet/sdk/3.1.402/Microsoft.Common.CurrentVersion.targets(2084,5): warning MSB3277: Found conflicts between different versions of "Microsoft.Extensions.Configuration.Json" that could not be resolved.  These reference conflicts are listed in the build log when log verbosity is set to detailed. [/opt/buildagent/work/8e09d9d554a92a80/tmp/repo/Tests/Agoda.Gateway.External.Tests/Agoda.Gateway.External.Tests.csproj]`;

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
      valid: true,
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
      valid: true,
    } as LogType);
  });

  it('Should be able to call `withContent` multiple times and add all content together', () => {
    const result = new CSharpParser()
      .withContent(contentWithLineOffset)
      .withContent(contentNoLineOffset)
      .getLogs();

    expect(result).toHaveLength(2);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new CSharpParser().withContent(contentWithNotValid).getLogs();
    const valid = result.filter((el) => el.valid === true);
    const invalid = result.filter((el) => el.valid === false);
    expect(valid).toHaveLength(2);
    expect(invalid).toHaveLength(1);
  });

  it('Should do nothing if put empty string', () => {
    const result = new CSharpParser().withContent('').getLogs();
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new CSharpParser().withContent(':')).toThrowError();
  });
});
