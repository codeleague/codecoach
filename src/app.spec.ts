import { App } from './app';
import CodeCoachError from './CodeCoachError';
import { ConfigArgument } from './Config';
import { File } from './File';
import { VCSEngine } from './Provider/CommonVCS/VCSEngine';
import { GitLabAdapter } from './Provider/GitLab/GitLabAdapter';
import { GitLabMRService } from './Provider/GitLab/GitLabMRService';
import { GitHubAdapter } from './Provider/GitHub/GitHubAdapter';
import { GitHubPRService } from './Provider/GitHub/GitHubPRService';

jest.mock('./File');
jest.mock('./Provider/CommonVCS/VCSEngine');
jest.mock('./Provider/GitLab/GitLabAdapter');
jest.mock('./Provider/GitLab/GitLabMRService');
jest.mock('./Provider/GitHub/GitHubAdapter');
jest.mock('./Provider/GitHub/GitHubPRService');

const mockedVCSEngine = VCSEngine as jest.MockedClass<typeof VCSEngine>;
const mockedGitLabAdapter = GitLabAdapter as jest.MockedClass<typeof GitLabAdapter>;
const mockedGitLabMRService = GitLabMRService as jest.MockedClass<typeof GitLabMRService>;
const mockedGitHubAdapter = GitHubAdapter as jest.MockedClass<typeof GitHubAdapter>;
const mockedGitHubPRService = GitHubPRService as jest.MockedClass<typeof GitHubPRService>;

describe('App', () => {
  it('should not require VCS when dry-run', async () => {
    const mockedWriteFileHelper = jest.fn();
    File.writeFileHelper = mockedWriteFileHelper;

    const configs = ({ buildLogFile: [], dryRun: true } as unknown) as ConfigArgument;
    const app = new App(configs);
    await app.start();

    expect(mockedWriteFileHelper).toBeCalled();
  });

  it('should throw "VCS adapter is not found" error when run without VCS', async () => {
    const app = new App(({ buildLogFile: [] } as unknown) as ConfigArgument);
    const fn = async () => await app.start();

    await expect(fn).rejects.toThrowError(CodeCoachError);
    await expect(fn).rejects.toThrowError('VCS adapter is not found');
  });

  it('should initialize GitLabAdapter and GitLabMRService correctly', async () => {
    const vcsReportFn = jest.fn().mockResolvedValue(true);
    mockedVCSEngine.mockImplementationOnce(() => {
      return ({
        report: vcsReportFn,
      } as unknown) as VCSEngine;
    });

    const configs = ({
      vcs: 'gitlab',
      gitlabHost: 'https://gitlab.com',
      gitlabProjectId: 1234,
      gitlabMrIid: 99,
      gitlabToken: 'fakegitlabtoken',
      buildLogFile: [],
    } as unknown) as ConfigArgument;

    const app = new App(configs);
    await app.start();

    expect(vcsReportFn).toBeCalledTimes(1);
    expect(mockedGitLabMRService).toBeCalledWith(
      configs.gitlabHost,
      configs.gitlabProjectId,
      configs.gitlabMrIid,
      configs.gitlabToken,
    );
    expect(mockedGitLabAdapter).toBeCalledTimes(1);
  });

  it('should initialize GitHubAdapter and GitHubPRService correctly', async () => {
    const vcsReportFn = jest.fn().mockResolvedValue(true);
    mockedVCSEngine.mockImplementationOnce(() => {
      return ({
        report: vcsReportFn,
      } as unknown) as VCSEngine;
    });

    const configs = ({
      vcs: 'github',
      githubRepoUrl: 'https://github.com/codeleague/codecoach',
      githubPr: 1234,
      githubToken: 'fakegithubtoken',
      buildLogFile: [],
    } as unknown) as ConfigArgument;

    const app = new App(configs);
    await app.start();

    expect(vcsReportFn).toBeCalledTimes(1);
    expect(mockedGitHubPRService).toBeCalledWith(
      configs.githubToken,
      configs.githubRepoUrl,
      configs.githubPr,
    );
    expect(mockedGitHubAdapter).toBeCalledTimes(1);
  });
});
