type BaseProviderConfig = {
  repoUrl: string;
};

export type PrProviderConfig = {
  token: string;
  prId: number;
  removeOldComment: boolean;
} & BaseProviderConfig;

export type DataProviderConfig = {
  runId: number;
  headCommit: string;
} & BaseProviderConfig;

export type ProviderConfig = PrProviderConfig | DataProviderConfig;
