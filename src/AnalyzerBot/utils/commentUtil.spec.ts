import { LintSeverity, LintItem } from '../../Parser';
import {
  file1TouchLine,
  file2TouchLine,
  mockTouchFile,
  touchFileError,
  touchFileWarning,
} from '../../Provider/mockData';
import { groupComments } from './commentUtil';

describe('groupComments', () => {
  const items: LintItem[] = [touchFileError, touchFileWarning];

  it('returns comments based on lint items', () => {
    const comments = groupComments(items, []);
    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        nLines: 1,
        errors: 1,
        warnings: 0,
        suppresses: 0,
        text: ':rotating_light: msg1' + '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        nLines: 2,
        errors: 0,
        warnings: 1,
        suppresses: 0,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });

  it('group multiple items on the same line to the same comment', () => {
    const comments = groupComments(
      [
        ...items,
        {
          ...touchFileError,
          msg: 'additional warning',
          severity: LintSeverity.warning,
          lineOffset: 33,
        },
      ],
      [],
    );

    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        nLines: 1,
        errors: 1,
        warnings: 1,
        suppresses: 0,
        text: ':rotating_light: msg1' + '  \n' + ':warning: additional warning' + '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        nLines: 2,
        errors: 0,
        warnings: 1,
        suppresses: 0,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });

  it('suppress errors and warnings according to provided suppressRules', () => {
    const comments = groupComments(
      [
        ...items,
        {
          ...touchFileError,
          msg: 'additional warning',
          severity: LintSeverity.warning,
          lineOffset: 33,
          ruleId: 'UNIMPORTANT_RULE2',
        },
      ],
      ['UNIMPORTANT_RULE1', 'UNIMPORTANT_RULE2'],
    );

    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        nLines: 1,
        errors: 1,
        warnings: 0,
        suppresses: 1,
        text:
          ':rotating_light: msg1' +
          '  \n' +
          ':warning: (SUPPRESSED) additional warning' +
          '  \n(rule: UNIMPORTANT_RULE2)' +
          '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        nLines: 2,
        errors: 0,
        warnings: 1,
        suppresses: 0,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });

  it('support regexp in suppressRules', () => {
    const comments = groupComments(
      [
        ...items,
        {
          ...touchFileError,
          msg: 'additional warning',
          severity: LintSeverity.warning,
          lineOffset: 33,
          ruleId: 'UNIMPORTANT_RULE/RULE2',
        },
      ],
      ['UNIMPORTANT_RULE/.*'],
    );

    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        nLines: 1,
        errors: 1,
        warnings: 0,
        suppresses: 1,
        text:
          ':rotating_light: msg1' +
          '  \n' +
          ':warning: (SUPPRESSED) additional warning' +
          '  \n(rule: UNIMPORTANT_RULE/RULE2)' +
          '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        nLines: 2,
        errors: 0,
        warnings: 1,
        suppresses: 0,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });
});
