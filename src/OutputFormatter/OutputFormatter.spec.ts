import { ProjectType } from '../Config/@enums/projectType';
import { LintItem, LogSeverity } from '../Parser';
import { gitLabFormatter } from './OutputFormatter';

describe('OutputFormatter', () => {
  it('should format logs to GitLab format', () => {
    const items: LintItem[] = [
      {
        ruleId: 'id',
        log: 'log',
        msg: 'msg',
        severity: LogSeverity.error,
        source: 'src',
        line: 2,
        lineOffset: 1,
        nLines: 4,
        valid: true,
        type: ProjectType.dotnetbuild,
      },
    ];

    const result = gitLabFormatter(items);
    expect(result).toBe(
      `[
  {
    "description": "msg",
    "check_name": "id",
    "fingerprint": "4ffb31820fd8eff505f387bacc348a2fa260714cb15da7b27de69846d3a51c3a",
    "severity": "blocker",
    "location": {
      "path": "src",
      "lines": {
        "begin": 2
      }
    }
  }
]`,
    );
  });
});
