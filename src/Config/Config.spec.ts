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

export const EXPECTED_MOCK_ARGS = [
  '/usr/local/Cellar/node/15.13.0/bin/node',
  '/Users/codecoach/src/app.ts',
  'https://github.com/codeleague/codecoach.git',
  'removeOldComment',
  'placeyourtokenhere',
  '15',
  'dotnetbuild;./sample/dotnetbuild/build.content;/repo/src',
  './tmp/out.json',
];

describe('Config Test', () => {
  let config: typeof Config;

  beforeEach(async () => {
    process.argv = MOCK_ARGS;
  });

  it('Should able to parse this args correctly', async () => {
    config = (await import('./Config')).Config;
    expect(config.provider.repoUrl).toBe(EXPECTED_MOCK_ARGS[2]);
  });
});
