import { LintSeverity } from './@enums/LintSeverity';
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
      suppressedMessages: [],
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
      suppressedMessages: [
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
    expect(result).toHaveLength(3);

    expect(result[0]).toEqual({
      ruleId: '',
      source: '',
      severity: LintSeverity.error,
      line: 59,
      lineOffset: 8,
      msg: `Parsing error: ')' expected.`,
      log: JSON.stringify(mockedContent[0].messages[0]),
      valid: false,
      type: 'eslint',
    });

    expect(result[1]).toEqual({
      ruleId: '@typescript-eslint/no-unused-vars',
      source: `src/app.ts`,
      severity: LintSeverity.warning,
      line: 24,
      lineOffset: 15,
      msg: `'content' is defined but never used.`,
      log: JSON.stringify(mockedContent[1].messages[0]),
      valid: true,
      type: 'eslint',
    });

    expect(result[2]).toEqual({
      ruleId: '@typescript-eslint/no-unused-vars',
      source: `src/app.ts`,
      severity: LintSeverity.ignore,
      line: 24,
      lineOffset: 15,
      msg: `'content' is defined but never used.`,
      log: JSON.stringify({ ...mockedContent[1].messages[0], severity: 0 }),
      valid: true,
      type: 'eslint',
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
    expect(valid).toHaveLength(2);
    expect(invalid).toHaveLength(1);
  });

  it('Should parse with severity correctly', () => {
    const result = new ESLintParser(cwd).parse(mockedContentString);
    const resultWithError = result.filter((el) => el.severity === LintSeverity.error);
    const resultWithWarning = result.filter((el) => el.severity === LintSeverity.warning);
    const ignoredResult = result.filter((el) => el.severity === LintSeverity.ignore);
    expect(resultWithError).toHaveLength(1);
    expect(resultWithWarning).toHaveLength(1);
    expect(ignoredResult).toHaveLength(1);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new ESLintParser(cwd).parse(':')).toThrow();
  });
});
