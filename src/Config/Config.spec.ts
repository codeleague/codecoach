import { join } from 'path';
import envEnum from './@enums/env.enum';
import Config from './Config';
const PATH_MOCK_VALID_ENV = 'src/test/env/Config.valid.spec.env';
const PATH_MOCK_INVALID_ENV = 'src/test/env/Config.invalid.spec.env';

describe('Config test', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // most important - it clears the cache
    process.env = { ...OLD_ENV }; // make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old env
  });

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
    const config = new Config({ path: PATH_MOCK_INVALID_ENV, ignoreEnv: IGNORE_KEY });
    expect(config.getProvider().token).toBe('');
    expect(config.getAgent().settings.verbosity).toBe('');
    expect(config.getProvider().prId).toBe(9);
    expect(Object.keys(config.getApp()).length).toBe(4);
    expect(config.getApp().logFilePath).toBe('');
  });

  it('should parsing app env path correctly', () => {
    const config = new Config({ path: PATH_MOCK_VALID_ENV });
    const appConfig = config.getApp();
    const expectWarnFilePath = join(...['/tmp', 'dotnetbuild.wrn']);
    const expectErrorFilePath = join(...['/tmp', 'dotnetbuild.err']);
    const expectLogFilePath = join(...['/tmp', 'dotnetbuild.json']);
    const expectLineSplitter = '\\r\\n';
    expect(appConfig.warnFilePath).toBe(expectWarnFilePath);
    expect(appConfig.errFilePath).toBe(expectErrorFilePath);
    expect(appConfig.logFilePath).toBe(expectLogFilePath);
    expect(appConfig.lineSplitter).toBe(expectLineSplitter);
  });
});
