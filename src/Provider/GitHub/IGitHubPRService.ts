import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import { CommitStatus } from './CommitStatus';

export interface IGitHubPRService {
  listAllReviewComments(): Promise<PullsListReviewCommentsResponseData>;
  listAllComments(): Promise<IssuesListCommentsResponseData>;
  deleteComment(comment_id: number): Promise<void>;
  createComment(body: string): Promise<void>;
  deleteReviewComment(comment_id: number): Promise<void>;
  createReviewComment(
    commit_id: string,
    body: string,
    path: string,
    line?: number,
  ): Promise<void>;
  getCurrentUserId(): Promise<number>;
  getLatestCommitSha(): Promise<string>;
  createCommitStatus(
    commitId: string,
    state: CommitStatus,
    description?: string,
  ): Promise<void>;
  files(): Promise<string[]>;
}
