import { BuildLogFile } from './@types';

const mockGitHubRepo = 'https://github.com/codeleague/codecoach.git';
const mockGitHubPr = 42;
const mockGitHubToken = 'mockGitHubToken';

const mockGitLabHost = 'https://gitlab.myawesomecompany.com';
const mockGitLabProjectId = 1234;
const mockGitLabMrIid = 69;
const mockGitLabToken = 'mockGitLabToken';

const mockLogType = 'dotnetbuild';
const mockLogFile = './sample/dotnetbuild/build.content';
const mockLogCwd = '/repo/src';
const mockBuildLogFile = `${mockLogType};${mockLogFile};${mockLogCwd}`;
const mockOutput = './tmp/out.json';

const GITHUB_ENV_ARGS = [
  'node',
  'app.ts',
  '--vcs="github"',
  `--githubRepoUrl=${mockGitHubRepo}`,
  `--githubPr=${mockGitHubPr}`,
  `--githubToken=${mockGitHubToken}`,
  '--removeOldComment',
  `-f=${mockBuildLogFile}`,
  `-o=${mockOutput}`,
];

const GITHUB_FILE_ARGS = ['node', 'app.ts', '--config=sample/config/github.json'];

const GITLAB_ENV_ARGS = [
  'node',
  'app.ts',
  '--vcs="gitlab"',
  `--gitlabHost=${mockGitLabHost}`,
  `--gitlabProjectId=${mockGitLabProjectId}`,
  `--gitlabMrIid=${mockGitLabMrIid}`,
  `--gitlabToken=${mockGitLabToken}`,
  `-f=${mockBuildLogFile}`,
  `-o=${mockOutput}`,
  '--failOnWarnings',
  '--suppressRules',
  'RULE1',
  'RULE2',
];

const GITLAB_FILE_ARGS = ['node', 'app.ts', '--config=sample/config/gitlab.json'];

const DRYRUN_ENV_ARGS = [
  'node',
  'app.ts',
  `-f=${mockBuildLogFile}`,
  `-o=${mockOutput}`,
  '--dryRun',
];

const DRYRUN_FILE_ARGS = ['node', 'app.ts', '--config=sample/config/dryrun.json'];

describe('Config parsing Test', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const validateBuildLog = (buildLog: BuildLogFile[]) => {
    expect(buildLog).toHaveLength(1);
    expect(buildLog[0].type).toBe(mockLogType);
    expect(buildLog[0].path).toBe(mockLogFile);
    expect(buildLog[0].cwd).toBe(mockLogCwd);
  };

  it('should be able to parse GitHub config provided by environment variables', async () => {
    process.argv = GITHUB_ENV_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.vcs).toBe('github');
    expect(config.githubRepoUrl).toBe(mockGitHubRepo);
    expect(config.githubPr).toBe(mockGitHubPr);
    expect(config.githubToken).toBe(mockGitHubToken);
    expect(config.removeOldComment).toBe(true);
    expect(config.failOnWarnings).toBe(false);
    expect(config.suppressRules).toEqual([]);

    validateBuildLog(config.buildLogFile);
  });

  it('should be able to parse GitHub config provided by file', async () => {
    process.argv = GITHUB_FILE_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.vcs).toBe('github');
    expect(config.githubRepoUrl).toBe(mockGitHubRepo);
    expect(config.githubPr).toBe(mockGitHubPr);
    expect(config.githubToken).toBe(mockGitHubToken);
    expect(config.removeOldComment).toBe(false);
    expect(config.failOnWarnings).toBe(false);
    expect(config.suppressRules).toEqual([]);

    validateBuildLog(config.buildLogFile);
  });

  it('should be able to parse GitLab config provided by environment variables', async () => {
    process.argv = GITLAB_ENV_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.vcs).toBe('gitlab');
    expect(config.gitlabHost).toBe(mockGitLabHost);
    expect(config.gitlabProjectId).toBe(mockGitLabProjectId);
    expect(config.gitlabMrIid).toBe(mockGitLabMrIid);
    expect(config.gitlabToken).toBe(mockGitLabToken);
    expect(config.removeOldComment).toBe(false);
    expect(config.failOnWarnings).toBe(true);
    expect(config.suppressRules).toEqual(['RULE1', 'RULE2']);

    validateBuildLog(config.buildLogFile);
  });

  it('should be able to parse GitLab config provided by file', async () => {
    process.argv = GITLAB_FILE_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.vcs).toBe('gitlab');
    expect(config.gitlabHost).toBe(mockGitLabHost);
    expect(config.gitlabProjectId).toBe(mockGitLabProjectId);
    expect(config.gitlabMrIid).toBe(mockGitLabMrIid);
    expect(config.gitlabToken).toBe(mockGitLabToken);
    expect(config.removeOldComment).toBe(true);
    expect(config.failOnWarnings).toBe(false);
    expect(config.suppressRules).toEqual(['RULE1', 'RULE2']);

    validateBuildLog(config.buildLogFile);
  });

  it('should be able to parse dryRun config provided by environment variables', async () => {
    process.argv = DRYRUN_ENV_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.dryRun).toBe(true);

    validateBuildLog(config.buildLogFile);
  });

  it('should be able to parse dryRun config provided by file', async () => {
    process.argv = DRYRUN_FILE_ARGS;
    const config = (await import('./Config')).configs;
    expect(config.dryRun).toBe(true);

    validateBuildLog(config.buildLogFile);
  });
});
