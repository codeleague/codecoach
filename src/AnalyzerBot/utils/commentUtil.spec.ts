import { LogSeverity, LogType } from '../../Parser';
import {
  file1TouchLine,
  file2TouchLine,
  mockTouchFile,
  touchFileError,
  touchFileWarning,
} from '../../Provider/mockData';
import { groupComments } from './commentUtil';

describe('groupComments', () => {
  const logs: LogType[] = [touchFileError, touchFileWarning];

  it('returns comments based on lint logs', () => {
    const comments = groupComments(logs);
    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        errors: 1,
        warnings: 0,
        text: ':rotating_light: msg1' + '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        errors: 0,
        warnings: 1,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });

  it('group multiple logs on the same line to the same comment', () => {
    const comments = groupComments([
      ...logs,
      {
        ...touchFileError,
        msg: 'additional warning',
        severity: LogSeverity.warning,
        lineOffset: 33,
      },
    ]);

    expect(comments).toEqual([
      {
        file: mockTouchFile,
        line: file1TouchLine,
        errors: 1,
        warnings: 1,
        text: ':rotating_light: msg1' + '  \n' + ':warning: additional warning' + '  \n',
      },
      {
        file: mockTouchFile,
        line: file2TouchLine,
        errors: 0,
        warnings: 1,
        text: ':warning: msg3' + '  \n',
      },
    ]);
  });
});
