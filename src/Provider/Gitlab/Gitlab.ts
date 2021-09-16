import { VCS } from '..';
import { Log } from '../../Logger';
import { LogSeverity, LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';
import { CommentFileStructure, CommentStructure, Comment } from '../@types/CommentTypes';
import { IGitlabMRService } from './IGitlabMRService';

export class Gitlab implements VCS {
  private commitId: string;
  private touchedDiff: Diff[];
  private comments: Comment[];
  private nWarning: number;
  private nError: number;

  constructor(
    private readonly mrService: IGitlabMRService,
    private readonly removeOldComment: boolean = false,
  ) {}

  async report(logs: LogType[]): Promise<void> {
    try {
      await this.setup(logs);

      if (this.removeOldComment) {
        await this.removeExistingComments(); // check if does it remove review comments added on a commit or not
      }

      await Promise.all(this.comments.map((c) => this.createReviewComment(c)));
      await this.createSummaryComment();
      // Cannot set commit status

      Log.info('Report commit status completed');
    } catch (err) {
      Log.error('GitHub report failed', err);
      throw err;
    }
  }

  private async createSummaryComment() {
    if (this.nWarning + this.nError > 0) {
      const overview = MessageUtil.generateOverviewMessage(this.nError, this.nWarning);
      await this.mrService.createNote(overview);
      Log.info('Create summary comment completed');
    } else {
      Log.info('No summary comment needed');
    }
  }

  private async setup(logs: LogType[]) {
    this.commitId = await this.mrService.getLatestCommitSha();
    this.touchedDiff = await this.mrService.diff();

    const touchedFileLog = logs
      .filter(onlySeverity(LogSeverity.error, LogSeverity.warning))
      .filter(onlyIn(this.touchedDiff));

    this.comments = Gitlab.groupComments(touchedFileLog);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);

    Log.debug(`VCS Setup`, {
      sha: this.commitId,
      diff: this.touchedDiff,
      comments: this.comments,
      err: this.nError,
      warning: this.nWarning,
    });
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line } = comment;

    await this.mrService.createReviewComment(this.commitId, text, file, line);
    Log.debug('GitHub create review success', { text, file, line });
    return comment;
  }

  private async removeExistingComments(): Promise<void> {
    const [userId, notes] = await Promise.all([
      this.mrService.getCurrentUserId(),
      this.mrService.listAllNotes(),
    ]);
    Log.debug('Get existing CodeCoach comments completed');

    const deleteNotes = notes
      .filter((note) => note.author.id === userId)
      .map((note) => this.mrService.deleteNote(note.id));

    await Promise.all([...deleteNotes]);
    Log.debug('Delete CodeCoach comments completed');
  }

  private static groupComments(logs: LogType[]): Comment[] {
    const commentMap = logs.reduce((map: CommentStructure, log) => {
      const { source: file, line, severity, msg } = log;
      const text = MessageUtil.createMessageWithEmoji(msg, severity);

      if (!line) return map;

      const currentWarnings = map?.[file]?.[line]?.warnings ?? 0;
      const currentErrors = map?.[file]?.[line]?.errors ?? 0;
      const currentText = map?.[file]?.[line]?.text ?? '';

      const nextObject: Comment = {
        text: `${currentText}\n${text}`,
        errors: currentErrors + (severity === LogSeverity.error ? 1 : 0),
        warnings: currentWarnings + (severity === LogSeverity.warning ? 1 : 0),
        file,
        line,
      };

      const fileCommentUpdater: CommentFileStructure = { [line]: nextObject };
      const updatedFileComment = Object.assign({}, map?.[file], fileCommentUpdater);

      const mapUpdater: CommentStructure = { [file]: updatedFileComment };
      return Object.assign({}, map, mapUpdater);
    }, {});

    return Object.values(commentMap).flatMap((file) => Object.values(file));
  }
}
