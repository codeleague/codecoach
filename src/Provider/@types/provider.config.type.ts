type ProviderConfigType = {
  token: string;
  owner: string;
  repo: string;
  repoUrl: string;
  baseUrl: string;
  prId: number;
  workDir: string;
  userAgent: string;
  timeZone: string;
  gitCloneBypass: boolean;
};

export default ProviderConfigType;
