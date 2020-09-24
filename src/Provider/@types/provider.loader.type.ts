type ProviderLoaderType = {
  token: string;
  owner: string;
  repo: string;
  apiUrl?: string;
  repoUrl?: string;
  prId: number;
  workDir?: string;
  userAgent?: string;
  timeZone?: string;
  gitCloneBypass?: boolean;
};
export default ProviderLoaderType;
