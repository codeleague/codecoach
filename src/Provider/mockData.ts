import { ProjectType } from '../Config/@enums';
import { LogSeverity, LintItem } from '../Parser';

export const mockTouchFile = 'file1.cs';
export const file1TouchLine = 11;
export const file2TouchLine = 33;

export const touchFileError: LintItem = {
  ruleId: '',
  log: '',
  msg: 'msg1',
  severity: LogSeverity.error,
  source: mockTouchFile,
  line: file1TouchLine,
  lineOffset: 22,
  valid: true,
  type: ProjectType.eslint,
};
export const touchFileWarning: LintItem = {
  ruleId: '',
  log: '',
  msg: 'msg3',
  severity: LogSeverity.warning,
  source: mockTouchFile,
  line: file2TouchLine,
  lineOffset: 44,
  nLines: 2,
  valid: true,
  type: ProjectType.eslint,
};
export const untouchedError: LintItem = {
  ruleId: '',
  log: '',
  msg: 'msg2',
  severity: LogSeverity.error,
  source: 'otherfile.cs',
  line: 55,
  lineOffset: 66,
  valid: true,
  type: ProjectType.eslint,
};
export const untouchedWarning: LintItem = {
  ruleId: '',
  log: '',
  msg: 'msg4',
  severity: LogSeverity.warning,
  source: 'otherfile.cs',
  line: 77,
  lineOffset: 88,
  valid: true,
  type: ProjectType.eslint,
};
export const mockTouchDiff = {
  file: mockTouchFile,
  patch: [
    { from: file1TouchLine - 1, to: file1TouchLine + 1 },
    { from: file2TouchLine - 2, to: file2TouchLine + 2 },
  ],
};
