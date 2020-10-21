import { validateEnvConfig } from './configBuilder';

const invalidEnv = {
  PROVIDER: '',
  AGENT_PATH: '',
  AGENT_PROJECT_TARGET: 'tmp/repo/sample/csharp/broken.csproj',
};

const validEnv = {
  PROVIDER: 'GitHub',
  AGENT_PATH: 'dotnet',
  AGENT_PROJECT_TARGET: 'tmp/repo/sample/csharp/broken.csproj',
};

describe('configBuilder', () => {
  describe('validateEnvConfig', () => {
    it('should return true for valid configs', () => {
      expect(validateEnvConfig(validEnv)).toBeTruthy();
    });

    it('should return false for invalid configs', () => {
      expect(validateEnvConfig(invalidEnv)).toBeFalsy();
    });
  });
});
