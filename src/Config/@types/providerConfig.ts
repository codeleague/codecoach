export type ProviderConfig = {
  token: string;
  repoUrl: string;
  prId?: number;
  runId?: number;
  latestCommit?: string;
  removeOldComment: boolean;
};
