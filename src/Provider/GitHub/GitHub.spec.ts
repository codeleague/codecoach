import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import { LogSeverity, LogType } from '../../Parser';
import { GitHub } from './GitHub';
import { IGitHubPRService } from './IGitHubPRService';

const mockedCommentId = 45346;
const mockedReviewId = 324145;
const mockedUserId = 1234;
const mockedSha = '123456';
const mockTouchedFiles = 'file1.cs';
const mockTouchedLine1 = 88;
const mockTouchedLine2 = 99;

const mockedReviews = [
  { id: mockedReviewId, user: { id: mockedUserId } },
] as PullsListReviewCommentsResponseData;

const mockedComments = [
  { id: mockedCommentId, user: { id: mockedUserId } },
] as IssuesListCommentsResponseData;

const prServiceMock: IGitHubPRService = {
  listAllReviewComments: jest.fn(() => Promise.resolve(mockedReviews)),
  listAllComments: jest.fn(() => Promise.resolve(mockedComments)),
  deleteComment: jest.fn(() => Promise.resolve()),
  createComment: jest.fn(() => Promise.resolve()),
  deleteReviewComment: jest.fn(() => Promise.resolve()),
  createReviewComment: jest.fn(() => Promise.resolve()),
  getCurrentUserId: jest.fn(() => Promise.resolve(mockedUserId)),
  getLatestCommitSha: jest.fn(() => Promise.resolve(mockedSha)),
  files: jest.fn(() => Promise.resolve([mockTouchedFiles])),
};

const mockedLogs: LogType[] = [
  {
    log: '',
    msg: 'msg1',
    severity: LogSeverity.error,
    source: mockTouchedFiles,
    line: mockTouchedLine1,
    lineOffset: 99,
    valid: true,
  },
  {
    log: '',
    msg: 'msg2',
    severity: LogSeverity.error,
    source: 'otherfile.cs',
    line: 2,
    lineOffset: 3,
    valid: true,
  },
  {
    log: '',
    msg: 'msg3',
    severity: LogSeverity.warning,
    source: mockTouchedFiles,
    line: mockTouchedLine2,
    lineOffset: 5,
    valid: true,
  },
  {
    log: '',
    msg: 'msg4',
    severity: LogSeverity.warning,
    source: 'otherfile.cs',
    line: 6,
    lineOffset: 7,
    valid: true,
  },
];

describe('VCS: GitHub', () => {
  it('report should remove old comments and reviews and post new ones', async () => {
    const github = new GitHub(prServiceMock);

    const ok = await github.report(mockedLogs);

    expect(prServiceMock.getCurrentUserId).toHaveBeenCalledTimes(1);
    expect(prServiceMock.listAllComments).toHaveBeenCalledTimes(1);
    expect(prServiceMock.listAllReviewComments).toHaveBeenCalledTimes(1);

    expect(prServiceMock.deleteComment).toHaveBeenCalledTimes(1);
    expect(prServiceMock.deleteComment).toHaveBeenCalledWith(mockedCommentId);

    expect(prServiceMock.deleteReviewComment).toHaveBeenCalledTimes(1);
    expect(prServiceMock.deleteReviewComment).toHaveBeenCalledWith(mockedReviewId);

    expect(prServiceMock.getLatestCommitSha).toHaveBeenCalledTimes(1);
    expect(prServiceMock.files).toHaveBeenCalledTimes(1);

    expect(prServiceMock.createReviewComment).toHaveBeenNthCalledWith(
      1,
      mockedSha,
      expect.any(String),
      mockTouchedFiles,
      mockTouchedLine1,
    );
    expect(prServiceMock.createReviewComment).toHaveBeenNthCalledWith(
      2,
      mockedSha,
      expect.any(String),
      mockTouchedFiles,
      99,
    );
    expect(prServiceMock.createComment).toHaveBeenCalledTimes(1);
    expect(prServiceMock.createComment).toHaveBeenCalledWith(expect.any(String));

    expect(ok).toBeFalsy();
  });

  it('should report truthy status if no error occur', async () => {
    const github = new GitHub(prServiceMock);
    const warnLog = mockedLogs[2];

    const ok = await github.report([warnLog]);

    expect(ok).toBeTruthy();
  });
});
