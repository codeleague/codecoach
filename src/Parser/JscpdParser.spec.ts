import { LogSeverity } from './@enums/log.severity.enum';
import { JscpdParser } from './JscpdParser';

describe('JscpdParser tests', () => {
  const cwd = '/Users/master/builds/DxeaNTET/0/mycopiedproject';
  const mockedContent = {
    duplicates: [
      {
        format: 'csharp',
        lines: 11,
        fragment:
          'using System.Threading.Tasks;\r\nusing Core.Models;\r\nusing Core.Services;\r\nusing Microsoft.AspNetCore.Mvc;\r\nusing Nelibur.ObjectMapper;\r\nusing Swashbuckle.AspNetCore.Annotations;\r\n\r\nnamespace WebApi.Controllers;\r\n\r\n[',
        tokens: 0,
        firstFile: {
          name: 'src/WebApi/Controllers/HController.cs',
          start: 1,
          end: 11,
          startLoc: {
            line: 1,
            column: 2,
            position: 1,
          },
          endLoc: {
            line: 11,
            column: 2,
            position: 93,
          },
        },
        secondFile: {
          name: 'src/WebApi/Controllers/GController.cs',
          start: 1,
          end: 11,
          startLoc: {
            line: 1,
            column: 1,
            position: 0,
          },
          endLoc: {
            line: 11,
            column: 14,
            position: 92,
          },
        },
      },
    ],
  };

  const mockedContentString = JSON.stringify(mockedContent);

  it('Should parse correctly', () => {
    const result = new JscpdParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ruleId: 'jscpd',
      source: `src/WebApi/Controllers/GController.cs`,
      severity: LogSeverity.warning,
      line: 1,
      lineOffset: 1,
      nLines: 11,
      msg: `
Found code duplication from \`src/WebApi/Controllers/HController.cs:1\`

<details>
  <summary>Click to see duplicated code</summary>

  \`\`\`
  ${mockedContent.duplicates[0].fragment}
  \`\`\`
</details>
      `,
      log: JSON.stringify(mockedContent.duplicates[0]),
      valid: true,
      type: 'jscpd',
    });
    expect(result[1]).toEqual({
      ruleId: 'jscpd',
      source: `src/WebApi/Controllers/HController.cs`,
      severity: LogSeverity.warning,
      line: 1,
      lineOffset: 2,
      nLines: 11,
      msg: `
Found code duplication from \`src/WebApi/Controllers/GController.cs:1\`

<details>
  <summary>Click to see duplicated code</summary>

  \`\`\`
  ${mockedContent.duplicates[0].fragment}
  \`\`\`
</details>
      `,
      log: JSON.stringify(mockedContent.duplicates[0]),
      valid: true,
      type: 'jscpd',
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new JscpdParser(cwd).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new JscpdParser(cwd).parse(':')).toThrow();
  });
});
