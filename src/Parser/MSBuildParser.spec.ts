import { LogSeverity } from './@enums/log.severity.enum';
import { MSBuildParser } from './MSBuildParser';

describe('MSBuildParser tests', () => {
  const cwd = 'C:\\source';

  it('should parse log correctly', () => {
    const log = `Service\\Provider.cs(67,29): warning CS0414: The field 'Data.field' is assigned but its value is never used [C:\\source\\Project\\Project.cs]`;

    const result = new MSBuildParser(cwd).parse(log);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ruleId: 'CS0414',
      source: `Project/Service/Provider.cs`,
      severity: LogSeverity.warning,
      line: 67,
      lineOffset: 29,
      msg: `CS0414: The field 'Data.field' is assigned but its value is never used`,
      log,
      valid: true,
      type: 'msbuild',
    });
  });

  it('should ignore framework warnings', () => {
    const log = `C:\\source\\Project\\Project.csproj : warning NU1701: Package 'Microsoft.AspNet.WebApi.Client 5.2.3' was restored using '.NETFramework,Version=v4.6.1' instead of the project target framework '.NETStandard,Version=v2.0'. This package may not be fully compatible with your project.`;

    const result = new MSBuildParser(cwd).parse(log);

    expect(result[0].valid).toBe(false);
  });

  it('should handle path with special characters', () => {
    const log = `C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Professional\\MSBuild\\Current\\bin\\Microsoft.Common.CurrentVersion.targets(2084,5): warning MSB3276: Found conflicts between different versions of the same dependent assembly. Please set the "AutoGenerateBindingRedirects" property to true in the project file. For more information, see http://go.microsoft.com/fwlink/?LinkId=294190. [C:\\source\\Project\\Project.csproj]`;
    expect(() => new MSBuildParser(cwd).parse(log)).not.toThrow();
  });
});
