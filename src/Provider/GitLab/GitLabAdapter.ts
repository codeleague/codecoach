import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { Diff } from '../../Git/@types/PatchTypes';
import { Log } from '../../Logger';
import { IGitLabMRService } from './IGitLabMRService';
import { MergeRequestDiffVersionsSchema } from '@gitbeaker/core';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';
import { Comment } from '../../AnalyzerBot/@types/CommentTypes';

export class GitLabAdapter implements VCSAdapter {
  private latestMrVersion: MergeRequestDiffVersionsSchema;
  private existingComments: Set<string> = new Set();
  private existingCommentIds: Map<string, number> = new Map();
  private existingDiscussionIds: Map<string, string> = new Map();

  constructor(private readonly mrService: IGitLabMRService) {}

  async init(): Promise<void> {
    const [latestVersion, userId, notes, discussions] = await Promise.all([
      this.mrService.getLatestVersion(),
      this.mrService.getCurrentUserId(),
      this.mrService.listAllNotes(),
      this.mrService.listAllDiscussions(),
    ]);

    this.latestMrVersion = latestVersion;

    // Store existing bot comments and their IDs
    notes
      .filter(
        (note: { author: { id: number }; system: boolean }) =>
          note.author.id === userId && !note.system,
      )
      .forEach((note: { id: number; body: string }) => {
        this.existingComments.add(note.body);
        this.existingCommentIds.set(note.body, note.id);
      });

    // Store existing discussions and their IDs
    discussions
      .filter(
        (discussion: { notes?: Array<{ author: { id: number } }> }) =>
          discussion.notes &&
          discussion.notes.some(
            (note: { author: { id: number } }) => note.author.id === userId,
          ),
      )
      .forEach(
        (discussion: {
          id: string;
          notes?: Array<{ author: { id: number }; body: string }>;
        }) => {
          if (discussion.notes) {
            discussion.notes
              .filter((note: { author: { id: number } }) => note.author.id === userId)
              .forEach((note: { body: string }) => {
                const commentKey = this.generateCommentKey('', 0, note.body);
                this.existingComments.add(commentKey);
                this.existingDiscussionIds.set(commentKey, discussion.id);
              });
          }
        },
      );

    Log.debug(`Found ${this.existingComments.size} existing CodeCoach comments`);
  }

  private generateCommentKey(file: string, line: number, text: string): string {
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

  async createReviewComment(text: string, file: string, line: number): Promise<void> {
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

  async removeExistingComments(currentComments: Comment[]): Promise<void> {
    const currentIssueKeys = this.createCurrentIssueKeys(currentComments);
    const commentsToDelete = this.prepareCommentsForDeletion(currentIssueKeys);

    if (commentsToDelete.length > 0) {
      await this.executeCommentDeletions(commentsToDelete);
    } else {
      Log.debug('No outdated comments to delete');
    }
  }

  private createCurrentIssueKeys(currentComments: Comment[]): Set<string> {
    const currentIssueKeys = new Set<string>();
    currentComments.forEach((comment) => {
      const key = this.generateCommentKey(comment.file, comment.line, comment.text);
      currentIssueKeys.add(key);
    });
    return currentIssueKeys;
  }

  private prepareCommentsForDeletion(currentIssueKeys: Set<string>): Promise<void>[] {
    const commentsToDelete: Promise<void>[] = [];

    // Check regular comments
    this.existingCommentIds.forEach((commentId, commentText) => {
      if (!currentIssueKeys.has(commentText)) {
        this.addCommentDeletion(commentId, commentText, commentsToDelete);
      }
    });

    // Check discussion comments
    this.existingDiscussionIds.forEach((discussionId, commentKey) => {
      if (!currentIssueKeys.has(commentKey)) {
        this.addDiscussionDeletion(discussionId, commentKey, commentsToDelete);
      }
    });

    return commentsToDelete;
  }

  private addCommentDeletion(
    commentId: number,
    commentText: string,
    commentsToDelete: Promise<void>[],
  ): void {
    if (commentId && typeof commentId === 'number') {
      commentsToDelete.push(this.mrService.deleteNote(commentId));
    } else {
      Log.warn(`Invalid comment ID found: ${commentId}, skipping deletion`);
    }
    this.existingComments.delete(commentText);
    this.existingCommentIds.delete(commentText);
  }

  private addDiscussionDeletion(
    discussionId: string,
    commentKey: string,
    commentsToDelete: Promise<void>[],
  ): void {
    if (discussionId && typeof discussionId === 'string') {
      commentsToDelete.push(this.mrService.deleteDiscussion(discussionId));
    } else {
      Log.warn(`Invalid discussion ID found: ${discussionId}, skipping deletion`);
    }
    this.existingComments.delete(commentKey);
    this.existingDiscussionIds.delete(commentKey);
  }

  private async executeCommentDeletions(
    commentsToDelete: Promise<void>[],
  ): Promise<void> {
    const results = await this.performDeletions(commentsToDelete);
    this.logDeletionResults(results, commentsToDelete.length);
  }

  private async performDeletions(
    commentsToDelete: Promise<void>[],
  ): Promise<{ succeeded: number; failed: number }> {
    let succeeded = 0;
    let failed = 0;

    for (const deletePromise of commentsToDelete) {
      try {
        await deletePromise;
        succeeded++;
      } catch (error: unknown) {
        failed++;
        Log.debug('Failed to delete individual comment', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { succeeded, failed };
  }

  private logDeletionResults(
    results: { succeeded: number; failed: number },
    totalComments: number,
  ): void {
    if (results.failed > 0) {
      Log.warn(
        `Deleted ${results.succeeded}/${totalComments} outdated comments, ${results.failed} failed`,
      );
    } else {
      Log.debug(`Deleted ${results.succeeded} outdated comments`);
    }
  }
}
