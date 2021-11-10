type BaseProviderConfig = {
  token: string;
  repoUrl: string;
};

export type PrProviderConfig = {
  prId: number;
  removeOldComment: boolean;
} & BaseProviderConfig;

export type DataProviderConfig = {
  runId: number;
  latestCommit: string;
} & BaseProviderConfig;

export type ProviderConfig = PrProviderConfig | DataProviderConfig;
