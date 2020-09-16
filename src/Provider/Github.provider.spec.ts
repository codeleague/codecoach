import { GithubProvider } from './Github.provider';
import { ProviderCustomConfigType } from './ProviderCustomConfigType';
import { Octokit } from '@octokit/rest';
import nock from 'nock';
import { ReportType, Issues } from '../Report/Report';
import { OctokitResponse, PullsListFilesResponseData } from '@octokit/types';
import { LogSeverity } from '../Parser/Log';

const BASE_URL = 'https://api.github.com';

const CONFIG_PROVIDER: ProviderCustomConfigType = {
  owner: 'codeleague',
  repo: 'codecoach',
  token: ' ',
  prId: 9,
};

const MOCK_REPORT: ReportType = {
  overviewMsg: '',
  error: {
    n: 0,
    issues: [],
  },
  warning: {
    n: 0,
    issues: [],
  },
  info: {
    n: 0,
    issues: [],
  },
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

  it('getIssueOnTouchedFiles should return filtered Issues when the issue files in the list of touched files', async () => {
    const mockIssues: Issues = {
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
    const filteredIssues = await githubProvider.getIssueOnTouchedFiles(
      mockIssues,
      mockTouchedFiles,
    );
    expect(filteredIssues.issues.length).toBe(1);
    expect(filteredIssues.n).toBe(1);
  });

  it('getIssueOnTouchedFiles should return empty list when no issue files in common in the list of touched files', async () => {
    const mockIssues: Issues = {
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
    const filteredIssues = await githubProvider.getIssueOnTouchedFiles(
      mockIssues,
      mockTouchedFiles,
    );
    expect(filteredIssues.issues.length).toBe(0);
    expect(filteredIssues.n).toBe(0);
  });
});
