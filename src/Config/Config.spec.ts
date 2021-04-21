import { Config } from './Config';
import { EXPECTED_MOCK_ARGS } from '../../jest.setup';

describe('Config Test', () => {
  it('Should able to parse this args correctly', () => {
    const args = Config;
    expect(args.provider.repoUrl).toBe(EXPECTED_MOCK_ARGS[2]);
  });
});
