import envEnum from './@enums/env.enum';
import {
  validateConfig,
  buildAppConfig,
  buildProviderConfig,
  buildAgentConfig,
} from './Config';

const invalidEnv = {
  PROVIDER: 'GitHub',
  PROVIDER_OWNER: 'codeleague',
  PROVIDER_TOKEN: '',
  PROVIDER_REPO: 'codecoach',
  PROVIDER_PR_NUMBER: '9',
  AGENT_PATH: 'dotnet',
  AGENT_PROJECT_TARGET: 'tmp/repo/sample/csharp/broken.csproj',
};

const validEnv = {
  LOG_FILE: 'dotnetbuild.json',
  WARN_FILE: 'dotnetbuild.wrn',
  ERR_FILE: 'dotnetbuild.err',
  PROVIDER: 'GitHub',
  PROVIDER_OWNER: 'codeleague',
  PROVIDER_TOKEN: '14caf0652275c36160bbfa62347d785212a31b37',
  PROVIDER_REPO: 'codecoach',
  PROVIDER_PR_NUMBER: '9',
  AGENT_PATH: 'dotnet',
  AGENT_PROJECT_TARGET: 'tmp/repo/sample/csharp/broken.csproj',
  AGENT_BUILD_BYPASS: 'true',
};

describe('Config', () => {
  describe('validate', () => {
    it('should return true for valid configs', () => {
      expect(validateConfig(validEnv)).toBeTruthy();
    });

    it('should return false for invalid configs', () => {
      expect(validateConfig(invalidEnv)).toBeFalsy();
    });

    it('should ignore specified keys', () => {
      const IGNORE_KEY: envEnum[] = [envEnum.PROVIDER_TOKEN];
      expect(validateConfig(invalidEnv, IGNORE_KEY)).toBeTruthy();
    });
  });

  describe('buildProviderConfig', () => {
    it('should parse valid configs correctly', () => {
      const providerConfig = buildProviderConfig(validEnv);
      expect(providerConfig.prId).toBe(9);
    });

    it('should parse invalid configs', () => {
      const providerConfig = buildProviderConfig(invalidEnv);
      expect(providerConfig.token).toBe('');
    });
  });

  describe('buildAgentConfig', () => {
    it('should parse valid configs correctly', () => {
      const agentConfig = buildAgentConfig(validEnv);
      expect(agentConfig.buildBypass).toBeTruthy();
    });
  });

  describe('buildAppConfig', () => {
    it('should parse valid configs correctly', () => {
      const appConfig = buildAppConfig(validEnv);
      expect(appConfig.warnFilePath).toBe(validEnv.WARN_FILE);
      expect(appConfig.errFilePath).toBe(validEnv.ERR_FILE);
      expect(appConfig.logFilePath).toBe(validEnv.LOG_FILE);
    });

    it('should parse invalid configs', () => {
      const appConfig = buildAppConfig(invalidEnv);
      expect(Object.keys(appConfig).length).toBe(3);
    });
  });
});
