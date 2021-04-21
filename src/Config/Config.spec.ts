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

const MOCK_ARGS_W_CONFIG_YAML = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  '--config=sample/config/config.yml',
];

export const EXPECTED_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://github.com/codeleague/codecoach.git',
  'removeOldComment',
  'placeyourtokenhere',
  15,
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];

describe('Config Test', () => {
  let config: typeof Config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('Should able to parse this args correctly', async () => {
    process.argv = MOCK_ARGS;
    config = (await import('./Config')).Config;
    expect(config.provider.repoUrl).toBe(EXPECTED_MOCK_ARGS[2]);
  });

  it('Should able to use a config file without passing other args', async () => {
    process.argv = MOCK_ARGS_W_CONFIG_YAML;
    config = (await import('./Config')).Config;
    console.log(config);
  });
});
