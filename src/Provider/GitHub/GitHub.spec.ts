import { LogSeverity } from '../../Parser';
import { CommitStatus } from './CommitStatus';
import { GitHub } from './GitHub';
import { IGitHubPRService } from './IGitHubPRService';
import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from './OctokitTypeMap';

const mockedCommentId = 45346;
const mockedReviewId = 324145;
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

const mockedReviews = [
  { id: mockedReviewId, user: { id: mockedUserId } },
] as PullsListReviewCommentsResponseData;

const mockedComments = [
  { id: mockedCommentId, user: { id: mockedUserId } },
] as IssuesListCommentsResponseData;

class PrServiceMock implements IGitHubPRService {
  listAllReviewComments = jest.fn().mockResolvedValue(mockedReviews);
  listAllComments = jest.fn().mockResolvedValue(mockedComments);
  deleteComment = jest.fn().mockResolvedValue(undefined);
  createComment = jest.fn().mockResolvedValue(undefined);
  deleteReviewComment = jest.fn().mockResolvedValue(undefined);
  createReviewComment = jest.fn().mockResolvedValue(undefined);
  getCurrentUserId = jest.fn().mockResolvedValue(mockedUserId);
  getLatestCommitSha = jest.fn().mockResolvedValue(mockedSha);
  setCommitStatus = jest.fn().mockResolvedValue(undefined);
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
    const service = new PrServiceMock();
    const github = new GitHub(service, true);

    await github.report([
      touchFileError,
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(service.getCurrentUserId).toHaveBeenCalledTimes(1);
    expect(service.listAllComments).toHaveBeenCalledTimes(1);
    expect(service.listAllReviewComments).toHaveBeenCalledTimes(1);

    expect(service.deleteComment).toHaveBeenCalledTimes(1);
    expect(service.deleteComment).toHaveBeenCalledWith(mockedCommentId);

    expect(service.deleteReviewComment).toHaveBeenCalledTimes(1);
    expect(service.deleteReviewComment).toHaveBeenCalledWith(mockedReviewId);

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

    expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
    expect(service.setCommitStatus).toHaveBeenCalledWith(
      mockedSha,
      CommitStatus.failure,
      expect.any(String),
    );

    expect(service.createComment).toHaveBeenCalledTimes(1);
    expect(service.createComment).toHaveBeenCalledWith(expect.any(String));
  });

  it('should group comments in the same line of same file', async () => {
    const service = new PrServiceMock();
    const github = new GitHub(service);

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
    const service = new PrServiceMock();
    const github = new GitHub(service);
    await github.report([touchFileWarning]);

    expect(service.createReviewComment).toHaveBeenCalledTimes(1);
    expect(service.createComment).toHaveBeenCalledTimes(1);
    expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
    expect(service.setCommitStatus).toHaveBeenCalledWith(
      mockedSha,
      CommitStatus.success,
      expect.any(String),
    );
  });
});
