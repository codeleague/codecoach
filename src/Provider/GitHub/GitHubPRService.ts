import { Octokit } from '@octokit/rest';
import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
  ResponseHeaders,
} from '@octokit/types';
import { URL } from 'url';

import { GITHUB_COM_API } from '../../app.constants';
import { TIME_ZONE, USER_AGENT } from '../../Config/constants/defaults';
import { Log } from '../../Logger';
import { API_PAGE_SIZE_LIMIT } from '../constants/github.provider.constant';
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
    const reviews: PullsListReviewCommentsResponseData = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const { headers, data } = await this.adapter.pulls.listReviewComments({
        ...this.requestBase,
        pull_number: this.pr,
        per_page: API_PAGE_SIZE_LIMIT,
        page: ++page,
      });

      reviews.push(...data);
      hasNext = GitHubPRService.hasNext(headers);
    }

    Log.debug(`Loaded ${page} pages of reviews`);

    return reviews;
  }

  async listAllComments(): Promise<IssuesListCommentsResponseData> {
    const comments: IssuesListCommentsResponseData = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const { headers, data } = await this.adapter.issues.listComments({
        ...this.requestBase,
        issue_number: this.pr,
        per_page: API_PAGE_SIZE_LIMIT,
        page: ++page,
      });

      comments.push(...data);
      hasNext = GitHubPRService.hasNext(headers);
    }

    Log.debug(`Loaded ${page} pages of comments`);

    return comments;
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
    const files: string[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const { headers, data } = await this.adapter.pulls.listFiles({
        ...this.requestBase,
        pull_number: this.pr,
        per_page: API_PAGE_SIZE_LIMIT,
        page: ++page,
      });

      files.push(...data.map((d) => d.filename));
      hasNext = GitHubPRService.hasNext(headers);
    }

    Log.debug(`Loaded ${page} pages of PR file list`);

    return files;
  }

  private static hasNext(headers: ResponseHeaders): boolean {
    const { link } = headers;
    return (
      link
        ?.split(', ')
        .map((l) => l.match(/rel="(.+)"/)?.[1])
        .some((rel) => rel === 'next') ?? false
    );
  }

  private static getApiBase(repo: URL): string {
    return repo.hostname === 'github.com'
      ? GITHUB_COM_API
      : new URL('api/v3', repo.origin).toString();
  }
}
