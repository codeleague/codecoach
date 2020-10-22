import { Octokit } from '@octokit/rest';
import {
  IssuesListCommentsResponseData,
  PullsGetResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import { URL } from 'url';
import { GITHUB_COM_API } from '../app.constants';
import { ProviderConfig } from '../Config/@types';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import IssueType from '../Report/@types/Issue.type';
import { IssuesType } from '../Report/@types/issues.type';
import ReportType from '../Report/@types/report.type';
import CommitStatusState from './@enums/CommitStatusState';
import GithubProviderInterface from './@interfaces/github.provider.interface';
import { GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE } from './constants/github.provider.constant';
import { MessageUtil } from './utils/message.util';

export class GithubProvider implements GithubProviderInterface {
  owner: string;
  repo: string;
  adapter: Octokit;
  config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;

    const repoUrl = new URL(config.repoUrl);
    this.setRepoParam(repoUrl);
    this.adapter = new Octokit({
      auth: config.token,
      userAgent: config.userAgent,
      timeZone: config.timeZone,
      baseUrl: GithubProvider.getGitHubBase(repoUrl),
    });
  }

  private static getGitHubBase(repo: URL): string {
    return repo.hostname === 'github.com'
      ? GITHUB_COM_API
      : new URL('api/v3', repo.origin).toString();
  }

  private setRepoParam(repoUrl: URL): void {
    const [, owner, repo] = repoUrl.pathname.replace(/\.git/gi, '').split('/');
    this.owner = owner;
    this.repo = repo;
  }

  async listAllPageComments(
    owner: string,
    repo: string,
    prId: number,
  ): Promise<IssuesListCommentsResponseData> {
    const { headers, data: firstPageComments } = await this.adapter.issues.listComments({
      owner,
      repo,
      issue_number: prId,
      per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
    });
    if (!headers.link) {
      return firstPageComments;
    }
    const getLastPageNumberRegex = /.*page=(\d+)>; rel="last"/;
    const extract = headers.link.match(getLastPageNumberRegex);
    if (!extract) {
      console.warn();
      throw new Error(`Github.provider Error: ${headers.link}`);
    }
    const [, lastPageNumber] = extract;

    const FIRST_PAGE_OFFSET = 1;
    const QUERY_PAGE_OFFSET = 2;
    const listCommentHelper = Array(Number(lastPageNumber) - FIRST_PAGE_OFFSET)
      .fill(undefined)
      .map((_, i) => {
        const pageIndex = i + QUERY_PAGE_OFFSET;
        return this.adapter.issues.listComments({
          owner,
          repo,
          issue_number: prId,
          per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
          page: pageIndex,
        });
      });
    const listCommentQuery = (await Promise.all(listCommentHelper)).flatMap(
      (el) => el.data,
    );
    return [...firstPageComments, ...listCommentQuery];
  }

  async listAllReviewComments(): Promise<PullsListReviewCommentsResponseData> {
    const { prId } = this.config;
    const { owner, repo } = this;
    const response = await this.adapter.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prId,
      per_page: GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
    });
    return response.data;
  }

  async updateComment(owner: string, repo: string, prId: number): Promise<void> {
    const response = await this.adapter.users.getAuthenticated();
    const user = response.data;
    const issueReviewsId = (await this.listAllPageComments(owner, repo, prId))
      .filter((review) => review.user.id === user.id)
      .map((review) => review.id);

    const updateIssueCommentsHelper = issueReviewsId.map((comment_id) =>
      this.adapter.issues.deleteComment({
        owner,
        repo,
        comment_id,
      }),
    );

    const reviewComments = (await this.listAllReviewComments())
      .filter((review) => review.user.id === user.id)
      .map((review) => review.id);

    const updateReviewCommentsHelper = reviewComments.map((comment_id) =>
      this.adapter.pulls.deleteReviewComment({
        owner,
        repo,
        comment_id,
      }),
    );

    await Promise.all([...updateIssueCommentsHelper, ...updateReviewCommentsHelper]);
    return;
  }

  async listTouchedFiles(): Promise<string[]> {
    const { prId } = this.config;
    const { owner, repo } = this;

    const { data: touchedFiles } = await this.adapter.pulls.listFiles({
      owner,
      repo,
      pull_number: prId,
    });
    return touchedFiles.map((t) => t.filename);
  }

  filterIssuesByTouchedFiles(data: IssuesType, touchedFiles: string[]): IssuesType {
    const issueOnTouchedFiles = data.issues.filter((issue: IssueType) =>
      touchedFiles.includes(issue.source),
    );
    return {
      issues: issueOnTouchedFiles,
      n: issueOnTouchedFiles.length,
    };
  }

  async createCommentForEachFile(
    data: IssuesType,
    severity: LogSeverity,
    commit_id: string,
  ): Promise<void> {
    const { owner, repo } = this;
    const { prId } = this.config;
    try {
      await Promise.all(
        data.issues.map(async (issue: IssueType) => {
          if (issue.line) {
            await this.adapter.pulls.createReviewComment({
              mediaType: {
                previews: ['comfort-fade'],
              },
              owner,
              repo,
              pull_number: prId,
              body: MessageUtil.createMessageWithEmoji(issue.msg, severity),
              commit_id: commit_id,
              path: issue.source,
              line: issue.line,
              side: 'RIGHT',
            });
          } else {
            await this.adapter.pulls.createReviewComment({
              owner,
              repo,
              pull_number: prId,
              body: MessageUtil.createMessageWithEmoji(issue.msg, severity),
              commit_id: commit_id,
              path: issue.source,
              position: 1,
            });
          }
        }),
      );
    } catch (err) {
      console.trace(err);
      throw Error(err);
    }
  }

  private generateOverviewMessage(nOfErrors: number, nOfWarnings: number): string {
    const errorOverview = MessageUtil.createMessageWithEmoji(
      `${nOfErrors} error(s)`,
      LogSeverity.error,
    );
    const warningOverview = MessageUtil.createMessageWithEmoji(
      `${nOfWarnings} warning(s)`,
      LogSeverity.warning,
    );
    return `CodeCoach reports ${nOfErrors + nOfWarnings} issue(s)
${errorOverview}
${warningOverview}
    `;
  }

  getTouchedIssuesBySeverityMap(
    touchedFiles: string[],
    error: IssuesType,
    warning: IssuesType,
  ): {
    [LogSeverity.error]: IssuesType;
    [LogSeverity.warning]: IssuesType;
  } {
    return {
      [LogSeverity.error]: this.filterIssuesByTouchedFiles(error, touchedFiles),
      [LogSeverity.warning]: this.filterIssuesByTouchedFiles(warning, touchedFiles),
    };
  }

  async report({
    overviewMsg,
    error: errors,
    warning: warnings,
  }: ReportType): Promise<void> {
    try {
      const { prId } = this.config;
      const { owner, repo } = this;

      await this.updateComment(owner, repo, prId);
      const {
        data: pullRequestDetail,
      }: { data: PullsGetResponseData } = await this.adapter.pulls.get({
        owner,
        repo,
        pull_number: prId,
      });

      const touchedIssuesBySeverity = this.getTouchedIssuesBySeverityMap(
        await this.listTouchedFiles(),
        errors,
        warnings,
      );
      if (
        touchedIssuesBySeverity.error.n !== 0 ||
        touchedIssuesBySeverity.warning.n !== 0
      ) {
        const severities = [LogSeverity.error, LogSeverity.warning];

        for (const severity of severities) {
          if (severity !== LogSeverity.unknown) {
            await this.createCommentForEachFile(
              touchedIssuesBySeverity[severity],
              severity,
              pullRequestDetail.head.sha,
            );
          }
        }

        await this.adapter.issues.createComment({
          owner,
          repo,
          issue_number: prId,
          body: this.generateOverviewMessage(
            touchedIssuesBySeverity.error.n,
            touchedIssuesBySeverity.warning.n,
          ),
        });
      }
    } catch (err) {
      throw Error(err);
    }
  }
}
