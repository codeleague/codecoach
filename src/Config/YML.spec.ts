import { ConfigArgument } from './@types';
import { YML } from './YML';

describe('YML Test', () => {
  it('Should able to validate yaml file correctly', async () => {
    expect(true).toBe(true);
    const config = await YML.parse<ConfigArgument>('sample/config/config.yaml');
    expect(config.output).toBe('/path/to/codecoach/output.json');
  });
});
