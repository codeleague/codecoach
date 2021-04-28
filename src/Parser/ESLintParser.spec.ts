import { LogSeverity } from './@enums/log.severity.enum';
import { ESLintParser } from './ESLintParser';

describe('ESLintParser', () => {
  const cwd = 'C:/src/github.com/codeleague/codecoach';
  const mockedContent = [
    {
      filePath: 'C:/some/where/else',
      messages: [
        {
          ruleId: null,
          fatal: true,
          severity: 2,
          message: "Parsing error: ')' expected.",
          line: 59,
          column: 8,
        },
      ],
      errorCount: 1,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      source: 'some gibberish text that i dont wanna keep it',
      usedDeprecatedRules: [],
    },
    {
      filePath: 'C:/src/github.com/codeleague/codecoach/src/app.ts',
      messages: [
        {
          ruleId: '@typescript-eslint/no-unused-vars',
          severity: 1,
          message: "'content' is defined but never used.",
          line: 24,
          column: 15,
          nodeType: 'Identifier',
          messageId: 'unusedVar',
          endLine: 24,
          endColumn: 30,
        },
      ],
      errorCount: 1,
      warningCount: 1,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      source: 'some gibberish text that i dont wanna keep it',
      usedDeprecatedRules: [],
    },
  ];

  const mockedContentString = JSON.stringify(mockedContent);

  it('Should parse correctly', () => {
    const result = new ESLintParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      source: '',
      severity: LogSeverity.error,
      line: 59,
      lineOffset: 8,
      msg: `Parsing error: ')' expected.`,
      log: JSON.stringify(mockedContent[0].messages[0]),
      valid: false,
    });

    expect(result[1]).toEqual({
      source: `src/app.ts`,
      severity: LogSeverity.warning,
      line: 24,
      lineOffset: 15,
      msg: `'content' is defined but never used.`,
      log: JSON.stringify(mockedContent[1].messages[0]),
      valid: true,
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new ESLintParser(cwd).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new ESLintParser(cwd).parse(mockedContentString);
    const valid = result.filter((el) => el.valid);
    const invalid = result.filter((el) => !el.valid);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(1);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new ESLintParser(cwd).parse(':')).toThrow();
  });
});
