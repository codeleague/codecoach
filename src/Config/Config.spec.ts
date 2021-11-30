import { Config } from './Config';

const MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--url=https://github.com/codeleague/codecoach.git',
  '--removeOldComment',
  '--token=placeyourtokenhere',
  '--pr=15',
  '-f=dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  '-o=./tmp/out.json',
];

const MOCK_ARGS_FOR_GITLAB = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--url=https://gitlab.com/codeleague/codecoach.git',
  '--removeOldComment',
  '--token=placeyourtokenhere',
  '--pr=15',
  '--gitlabProjectId=12',
  '-f=dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  '-o=./tmp/out.json',
];

const MOCK_ARGS_W_CONFIG_YAML_FOR_GITHUB = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--config=sample/config/config-github.yaml',
];

const MOCK_ARGS_W_CONFIG_YAML_FOR_GITLAB = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--config=sample/config/config-gitlab.yaml',
];

export const EXPECTED_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://github.com/codeleague/codecoach.git',
  true,
  'placeyourtokenhere',
  15,
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];

export const EXPECTED_MOCK_ARGS_FOR_GITLAB = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://gitlab.com/codeleague/codecoach.git',
  true,
  'placeyourtokenhere',
  15,
  '12',
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];
describe('Config Test', () => {
  let config: typeof Config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('Should able to parse this args and run without throwing error', async () => {
    process.argv = MOCK_ARGS;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.provider.repoUrl).toBe(EXPECTED_MOCK_ARGS[2]);
    expect(fullfillConfig.provider.removeOldComment).toBe(EXPECTED_MOCK_ARGS[3]);
  });

  it('Should able to use a config file without passing other args', async () => {
    process.argv = MOCK_ARGS_W_CONFIG_YAML_FOR_GITHUB;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.app.buildLogFiles[0].type).toBe('tslint');
  });

  // gitlab args should pass when project id is present
  it('Should able to parse this args and run without throwing error', async () => {
    process.argv = MOCK_ARGS_FOR_GITLAB;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.provider.repoUrl).toBe(EXPECTED_MOCK_ARGS_FOR_GITLAB[2]);
    expect(fullfillConfig.provider.removeOldComment).toBe(
      EXPECTED_MOCK_ARGS_FOR_GITLAB[3],
    );
    expect(fullfillConfig.provider.gitlabProjectId).toBe(
      EXPECTED_MOCK_ARGS_FOR_GITLAB[6],
    );
  });

  it('Should able to use a config file without passing other args', async () => {
    process.argv = MOCK_ARGS_W_CONFIG_YAML_FOR_GITLAB;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.app.buildLogFiles[0].type).toBe('tslint');
    expect(fullfillConfig.provider.gitlabProjectId).toBe('12');
  });
});
