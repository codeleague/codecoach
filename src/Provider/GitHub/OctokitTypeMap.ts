import { Endpoints } from '@octokit/types';

export type PullsListReviewCommentsResponseData = Endpoints['GET /repos/{owner}/{repo}/pulls/comments']['response']['data'];
export type IssuesListCommentsResponseData = Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}/comments']['response']['data'];
