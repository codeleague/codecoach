import { OctokitResponse, PullsListFilesResponseData } from '@octokit/types';
import nock from 'nock';
import { IssuesType } from '../Report/@types/issues.type';
import { GithubProvider } from './Github.provider';
import LogSeverity from '../Parser/@enums/log.severity.enum';
import { ProviderConfig } from '../Config/@types';

const BASE_URL = 'https://api.github.com';

const CONFIG_PROVIDER: ProviderConfig = {
  repoUrl: 'https://github.com/codeleague/codecoach.git',
  token: ' ',
  prId: 9,
  userAgent: '',
  timeZone: '',
  gitCloneBypass: false,
};

describe('GitHub Provider', () => {
  let githubProvider: GithubProvider;

  beforeEach(() => {
    githubProvider = new GithubProvider(CONFIG_PROVIDER);
    nock(BASE_URL)
      .get(() => true)
      .reply(400);
    nock(BASE_URL)
      .post(() => true)
      .reply(400);
    nock(BASE_URL)
      .put(() => true)
      .reply(400);
    nock(BASE_URL)
      .delete(() => true)
      .reply(400);
  });

  it('should be defined', () => {
    expect(githubProvider).toBeDefined();
  });

  it('listTouchedFiles should return list of name of touched files', async () => {
    const mockTouchedFiles = ['file1.cs', 'file2.cs'];
    const mockListFiles: OctokitResponse<PullsListFilesResponseData> = {
      headers: { header: 'test header' },
      status: 200,
      url: 'test url',
      data: mockTouchedFiles.map((filename) => ({
        sha: '',
        filename: filename,
        status: '',
        additions: 0,
        deletions: 0,
        changes: 0,
        blob_url: '',
        raw_url: '',
        contents_url: '',
        patch: '',
      })),
    };
    jest
      .spyOn(githubProvider.adapter.pulls, 'listFiles')
      .mockResolvedValue(mockListFiles);

    const touchedFiles = await githubProvider.listTouchedFiles();
    expect(touchedFiles.length).toBe(2);
    expect(touchedFiles).toStrictEqual(mockTouchedFiles);
  });

  it('getIssueOnTouchedFiles should return filtered Issues when the issue files are in the list of touched files', async () => {
    const mockIssues: IssuesType = {
      n: 2,
      issues: [
        {
          msg: '',
          severity: LogSeverity.error,
          source: 'file1.cs',
          line: 1,
          lineOffset: 0,
        },
        {
          msg: '',
          severity: LogSeverity.warning,
          source: 'file2.cs',
          line: 2,
          lineOffset: 3,
        },
      ],
    };
    const mockTouchedFiles = ['file1.cs'];
    const filteredIssues = await githubProvider.filterIssuesByTouchedFiles(
      mockIssues,
      mockTouchedFiles,
    );
    expect(filteredIssues.issues.length).toBe(1);
    expect(filteredIssues.n).toBe(1);
  });

  it('getIssueOnTouchedFiles should return empty list when no issue files in common in the list of touched files', async () => {
    const mockIssues: IssuesType = {
      n: 2,
      issues: [
        {
          msg: '',
          severity: LogSeverity.error,
          source: 'file1.cs',
          line: 1,
          lineOffset: 0,
        },
        {
          msg: '',
          severity: LogSeverity.warning,
          source: 'file2.cs',
          line: 2,
          lineOffset: 3,
        },
      ],
    };
    const mockTouchedFiles: string[] = [];
    const filteredIssues = githubProvider.filterIssuesByTouchedFiles(
      mockIssues,
      mockTouchedFiles,
    );
    expect(filteredIssues.issues.length).toBe(0);
    expect(filteredIssues.n).toBe(0);
  });

  it('getTouchedIssuesBySeverityMap should return number of touched issues by severity correctly', async () => {
    const mockTouchedFiles: string[] = ['file1.cs'];
    const mockErrorIssues: IssuesType = {
      n: 2,
      issues: [
        {
          msg: '',
          severity: LogSeverity.error,
          source: 'file1.cs',
          line: 1,
          lineOffset: 0,
        },
        {
          msg: '',
          severity: LogSeverity.error,
          source: 'file2.cs',
          line: 2,
          lineOffset: 3,
        },
      ],
    };
    const mockWarningIssues: IssuesType = {
      n: 2,
      issues: [
        {
          msg: '',
          severity: LogSeverity.warning,
          source: 'file2.cs',
          line: 1,
          lineOffset: 0,
        },
        {
          msg: '',
          severity: LogSeverity.warning,
          source: 'file2.cs',
          line: 2,
          lineOffset: 3,
        },
      ],
    };
    const touchedIssuesBySeverityMap = githubProvider.getTouchedIssuesBySeverityMap(
      mockTouchedFiles,
      mockErrorIssues,
      mockWarningIssues,
    );
    expect(touchedIssuesBySeverityMap.error.n).toBe(1);
    expect(touchedIssuesBySeverityMap.warning.n).toBe(0);
  });
});
