import { Octokit } from '@octokit/rest';
import {
  IssuesListCommentsResponseData,
  PullsGetResponseData,
  PullsListFilesResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import * as path from 'path';
import { join } from 'path';
import slash from 'slash';
import { Issue, Issues, ReportType } from '../Report/Report';
import { LogSeverity } from '../Parser/Log';
import { Git } from './Git';
import { Provider } from './Provider';
import { ProviderCustomConfigType } from './ProviderCustomConfigType';
import { URL } from 'url';

const MAX_REVIEWS_PER_PAGE = 100;
const PROJECT_ROOT = 'sample/csharp/';
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_REPO_URL = 'https://github.com/';

export class GithubProvider extends Provider {
  adapter: Octokit;
  constructor(config: ProviderCustomConfigType) {
    super(config);
    this.config.provider = 'github';
    this.config.apiUrl = config.apiUrl || GITHUB_API_URL;
    this.config.repoUrl = config.repoUrl || GITHUB_REPO_URL;

    this.adapter = new Octokit({
      auth: this.config.token,
      userAgent: this.config.userAgent,
      timeZone: this.config.timeZone,
      baseUrl: this.config.apiUrl,
    });
  }
  async clone(): Promise<void> {
    try {
      const config = {
        src: new URL(
          join(...[this.config.owner, this.config.repo]),
          this.config.repoUrl,
        ).toString(),
        prId: this.config.prId,
        dest: './tmp',
      };
      const git = new Git(config);
      await git.clone();
    } catch (err) {
      throw new Error(err);
    }
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
      per_page: MAX_REVIEWS_PER_PAGE,
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
          per_page: MAX_REVIEWS_PER_PAGE,
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
      per_page: MAX_REVIEWS_PER_PAGE,
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

  private templatePerFileComment(
    source: string,
    serverity: string,
    msg: string,
    line?: number,
    lineOffset?: number,
  ): string {
    if (line && lineOffset) {
      return `${source}: ${serverity} ${msg}`;
    } else {
      return `${source}: (${line}, ${lineOffset}) ${serverity} ${msg}`;
    }
  }

  private perFileComment(data: Issues): string[] {
    return data.issues.map((e) =>
      this.templatePerFileComment(e.source, e.severity, e.msg, e.line, e.lineOffset),
    );
  }

  async listTouchedFiles(): Promise<string[]> {
    // const await
    const { owner, repo, prId } = this.config;
    const {
      data: touchedFiles,
    }: { data: PullsListFilesResponseData } = await this.adapter.pulls.listFiles({
      owner,
      repo,
      pull_number: prId,
    });
    return touchedFiles.map((t) => t.filename);
  }
  getIssueOnTouchedFiles(data: Issues, touchedFiles: string[]): Issues {
    const issueOnTouchedFiles = data.issues.filter((issue: Issue) =>
      touchedFiles.includes(issue.source),
    );
    return {
      issues: issueOnTouchedFiles,
      n: issueOnTouchedFiles.length,
    };
  }
  getNoLineIssues(data: Issues): Issues {
    const noLine = data.issues.filter((issue: Issue) => issue.line === null);
    return {
      issues: noLine,
      n: noLine.length,
    };
  }
  getComment(msg: string, severity: LogSeverity): string {
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
    data: Issues,
    severity: LogSeverity,
    commit_id: string,
  ): Promise<void> {
    const { owner, repo, prId } = this.config;
    await Promise.all(
      data.issues.map(async (issue: Issue) => {
        if (issue.line) {
          await this.adapter.pulls.createReviewComment({
            owner,
            repo,
            pull_number: prId,
            body: this.getComment(issue.msg, severity),
            commit_id: commit_id,
            path: slash(path.join(PROJECT_ROOT, issue.source)),
            line: issue.line,
            side: 'RIGHT',
          });
        } else {
          await this.adapter.pulls.createReviewComment({
            owner,
            repo,
            pull_number: prId,
            body: this.getComment(issue.msg, severity),
            commit_id: commit_id,
            path: slash(path.join(PROJECT_ROOT, issue.source)),
            position: 1,
          });
        }
      }),
    );
  }
  private generateOverviewMessage(
    nOfErrors: number,
    nOfWarnings: number,
    nOfInfos: number,
  ): string {
    const errorOverview = this.getComment(`${nOfErrors} error(s)`, LogSeverity.error);
    const warningOverview = this.getComment(
      `${nOfWarnings} warning(s)`,
      LogSeverity.warning,
    );
    const infoOverview = this.getComment(`${nOfInfos} info(s)`, LogSeverity.info);
    return `CodeCoach reports ${nOfErrors + nOfWarnings + nOfInfos} issue(s)
${errorOverview}
${warningOverview}
${infoOverview}
    `;
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

      const touchedFiles = (await this.listTouchedFiles())
        .filter((src: string) => src.startsWith(PROJECT_ROOT))
        .map((src: string) => src.replace(PROJECT_ROOT, ''));

      const groupTouchedFiles = [
        {
          issues: this.getIssueOnTouchedFiles(errors, touchedFiles),
          severity: LogSeverity.error,
        },
        {
          issues: this.getIssueOnTouchedFiles(warnings, touchedFiles),
          severity: LogSeverity.warning,
        },
        {
          issues: this.getIssueOnTouchedFiles(infos, touchedFiles),
          severity: LogSeverity.info,
        },
      ];
      for await (const el of groupTouchedFiles) {
        const { issues, severity } = el;
        const filteredIssues = this.getIssueOnTouchedFiles(issues, touchedFiles);
        await this.createCommentForEachFile(
          filteredIssues,
          severity,
          pullRequestDetail.head.sha,
        );
      }

      const [
        errorsOnTouchedFiles,
        warningsOnTouchedFiles,
        infosOnTouchedFiles,
      ] = groupTouchedFiles;

      await this.adapter.issues.createComment({
        owner,
        repo,
        issue_number: prId,
        body: this.generateOverviewMessage(
          errorsOnTouchedFiles.issues.n,
          warningsOnTouchedFiles.issues.n,
          infosOnTouchedFiles.issues.n,
        ),
      });
    } catch (err) {
      throw Error(err);
    }
  }
}
