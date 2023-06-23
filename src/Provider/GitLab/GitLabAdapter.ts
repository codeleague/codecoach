import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { Diff } from '../../Git/@types/PatchTypes';
import { Log } from '../../Logger';
import { IGitLabMRService } from './IGitLabMRService';
import { DiffSchema } from '@gitbeaker/core/dist/types/types';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

export class GitLabAdapter implements VCSAdapter {
  private latestMrVersion: DiffSchema;
  constructor(private readonly mrService: IGitLabMRService) {}

  async init(): Promise<void> {
    this.latestMrVersion = await this.mrService.getLatestVersion();
  }

  async wrapUp(analyzer: IAnalyzerBot): Promise<boolean> {
    return analyzer.isSuccess();
  }

  getName(): string {
    return 'GitLab';
  }

  getLatestCommitSha(): string {
    return this.latestMrVersion.head_commit_sha;
  }

  diff(): Promise<Diff[]> {
    return this.mrService.diff();
  }
  createComment(comment: string): Promise<void> {
    return this.mrService.createNote(comment);
  }

  createReviewComment(text: string, file: string, line: number): Promise<void> {
    return this.mrService.createMRDiscussion(this.latestMrVersion, file, line, text);
  }

  async removeExistingComments(): Promise<void> {
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
