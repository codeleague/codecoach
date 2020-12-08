import { LogSeverity } from './@enums/log.severity.enum';
import { MSBuildParser } from './MSBuildParser';

describe('MSBuildParser tests', () => {
  const cwd = 'C:\\source';

  it('should parse log correctly', () => {
    const log =
      "Service\\Provider.cs(67,29): warning CS0414: The field 'Data.field' is assigned but its value is never used [C:\\source\\Project\\Project.cs]";

    const result = new MSBuildParser(cwd).withContent(log).getLogs();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      source: `Project/Service/Provider.cs`,
      severity: LogSeverity.warning,
      line: 67,
      lineOffset: 29,
      msg: `CS0414: The field 'Data.field' is assigned but its value is never used`,
      log,
      valid: true,
    });
  });
});
