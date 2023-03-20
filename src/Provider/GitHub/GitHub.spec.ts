import { CommitStatus } from './CommitStatus';
import { GitHub } from './GitHub';
import { IGitHubPRService } from './IGitHubPRService';
import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from './OctokitTypeMap';
import {
  mockTouchDiff,
  touchFileError,
  touchFileWarning,
  untouchedError,
  untouchedWarning,
} from '../mockData';

const mockedCommentId = 45346;
const mockedReviewId = 324145;
const mockedUserId = 1234;
const mockedSha = '123456';

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

describe('VCS: GitHub', () => {
  it('should always return true', async () => {
    const service = new PrServiceMock();
    const github = new GitHub(service, true);

    const result = await github.report([
      touchFileError,
      touchFileWarning,
      untouchedError,
      untouchedWarning,
    ]);

    expect(result).toBe(true);
  });

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
    const github = new GitHub(service, false, false);
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

  it('should set commit status as failure when there is error', async () => {
    const service = new PrServiceMock();
    const github = new GitHub(service);
    await github.report([touchFileError]);

    expect(service.createReviewComment).toHaveBeenCalledTimes(1);
    expect(service.createComment).toHaveBeenCalledTimes(1);
    expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
    expect(service.setCommitStatus).toHaveBeenCalledWith(
      mockedSha,
      CommitStatus.failure,
      expect.any(String),
    );
  });

  describe('when failOnWarnings is true', () => {
    it('should set commit status as success when no error or warning', async () => {
      const service = new PrServiceMock();
      const github = new GitHub(service, false, true);
      await github.report([]);

      expect(service.createReviewComment).toHaveBeenCalledTimes(0);
      expect(service.createComment).toHaveBeenCalledTimes(0);
      expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
      expect(service.setCommitStatus).toHaveBeenCalledWith(
        mockedSha,
        CommitStatus.success,
        expect.any(String),
      );
    });

    it('should set commit status as failure when there is error', async () => {
      const service = new PrServiceMock();
      const github = new GitHub(service, false, true);
      await github.report([touchFileError]);

      expect(service.createReviewComment).toHaveBeenCalledTimes(1);
      expect(service.createComment).toHaveBeenCalledTimes(1);
      expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
      expect(service.setCommitStatus).toHaveBeenCalledWith(
        mockedSha,
        CommitStatus.failure,
        expect.any(String),
      );
    });

    it('should set commit status as failure when there is warning', async () => {
      const service = new PrServiceMock();
      const github = new GitHub(service, false, true);
      await github.report([touchFileWarning]);

      expect(service.createReviewComment).toHaveBeenCalledTimes(1);
      expect(service.createComment).toHaveBeenCalledTimes(1);
      expect(service.setCommitStatus).toHaveBeenCalledTimes(1);
      expect(service.setCommitStatus).toHaveBeenCalledWith(
        mockedSha,
        CommitStatus.failure,
        expect.any(String),
      );
    });
  });
});
