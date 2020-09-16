import envEnum from './@enums/env.enum';
import Config from './Config';
const PATH_MOCK_VALID_ENV = 'src/test/env/Config.valid.spec.env';
const PATH_MOCK_INVALID_ENV = 'src/test/env/Config.invalid.spec.env';

describe('Config test', () => {
  it('should validate .env format correctly', () => {
    const config = new Config({ path: PATH_MOCK_VALID_ENV });
    const valid = config.validate(config.env, []);
    expect(valid).toBe(true);
  });

  it('should invalid .env format should throw error', () => {
    expect(() => new Config({ path: PATH_MOCK_INVALID_ENV })).toThrowError();
  });

  it('should ignore correctly ignore key', () => {
    const IGNORE_KEY: envEnum[] = [envEnum.PROVIDER_TOKEN, envEnum.AGENT_VERBOSITY];
    new Config({ path: PATH_MOCK_INVALID_ENV, ignoreEnv: IGNORE_KEY });
  });
});
