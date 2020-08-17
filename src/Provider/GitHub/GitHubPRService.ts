import { Octokit } from '@octokit/rest';
import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import { URL } from 'url';

import { GITHUB_COM_API } from '../../app.constants';
import { TIME_ZONE, USER_AGENT } from '../../Config/constants/defaults';
import { Log } from '../../Logger';
import { GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE } from '../constants/github.provider.constant';
import { CommitStatus } from './CommitStatus';
import { IGitHubPRService } from './IGitHubPRService';

type PrRequestBase = {
  owner: string;
  repo: string;
};

export class GitHubPRService implements IGitHubPRService {
  private readonly requestBase: PrRequestBase;
  private readonly adapter: Octokit;

  constructor(token: string, repoUrl: string, private readonly pr: number) {
    const repoUrlObj = new URL(repoUrl);
    this.adapter = new Octokit({
      auth: token,
      userAgent: USER_AGENT,
      timeZone: TIME_ZONE,
      baseUrl: GitHubPRService.getApiBase(repoUrlObj),
    });

    const [, owner, repo] = repoUrlObj.pathname.replace(/\.git$/gi, '').split('/');
    this.requestBase = { owner, repo };
  }

  async listAllReviewComments(): Promise<PullsListReviewCommentsResponseData> {
    const response = await this.adapter.pulls.listReviewComments({
      ...this.requestBase,
      pull_number: this.pr,
      per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
    });
    return response.data;
  }

  private static getApiBase(repo: URL): string {
    return repo.hostname === 'github.com'
      ? GITHUB_COM_API
      : new URL('api/v3', repo.origin).toString();
  }

  async listAllComments(): Promise<IssuesListCommentsResponseData> {
    const { headers, data: firstPageComments } = await this.adapter.issues.listComments({
      ...this.requestBase,
      issue_number: this.pr,
      per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
    });
    if (!headers.link) {
      return firstPageComments;
    }
    const getLastPageNumberRegex = /.*page=(\d+)>; rel="last"/;
    const extract = headers.link.match(getLastPageNumberRegex);
    if (!extract) {
      throw new Error(`List comments failed: ${headers.link}`);
    }
    const [, lastPageNumber] = extract;

    const FIRST_PAGE_OFFSET = 1;
    const QUERY_PAGE_OFFSET = 2;
    const listCommentHelper = Array(Number(lastPageNumber) - FIRST_PAGE_OFFSET)
      .fill(undefined)
      .map((_, i) => {
        const pageIndex = i + QUERY_PAGE_OFFSET;
        return this.adapter.issues.listComments({
          ...this.requestBase,
          issue_number: this.pr,
          per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
          page: pageIndex,
        });
      });
    const listCommentQuery = (await Promise.all(listCommentHelper)).flatMap(
      (el) => el.data,
    );
    return [...firstPageComments, ...listCommentQuery];
  }

  async deleteComment(comment_id: number): Promise<void> {
    await this.adapter.issues.deleteComment({ ...this.requestBase, comment_id });
  }

  async createComment(body: string): Promise<void> {
    await this.adapter.issues.createComment({
      ...this.requestBase,
      issue_number: this.pr,
      body,
    });
  }

  async deleteReviewComment(comment_id: number): Promise<void> {
    await this.adapter.pulls.deleteReviewComment({ ...this.requestBase, comment_id });
  }

  async createReviewComment(
    commit_id: string,
    body: string,
    path: string,
    line?: number,
  ): Promise<void> {
    const commonParams = {
      mediaType: {
        previews: ['comfort-fade'],
      },
      ...this.requestBase,
      pull_number: this.pr,
      body,
      commit_id,
      path,
    };

    await this.adapter.pulls.createReviewComment(
      line ? { ...commonParams, line, side: 'RIGHT' } : { ...commonParams, position: 1 },
    );
  }

  async getCurrentUserId(): Promise<number> {
    const response = await this.adapter.users.getAuthenticated();
    const user = response.data;
    return user.id;
  }

  async getLatestCommitSha(): Promise<string> {
    const { data } = await this.adapter.pulls.get({
      ...this.requestBase,
      pull_number: this.pr,
    });

    return data.head.sha;
  }

  async createCommitStatus(
    sha: string,
    state: CommitStatus,
    description?: string,
  ): Promise<void> {
    try {
      await this.adapter.repos.createCommitStatus({
        ...this.requestBase,
        sha,
        state,
        description,
        context: 'CodeCoach',
      });
    } catch (err) {
      if (err.name === 'HttpError') {
        Log.error(
          'NotFound: Could be repository does not exist or token does not have permission to repository',
        );
      }
      throw err;
    }
  }

  async files(): Promise<string[]> {
    const { data: files } = await this.adapter.pulls.listFiles({
      ...this.requestBase,
      pull_number: this.pr,
    });

    return files.map((file) => file.filename);
  }
}
