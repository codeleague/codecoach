import { YML } from './YML';

describe('YML Test', () => {
  it('Should able to validate yaml file correctly', async () => {
    const config = await YML.parse('sample/config/config.yaml');
    expect(config.output).toBe('/path/to/codecoach/output.json');
    expect(config.provider.pr).toBe(40);
    expect(config.provider.removeOldComment).toBe(false);
  });
});
