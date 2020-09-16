import { Report, ReportType } from 'src/Report/Report';
import { IProviderConfig } from './IProviderConfig';
import { ProviderCustomConfigType as ProviderCustomConfigLoaderType } from './ProviderCustomConfigType';

export type ProviderConfigType = IProviderConfig &
  ProviderCustomConfigLoaderType & { repoUrl: string; baseUrl: string };
export interface IProvider {
  clone(): Promise<void>;
  report(reportData: Report): Promise<void>;
}

const WORK_DIR = '../../tmp/src';
const USER_AGENT = 'CodeCoach';
const TIME_ZONE = 'Asia/Bangkok';

export class Provider implements IProvider {
  config: ProviderConfigType;
  adapter: unknown;

  constructor(config: ProviderCustomConfigLoaderType) {
    this.config = config as ProviderConfigType;
    this.config.workDir = config.workDir || WORK_DIR;
    this.config.userAgent = config.userAgent || USER_AGENT;
    this.config.timeZone = config.timeZone || TIME_ZONE;
  }
  report(reportData: ReportType): Promise<void> {
    throw new Error('Method not implemented.');
  }

  clone(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
