import { VCS } from '..';
import { IGitHubPRService } from './IGitHubPRService';
import { VCSEngine } from '../CommonVCS/VCSEngine';
import { VCSEngineConfig } from '../@interfaces/VCSEngineConfig';
import { GitHubAdapter } from './GitHubAdapter';
import { LogType } from '../../Parser';

export class GitHub implements VCS {
  private vcsEngine: VCSEngine;

  constructor(private readonly prService: IGitHubPRService, config: VCSEngineConfig) {
    this.vcsEngine = new VCSEngine(config, new GitHubAdapter(prService));
  }

  report(logs: LogType[]): Promise<boolean> {
    return this.vcsEngine.report(logs);
  }
}
