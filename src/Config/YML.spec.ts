import { YML } from './YML';

describe('YML Test', () => {
  it('Should able to validate yaml file correctly', async () => {
    const config = await YML.parse('sample/config/config-github.yaml');
    expect(config.output).toBe('./output.json');
    expect(config.repo.pr).toBe(40);
    expect(config.repo.removeOldComment).toBe(false);
  });

  it('Should able to validate yaml file correctly', async () => {
    const config = await YML.parse('sample/config/config-gitlab.yaml');
    expect(config.output).toBe('./output.json');
    expect(config.repo.pr).toBe(40);
    expect(config.repo.gitlabProjectId).toBe('12');
    expect(config.repo.removeOldComment).toBe(false);
  });
});
