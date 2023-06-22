import { MergeRequestNoteSchema, DiffSchema } from '@gitbeaker/core/dist/types/types';
import { Diff } from '../../Git/@types/PatchTypes';

export interface IGitLabMRService {
  createNote(note: string): Promise<void>;
  listAllNotes(): Promise<MergeRequestNoteSchema[]>;
  deleteNote(noteId: number): Promise<void>;
  getCurrentUserId(): Promise<number>;
  diff(): Promise<Diff[]>;

  getLatestVersion(): Promise<DiffSchema>;
  createMRDiscussion(
    latestVersion: DiffSchema,
    file: string,
    line: number,
    body: string,
  ): Promise<void>;
}
