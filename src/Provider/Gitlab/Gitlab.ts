import { VCS } from '..';
import { Log } from '../../Logger';
import { LogSeverity, LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';
import { CommentFileStructure, CommentStructure, Comment } from '../@types/CommentTypes';
import { CommitStatus } from '../GitHub/CommitStatus';
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
    ) { }

    async report(logs: LogType[]): Promise<void> {
        try {
            await this.setup(logs);

            if (this.removeOldComment) {
                await this.removeExistingComments();
            }
        } catch (err) {
            Log.error('Gitlab report failed', err);
            throw err;
        }

    }

    private async setup(logs: LogType[]) {
        this.commitId = await this.mrService.getLatestCommitSha();
        this.touchedDiff = await this.mrService.diff();

        const touchedFileLog = logs
            .filter(onlySeverity(LogSeverity.error, LogSeverity.warning))
            .filter(onlyIn(this.touchedDiff));

        this.comments = GitHub.groupComments(touchedFileLog);
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

    private async removeExistingComments(): Promise<void> {
        const [userId, notes] = await Promise.all([
            this.mrService.getCurrentUserId(),
            this.mrService.listAllNotes(),
        ]);
        Log.debug('Get existing CodeCoach comments completed');
    }

}
