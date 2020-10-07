type ProviderInternalConfig = {
  token: string;
  owner: string;
  repo: string;
  baseUrl: string;
  repoUrl: string;
  prId: number;
  workDir: string;
  userAgent: string;
  timeZone: string;
  gitCloneBypass: boolean;
};

export default ProviderInternalConfig;
