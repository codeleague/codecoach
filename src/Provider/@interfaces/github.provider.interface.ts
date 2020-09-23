import { Octokit } from '@octokit/core';
import {
  IssuesListCommentsResponseData,
  PullsListReviewCommentsResponseData,
} from '@octokit/types';
import { IssuesType } from '../../Report/@types/issues.type';
import ProviderInterface from './provider.interface';
import LogSeverity from '../../Parser/@enums/log.severity.enum';
import ReportType from '../../Report/@types/report.type';

interface GithubProviderInterface extends ProviderInterface<Octokit> {
  clone(): Promise<void>;
  listAllPageComments(
    owner: string,
    repo: string,
    prId: number,
  ): Promise<IssuesListCommentsResponseData>;
  listAllReviewComments(): Promise<PullsListReviewCommentsResponseData>;
  updateComment(owner: string, repo: string, prId: number): Promise<void>;
  listTouchedFiles(): Promise<string[]>;
  getIssueOnTouchedFiles(data: IssuesType, touchedFiles: string[]): IssuesType;
  getNoLineIssues(data: IssuesType): IssuesType;
  getComment(msg: string, severity: LogSeverity): string;
  createCommentForEachFile(
    data: IssuesType,
    severity: LogSeverity,
    commit_id: string,
  ): Promise<void>;
  report({
    overviewMsg,
    error: errors,
    warning: warnings,
    info: infos,
  }: ReportType): Promise<void>;
}

export default GithubProviderInterface;
