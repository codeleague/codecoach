import { LogSeverity } from '../../Parser';
import { Gitlab } from './Gitlab';
import { IGitlabMRService } from './IGitlabMRService';
import { MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';

const mockedCommentId = 45346;
const mockedUserId = 1234;
const mockedSha = '123456';
const mockTouchFile = 'file1.cs';
const file1TouchLine = 11;
const file2TouchLine = 33;
const mockTouchDiff = {
  file: mockTouchFile,
  patch: [
    { from: file1TouchLine - 1, to: file1TouchLine + 1 },
    { from: file2TouchLine - 2, to: file2TouchLine + 2 },
  ],
};

const mockedComments = [
  { id: mockedCommentId, author: { id: mockedUserId } },
] as MergeRequestNoteSchema[];

class MrServiceMock implements IGitlabMRService {
  listAllNotes = jest.fn().mockResolvedValue(mockedComments);
  createNote = jest.fn().mockResolvedValue(undefined);
  createReviewComment = jest.fn().mockResolvedValue(undefined);
  deleteNote = jest.fn().mockResolvedValue(undefined);
  getCurrentUserId = jest.fn().mockResolvedValue(mockedUserId);
  getLatestCommitSha = jest.fn().mockResolvedValue(mockedSha);
  diff = jest.fn().mockResolvedValue([mockTouchDiff]);
}

const touchFileError = {
  log: '',
  msg: 'msg1',
  severity: LogSeverity.error,
  source: mockTouchFile,
  line: file1TouchLine,
  lineOffset: 22,
  valid: true,
};
const touchFileWarning = {
  log: '',
  msg: 'msg3',
  severity: LogSeverity.warning,
  source: mockTouchFile,
  line: file2TouchLine,
  lineOffset: 44,
  valid: true,
};
const untouchedError = {
  log: '',
  msg: 'msg2',
  severity: LogSeverity.error,
  source: 'otherfile.cs',
  line: 55,
  lineOffset: 66,
  valid: true,
};
const untouchedWarning = {
  log: '',
  msg: 'msg4',
  severity: LogSeverity.warning,
  source: 'otherfile.cs',
  line: 77,
  lineOffset: 88,
  valid: true,
};

describe('VCS: GitHub', () => {
  it('should remove old comments and reviews and post new ones', async () => {
    const service = new MrServiceMock();
    const github = new Gitlab(service, true);

    await github.report([
      touchFileError,
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(service.getCurrentUserId).toHaveBeenCalledTimes(1);
    expect(service.listAllNotes).toHaveBeenCalledTimes(1);

    expect(service.deleteNote).toHaveBeenCalledTimes(1);
    expect(service.deleteNote).toHaveBeenCalledWith(mockedCommentId);

    expect(service.getLatestCommitSha).toHaveBeenCalledTimes(1);
    expect(service.diff).toHaveBeenCalledTimes(1);

    expect(service.createReviewComment).toHaveBeenNthCalledWith(
      1,
      mockedSha,
      expect.any(String),
      touchFileError.source,
      touchFileError.line,
    );
    expect(service.createReviewComment).toHaveBeenNthCalledWith(
      2,
      mockedSha,
      expect.any(String),
      touchFileWarning.source,
      touchFileWarning.line,
    );

    expect(service.createNote).toHaveBeenCalledTimes(1);
    expect(service.createNote).toHaveBeenCalledWith(expect.any(String));
  });

  it('should group comments in the same line of same file', async () => {
    const service = new MrServiceMock();
    const github = new Gitlab(service);

    await github.report([touchFileError, touchFileError, touchFileError, touchFileError]);

    expect(service.createReviewComment).toHaveBeenCalledTimes(1);
    expect(service.createReviewComment).toHaveBeenCalledWith(
      mockedSha,
      expect.any(String),
      touchFileError.source,
      touchFileError.line,
    );
  });

  it('should set commit status as success when no error', async () => {
    const service = new MrServiceMock();
    const github = new Gitlab(service);
    await github.report([touchFileWarning]);

    expect(service.createReviewComment).toHaveBeenCalledTimes(1);
    expect(service.createNote).toHaveBeenCalledTimes(1);
  });
});
