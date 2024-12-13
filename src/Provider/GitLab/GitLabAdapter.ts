import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { Diff } from '../../Git/@types/PatchTypes';
import { Log } from '../../Logger';
import { IGitLabMRService } from './IGitLabMRService';
import { MergeRequestDiffVersionsSchema, MergeRequestNoteSchema } from '@gitbeaker/core';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

export class GitLabAdapter implements VCSAdapter {
  private latestMrVersion: MergeRequestDiffVersionsSchema;
  private existingComments: Set<string> = new Set();

  constructor(private readonly mrService: IGitLabMRService) {}

  async init(): Promise<void> {
    const [latestVersion, userId, notes] = await Promise.all([
      this.mrService.getLatestVersion(),
      this.mrService.getCurrentUserId(),
      this.mrService.listAllNotes(),
    ]);

    this.latestMrVersion = latestVersion;

    // Store existing bot comments
    notes
      .filter(
        (note: { author: { id: any }; system: any }) =>
          note.author.id === userId && !note.system,
      )
      .forEach((note: { body: string }) => this.existingComments.add(note.body));

    Log.debug(`Found ${this.existingComments.size} existing CodeCoach comments`);
  }

  private generateCommentKey(
    file: string,
    line: number | undefined,
    text: string,
  ): string {
    return `${file}:${line}:${text}`;
  }

  async createComment(comment: string): Promise<void> {
    if (!this.existingComments.has(comment)) {
      await this.mrService.createNote(comment);
      this.existingComments.add(comment);
      Log.debug('Created new comment');
    } else {
      Log.debug('Skipped creating duplicate comment');
    }
  }

  async createReviewComment(
    text: string,
    file: string,
    line: number,
    nLines?: number,
  ): Promise<void> {
    const commentKey = this.generateCommentKey(file, line, text);

    if (!this.existingComments.has(commentKey)) {
      await this.mrService.createMRDiscussion(this.latestMrVersion, file, line, text);
      this.existingComments.add(commentKey);
      Log.debug('Created new review comment');
    } else {
      Log.debug('Skipped creating duplicate review comment');
    }
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

  async removeExistingComments(): Promise<void> {
    Log.debug('Skipping comment removal as we now handle duplicates on creation');
  }
}
