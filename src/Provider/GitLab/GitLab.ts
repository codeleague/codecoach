import { VCS } from '../@interfaces/VCS';
import { IGitLabMRService } from './IGitLabMRService';
import { VCSEngine } from '../CommonVCS/VCSEngine';
import { VCSEngineConfig } from '../@interfaces/VCSEngineConfig';
import { GitLabAdapter } from './GitLabAdapter';
import { LogType } from '../../Parser';

export class GitLab implements VCS {
  private vcsEngine: VCSEngine;

  constructor(private readonly mrService: IGitLabMRService, config: VCSEngineConfig) {
    this.vcsEngine = new VCSEngine(config, new GitLabAdapter(mrService));
  }

  report(logs: LogType[]): Promise<boolean> {
    return this.vcsEngine.report(logs);
  }
}
