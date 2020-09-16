export interface IProviderConfig {
  provider: string;
  token: string;
  owner: string;
  repo: string;
  baseUrl: string;
  prId: number;
  workDir?: string;
  userAgent: string;
  timeZone: string;
}
