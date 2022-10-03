import { MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';
import { Diff } from '../@types/PatchTypes';

export interface IGitLabMRService {
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
