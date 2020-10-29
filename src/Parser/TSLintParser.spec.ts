import { LogSeverity } from './@enums/log.severity.enum';
import { TSLintParser } from './TSLintParser';

describe('TSLintParser tests', () => {
  const mockedContent = [
    {
      endPosition: { character: 5, line: 55, position: 3915 },
      failure: "Identifier 'a' is never reassigned; use 'const' instead of 'let'.",
      name:
        'C:/Users/kthuswongsa/Documents/agoda-com-spa-mobile/tmp/repo/Agoda.Mobile.Client/src/app/mobile/component/Layout/Layout.tsx',
      ruleName: 'prefer-const',
      ruleSeverity: 'ERROR',
      startPosition: { character: 4, line: 55, position: 3914 },
    },
    {
      endPosition: { character: 5, line: 57, position: 3925 },
      failure: "Identifier 'b' is never reassigned; use 'const' instead of 'let'.",
      name: '',
      ruleName: 'prefer-const',
      ruleSeverity: 'ERROR',
      startPosition: { character: 4, line: 57, position: 3924 },
    },
  ];

  const mockedContentString = JSON.stringify(mockedContent);

  it('Should parse correctly', () => {
    const result = new TSLintParser().withContent(mockedContentString).getLogs();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      source: `Agoda.Mobile.Client/src/app/mobile/component/Layout/Layout.tsx`,
      severity: LogSeverity.error,
      line: 56,
      lineOffset: 4,
      msg: `Identifier 'a' is never reassigned; use 'const' instead of 'let'.`,
      log: JSON.stringify(mockedContent[0]),
      valid: true,
    });
  });

  it('Should be able to call `withContent` multiple times and add all content together', () => {
    const result = new TSLintParser()
      .withContent(mockedContentString)
      .withContent(mockedContentString)
      .getLogs();

    expect(result).toHaveLength(4);
  });

  it('Should do nothing if put empty string', () => {
    const result = new TSLintParser().withContent('').getLogs();
    expect(result).toHaveLength(0);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new TSLintParser().withContent(mockedContentString).getLogs();
    const valid = result.filter((el) => el.valid === true);
    const invalid = result.filter((el) => el.valid === false);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(1);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new TSLintParser().withContent(':')).toThrow();
  });
});
