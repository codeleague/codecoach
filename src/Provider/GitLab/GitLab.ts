import { VCS } from '../@interfaces/VCS';
import { LogSeverity, LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';
import { Comment } from '../@types/CommentTypes';
import { Log } from '../../Logger';
import { MessageUtil } from '../utils/message.util';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { IGitLabMRService } from './IGitLabMRService';
import { groupComments } from '../utils/commentUtil';
import { configs } from '../../Config';
import { DiffSchema } from '@gitbeaker/core/dist/types/types';

export class GitLab implements VCS {
  private touchedDiff: Diff[];
  private latestMrVersion: DiffSchema;
  private comments: Comment[];
  private nWarning: number;
  private nError: number;
  private readonly removeOldComment: boolean;

  constructor(private readonly mrService: IGitLabMRService) {
    this.removeOldComment = configs.removeOldComment;
  }

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
      Log.error('GitLab report failed', err);
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
    this.latestMrVersion = await this.mrService.getLatestVersion();
    this.touchedDiff = await this.mrService.diff();

    const touchedFileLog = logs
      .filter(onlySeverity(LogSeverity.error, LogSeverity.warning))
      .filter(onlyIn(this.touchedDiff));

    this.comments = groupComments(touchedFileLog);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);

    Log.debug(`VCS Setup`, {
      sha: this.latestMrVersion.head_commit_sha,
      diff: this.touchedDiff,
      comments: this.comments,
      err: this.nError,
      warning: this.nWarning,
    });
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line } = comment;

    await this.mrService.createMRDiscussion(this.latestMrVersion, file, line, text);
    Log.debug('GitLab create review success', { text, file, line });
    return comment;
  }

  private async removeExistingComments(): Promise<void> {
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

// export class GitLab implements VCS {
//   async report(logs: LogType[]): Promise<void> {
//     // create review comments in commit + only in diff & warning | error
//     // create summary comment in MR
//     // app return 1 or 0 based on result
//     // reject mr
//   }
//
//   // FIND DIFF!
//   // get mr versions
//   // /api/v4/projects/<pid>/merge_requests/<iid>/versions
//   // select latest version with state = "collected"
//
//   // get single version
//   // /api/v4/projects/<pid>/merge_requests/<iid>/versions/<vid>
//   // $.diffs.*.{new_path,new_file,diff}
//
//   // CREATE DISCUSSION
//   // /api/v4/projects/<pid>/merge_requests/<iid>/discussions
//   // param: body, base|head|start sha, path, line
//
//   // CREATE SUMMARY COMMENT
//   // /api/v4/projects/<pid>/merge_requests/<iid>/notes
// }
