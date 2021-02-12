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
const mockTouchedFiles = 'file1.cs';

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
  createCommitStatus = jest.fn().mockResolvedValue(undefined);
  files = jest.fn().mockResolvedValue([mockTouchedFiles]);
}

const touchFileError = {
  log: '',
  msg: 'msg1',
  severity: LogSeverity.error,
  source: mockTouchedFiles,
  line: 11,
  lineOffset: 22,
  valid: true,
};
const touchFileWarning = {
  log: '',
  msg: 'msg3',
  severity: LogSeverity.warning,
  source: mockTouchedFiles,
  line: 33,
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
    const github = new GitHub(service);

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
    expect(service.files).toHaveBeenCalledTimes(1);

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

    expect(service.createCommitStatus).toHaveBeenCalledTimes(1);
    expect(service.createCommitStatus).toHaveBeenCalledWith(
      mockedSha,
      CommitStatus.failure,
      expect.any(String),
    );

    expect(service.createComment).toHaveBeenCalledTimes(1);
    expect(service.createComment).toHaveBeenCalledWith(expect.any(String));
  });

  it('should set commit status as success when no error', async () => {
    const service = new PrServiceMock();
    const github = new GitHub(service);
    await github.report([touchFileWarning]);

    expect(service.createReviewComment).toHaveBeenCalledTimes(1);
    expect(service.createComment).toHaveBeenCalledTimes(10);
    expect(service.createCommitStatus).toHaveBeenCalledTimes(1);
    expect(service.createCommitStatus).toHaveBeenCalledWith(
      mockedSha,
      CommitStatus.success,
      expect.any(String),
    );
  });

  it('should not throw when create review failed (REMOVE THIS TEST WHEN WORKAROUND IS REMOVED)', async () => {
    const service = new PrServiceMock();
    service.createReviewComment = jest.fn(() => Promise.reject());

    const github = new GitHub(service);

    await expect(github.report([touchFileWarning])).resolves.not.toThrow();
  });
});
