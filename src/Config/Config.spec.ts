import { DataProviderConfig, PrProviderConfig } from '.';
import { Config } from './Config';

const PR_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--url=https://github.com/codeleague/codecoach.git',
  '--removeOldComment',
  '--token=placeyourtokenhere',
  '--pr=15',
  '-f=dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  '-o=./tmp/out.json',
];

const PR_MOCK_ARGS_W_COMMAND = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'comment',
  '--url=https://github.com/codeleague/codecoach.git',
  '--removeOldComment',
  '--token=placeyourtokenhere',
  '--pr=15',
  '-f=dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  '-o=./tmp/out.json',
];

const PR_MOCK_ARGS_W_CONFIG_YAML = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--config=sample/config/config.yaml',
];

export const PR_EXPECTED_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://github.com/codeleague/codecoach.git',
  true,
  'placeyourtokenhere',
  15,
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];

const DATA_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'collect',
  '--url=https://github.com/codeleague/codecoach.git',
  '-r=3',
  '-c=headCommitsha',
  '-f=dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  '-o=./tmp/out.json',
];

const DATA_MOCK_ARGS_W_CONFIG_YAML = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'collect',
  '--config=sample/config/data-config.yaml',
];

export const DATA_EXPECTED_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://github.com/codeleague/codecoach.git',
  3,
  'headCommitsha',
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];

describe('PR config Test', () => {
  let config: typeof Config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('Should able to parse this args and run without throwing error', async () => {
    process.argv = PR_MOCK_ARGS;
    config = (await import('./Config')).Config;
    let fullfillConfig = (await config).provider as PrProviderConfig;
    expect(fullfillConfig.repoUrl).toBe(PR_EXPECTED_MOCK_ARGS[2]);
    expect(fullfillConfig.removeOldComment).toBe(PR_EXPECTED_MOCK_ARGS[3]);

    process.argv = PR_MOCK_ARGS_W_COMMAND;
    config = (await import('./Config')).Config;
    fullfillConfig = (await config).provider as PrProviderConfig;
    expect(fullfillConfig.repoUrl).toBe(PR_EXPECTED_MOCK_ARGS[2]);
    expect(fullfillConfig.removeOldComment).toBe(PR_EXPECTED_MOCK_ARGS[3]);
  });

  it('Should able to use a config file without passing other args', async () => {
    process.argv = PR_MOCK_ARGS_W_CONFIG_YAML;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.app.buildLogFiles[0].type).toBe('tslint');
  });
});

describe('Data config Test', () => {
  let config: typeof Config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('Should able to parse this args and run without throwing error', async () => {
    process.argv = DATA_MOCK_ARGS;
    config = (await import('./Config')).Config;
    const fullfillConfig = (await config).provider as DataProviderConfig;
    expect(fullfillConfig.repoUrl).toBe(DATA_EXPECTED_MOCK_ARGS[2]);
    expect(fullfillConfig.runId).toBe(DATA_EXPECTED_MOCK_ARGS[3]);
    expect(fullfillConfig.headCommit).toBe(DATA_EXPECTED_MOCK_ARGS[4]);
  });

  it('Should able to use a config file without passing other args', async () => {
    process.argv = DATA_MOCK_ARGS_W_CONFIG_YAML;
    config = (await import('./Config')).Config;
    const fullfillConfig = await config;
    expect(fullfillConfig.app.buildLogFiles[0].type).toBe('tslint');
  });
});
