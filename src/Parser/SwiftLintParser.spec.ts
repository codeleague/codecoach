import { LintSeverity } from './@enums/LintSeverity';
import { SwiftLintParser } from './SwiftLintParser';

describe('SwiftLintParser tests', () => {
  const cwd = '/Users/master/builds/DxeaNTET/0/myswiftproject';
  const mockedContent = [
    {
      character: null,
      file:
        '/Users/master/builds/DxeaNTET/0/myswiftproject/Folder1/SubFolder1/File5.swift',
      line: 130,
      reason: 'Line should be 120 characters or less; currently it has 125 characters',
      rule_id: 'line_length',
      severity: 'Warning',
      type: 'Line Length',
    },
    {
      character: 7,
      file: '',
      line: 9,
      reason:
        'Type body should span 400 lines or less excluding comments and whitespace: currently spans 448 lines',
      rule_id: 'type_body_length',
      severity: 'Error',
      type: 'Type Body Length',
    },
  ];

  const mockedContentString = JSON.stringify(mockedContent);

  it('Should parse correctly', () => {
    const result = new SwiftLintParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ruleId: 'line_length',
      source: `Folder1/SubFolder1/File5.swift`,
      severity: LintSeverity.warning,
      line: 130,
      lineOffset: 0,
      msg: `Line should be 120 characters or less; currently it has 125 characters`,
      log: JSON.stringify(mockedContent[0]),
      valid: true,
      type: 'swiftlint',
    });
    expect(result[1]).toEqual({
      ruleId: 'type_body_length',
      source: ``,
      severity: LintSeverity.error,
      line: 9,
      lineOffset: 7,
      msg: `Type body should span 400 lines or less excluding comments and whitespace: currently spans 448 lines`,
      log: JSON.stringify(mockedContent[1]),
      valid: false,
      type: 'swiftlint',
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new SwiftLintParser(cwd).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new SwiftLintParser(cwd).parse(mockedContentString);
    const valid = result.filter((el) => el.valid);
    const invalid = result.filter((el) => !el.valid);
    expect(valid).toHaveLength(1);
    expect(invalid).toHaveLength(1);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new SwiftLintParser(cwd).parse(':')).toThrow();
  });
});
