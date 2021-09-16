import { CommitStatus } from '../GitHub/CommitStatus';
import { Diff } from '../@types/PatchTypes';
import { MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';

export interface IGitlabMRService {
  createNote(note: string): Promise<void>;
  createReviewComment(
    commit: string,
    note: string,
    file: string,
    line: number,
  ): Promise<void>;
  listAllNotes(): Promise<MergeRequestNoteSchema[]>;
  deleteNote(noteId: number): Promise<void>;
  getCurrentUserId(): Promise<number>;
  getLatestCommitSha(): Promise<string>;
  diff(): Promise<Diff[]>;
}
