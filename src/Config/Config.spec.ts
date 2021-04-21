import { Config } from './Config';

describe('Config Test', () => {
  it('Should able to parse this args correctly', () => {
    const args = Config;
    expect(args.provider.repoUrl).toBe('https://github.com/codeleague/codecoach.git');
  });
});
