import { LogType } from '../../Parser';
import { Comment } from '../@types/CommentTypes';
import { Diff } from '../../Git/@types/PatchTypes';

export interface IAnalyzerBot {
  touchedFileLog: LogType[];
  comments: Comment[];
  nError: number;
  nWarning: number;

  analyze(logs: LogType[], touchedDiff: Diff[]): void;

  shouldGenerateOverview(): boolean;

  getOverviewMessage(): string;

  getCommitDescription(): string;

  isSuccess(): boolean;
}
