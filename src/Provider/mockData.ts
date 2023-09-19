import { ProjectType } from '../Config/@enums';
import { LintSeverity, LintItem } from '../Parser';

export const mockTouchFile = 'file1.cs';
export const file1TouchLine = 11;
export const file2TouchLine = 33;

export const touchFileError: LintItem = {
  ruleId: '',
  log: '',
  msg: 'msg1',
  severity: LintSeverity.error,
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
  severity: LintSeverity.warning,
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
  severity: LintSeverity.error,
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
  severity: LintSeverity.warning,
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
