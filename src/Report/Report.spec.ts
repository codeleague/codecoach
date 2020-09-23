import { Report } from './Report';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import LogType from '../Parser/@types/log.type';

describe('Report test', () => {
  const mockLogs: LogType[] = [
    {
      log:
        'Broken.cs(6,8): warning AG0030: Prevent use of dynamic [C:\\Users\\kthuswongsa\\Documents\\codecoach\\sample\\csharp\\broken.csproj]',
      msg:
        'AG0030: Prevent use of dynamic [C:\\Users\\kthuswongsa\\Documents\\codecoach\\sample\\csharp\\broken.csproj]',
      line: 6,
      lineOffset: 8,
      source: 'Broken.cs',
      severity: 'warning' as LogSeverity,
    },
    {
      log:
        'Broken.cs(6,8): error AG0030: Prevent use of dynamic [C:\\Users\\kthuswongsa\\Documents\\codecoach\\sample\\csharp\\broken.csproj]',
      msg:
        'AG0030: Prevent use of dynamic [C:\\Users\\kthuswongsa\\Documents\\codecoach\\sample\\csharp\\broken.csproj]',
      line: 6,
      lineOffset: 8,
      source: 'Broken.cs',
      severity: 'error' as LogSeverity,
    },
  ];

  it('Should parse the log that contain many log severity type correctly', () => {
    const report = Report.parse(mockLogs);
    expect(report.warning.n).toBe(1);
    expect(report.error.n).toBe(1);
    expect(report.info.n).toBe(0);
  });
});
