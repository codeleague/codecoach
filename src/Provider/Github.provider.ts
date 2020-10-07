import { Octokit } from '@octokit/rest';
import {
  IssuesListCommentsResponseData,
  PullsGetResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import IssueType from '../Report/@types/Issue.type';
import { IssuesType } from '../Report/@types/issues.type';
import ReportType from '../Report/@types/report.type';
import GithubProviderInterface from './@interfaces/github.provider.interface';
import ProviderInternalConfig from './@types/providerInternalConfig';
import { ProviderConfig } from '../Config/@types';
import {
  GITHUB_API_URL,
  GITHUB_PROVIDER_MAX_REVIEWS_PER_PAGE,
  GITHUB_REPO_URL,
} from './constants/github.provider.constant';
import { TIME_ZONE, USER_AGENT, WORK_DIR } from './constants/provider.constant';

export class GithubProvider implements GithubProviderInterface {
  adapter: Octokit;
  config: ProviderInternalConfig;

  constructor(config: ProviderConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || GITHUB_API_URL, // for api
      repoUrl: config.repoUrl || GITHUB_REPO_URL, // for clone
      workDir: config.workDir || WORK_DIR,
      userAgent: config.userAgent || USER_AGENT,
      timeZone: config.timeZone || TIME_ZONE,
      gitCloneBypass: config.gitCloneBypass || false, // for git
    };

    this.adapter = new Octokit({
      auth: this.config.token,
      userAgent: this.config.userAgent,
      timeZone: this.config.timeZone,
      baseUrl: this.config.baseUrl,
    });
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
    const { owner, repo, prId } = this.config;
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
    const { owner, repo, prId } = this.config;
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

  createMessageWithEmoji(msg: string, severity: LogSeverity): string {
    let emoji = '';
    switch (severity) {
      case LogSeverity.error:
        emoji = ':rotating_light:';
        break;
      case LogSeverity.warning:
        emoji = ':warning:';
        break;
      case LogSeverity.info:
        emoji = ':information_source:';
        break;
    }
    return `${emoji} ${msg}`;
  }

  async createCommentForEachFile(
    data: IssuesType,
    severity: LogSeverity,
    commit_id: string,
  ): Promise<void> {
    const { owner, repo, prId } = this.config;
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
              body: this.createMessageWithEmoji(issue.msg, severity),
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
              body: this.createMessageWithEmoji(issue.msg, severity),
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

  private generateOverviewMessage(
    nOfErrors: number,
    nOfWarnings: number,
    nOfInfos: number,
  ): string {
    const errorOverview = this.createMessageWithEmoji(
      `${nOfErrors} error(s)`,
      LogSeverity.error,
    );
    const warningOverview = this.createMessageWithEmoji(
      `${nOfWarnings} warning(s)`,
      LogSeverity.warning,
    );
    const infoOverview = this.createMessageWithEmoji(
      `${nOfInfos} info(s)`,
      LogSeverity.info,
    );
    return `CodeCoach reports ${nOfErrors + nOfWarnings + nOfInfos} issue(s)
${errorOverview}
${warningOverview}
${infoOverview}
    `;
  }

  getTouchedIssuesBySeverityMap(
    touchedFiles: string[],
    error: IssuesType,
    warning: IssuesType,
    info: IssuesType,
  ): {
    [LogSeverity.error]: IssuesType;
    [LogSeverity.warning]: IssuesType;
    [LogSeverity.info]: IssuesType;
  } {
    return {
      [LogSeverity.error]: this.filterIssuesByTouchedFiles(error, touchedFiles),
      [LogSeverity.warning]: this.filterIssuesByTouchedFiles(warning, touchedFiles),
      [LogSeverity.info]: this.filterIssuesByTouchedFiles(info, touchedFiles),
    };
  }

  async report({
    overviewMsg,
    error: errors,
    warning: warnings,
    info: infos,
  }: ReportType): Promise<void> {
    try {
      const { owner, repo, prId } = this.config;
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
        infos,
      );

      const severities = [LogSeverity.error, LogSeverity.warning, LogSeverity.info];

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
          touchedIssuesBySeverity.info.n,
        ),
      });
    } catch (err) {
      throw Error(err);
    }
  }
}
