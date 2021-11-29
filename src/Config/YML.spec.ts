import { DataConfigYAML, PrConfigYAML } from '.';
import { COMMAND } from './@enums';
import { YML } from './YML';

describe('PR YML Test', () => {
  it('Should able to validate yaml file correctly', async () => {
    const config = (await YML.parse(
      'sample/config/config.yaml',
      COMMAND.DEFAULT,
    )) as PrConfigYAML;
    expect(config.output).toBe('./output.json');
    expect(config.repo.pr).toBe(40);
    expect(config.repo.removeOldComment).toBe(false);
  });
});

describe('Data YML Test', () => {
  it('Should able to validate yaml file correctly', async () => {
    const config = (await YML.parse(
      'sample/config/data-config.yaml',
      COMMAND.COLLECT,
    )) as DataConfigYAML;
    expect(config.output).toBe('./output.json');
    expect(config.repo.runId).toBe(40);
    expect(config.repo.headCommit).toBe('123qwe123qwe123qwe123qwe123qwe123qwe123q');
  });
});
