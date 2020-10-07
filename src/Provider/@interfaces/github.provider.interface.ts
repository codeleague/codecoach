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
  listAllPageComments(
    owner: string,
    repo: string,
    prId: number,
  ): Promise<IssuesListCommentsResponseData>;
  listAllReviewComments(): Promise<PullsListReviewCommentsResponseData>;
  updateComment(owner: string, repo: string, prId: number): Promise<void>;
  listTouchedFiles(): Promise<string[]>;
  filterIssuesByTouchedFiles(data: IssuesType, touchedFiles: string[]): IssuesType;
  createMessageWithEmoji(msg: string, severity: LogSeverity): string;
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
