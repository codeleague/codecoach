import { VCS } from '../@interfaces/VCS';
import { LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';
import { Log } from '../../Logger';
import { IGitLabMRService } from './IGitLabMRService';
import { DiffSchema } from '@gitbeaker/core/dist/types/types';
import { VCSEngine } from '../CommonVCS/VCSEngine';
import { VCSEngineConfig } from '../@types/VCSEngineConfig';

export class GitLab extends VCSEngine implements VCS {
  private latestMrVersion: DiffSchema;

  constructor(private readonly mrService: IGitLabMRService, config: VCSEngineConfig) {
    super(config);
  }

  async report(logs: LogType[]): Promise<boolean> {
    await this.mrSetup();
    return await super.report(logs);
  }

  private async mrSetup() {
    this.latestMrVersion = await this.mrService.getLatestVersion();
  }

  vcsCreateComment(comment: string): Promise<void> {
    return this.mrService.createNote(comment);
  }

  vcsCreateReviewComment(text: string, file: string, line: number): Promise<void> {
    return this.mrService.createMRDiscussion(this.latestMrVersion, file, line, text);
  }

  vcsDiff(): Promise<Diff[]> {
    return this.mrService.diff();
  }

  vcsGetLatestCommitSha(): string {
    return this.latestMrVersion.head_commit_sha;
  }

  vcsName(): string {
    return 'GitLab';
  }

  async vcsRemoveExistingComments(): Promise<void> {
    const [userId, notes] = await Promise.all([
      this.mrService.getCurrentUserId(),
      this.mrService.listAllNotes(),
    ]);
    Log.debug('Get existing CodeCoach comments completed');

    const deleteNotes = notes
      .filter((note) => note.author.id === userId && !note.system)
      .map((note) => this.mrService.deleteNote(note.id));

    await Promise.all([...deleteNotes]);
    Log.debug('Delete CodeCoach comments completed');
  }
}
