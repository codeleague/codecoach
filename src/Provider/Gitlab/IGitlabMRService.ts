import { Diff } from '../@types/PatchTypes';
import { CommitStatus } from '../GitHub/CommitStatus';
import { MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';

export interface IGitlabMRService {
  listAllNotes(): Promise<MergeRequestNoteSchema[]>;
  getCurrentUserId(): Promise<number>;
  getLatestCommitSha(): Promise<string>;
}
