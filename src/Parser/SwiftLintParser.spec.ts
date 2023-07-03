import { LogSeverity } from './@enums/log.severity.enum';
import { SwiftLintParser } from './SwiftLintParser';

describe('SwiftLintParser tests', () => {
  it('should parse log correctly', () => {
    const log = `/Users/codecoach/myswiftproject/TestSwiftFile1.swift:4:18: warning: Sorted Imports Violation: Imports should be sorted (sorted_imports)`;

    const result = new SwiftLintParser(Cwd.projectAbsolutePath).parse(log);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ruleId: 'sorted_imports',
      source: `TestSwiftFile1.swift`,
      severity: LogSeverity.warning,
      line: 4,
      lineOffset: 18,
      msg: `Sorted Imports Violation: Imports should be sorted`,
      log,
      valid: true,
      type: 'swiftlint',
    });
  });

  // it('should handle path with special characters', () => {
  //   const log = `C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Professional\\MSBuild\\Current\\bin\\Microsoft.Common.CurrentVersion.targets(2084,5): warning MSB3276: Found conflicts between different versions of the same dependent assembly. Please set the "AutoGenerateBindingRedirects" property to true in the project file. For more information, see http://go.microsoft.com/fwlink/?LinkId=294190. [C:\\source\\Project\\Project.csproj]`;
  //   expect(() => new MSBuildParser(cwd).parse(log)).not.toThrow();
  // });

  enum Cwd {
    projectAbsolutePath = '/Users/codecoach/myswiftproject',
    differentThanProjectAbsolutePath = '/different-absolute-path',
  }
});
