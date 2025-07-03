import { MergeRequestNoteSchema, MergeRequestDiffVersionsSchema } from '@gitbeaker/core';
import { Diff } from '../../Git/@types/PatchTypes';

export interface IGitLabMRService {
  createNote(note: string): Promise<void>;
  listAllNotes(): Promise<MergeRequestNoteSchema[]>;
  deleteNote(noteId: number): Promise<void>;
  listAllDiscussions(): Promise<
    Array<{
      id: string;
      notes?: Array<{ id: number; author: { id: number }; body: string }>;
    }>
  >;
  deleteDiscussion(discussionId: string): Promise<void>;
  getCurrentUserId(): Promise<number>;
  diff(): Promise<Diff[]>;
  getLatestVersion(): Promise<MergeRequestDiffVersionsSchema>;
  createMRDiscussion(
    latestVersion: MergeRequestDiffVersionsSchema,
    file: string,
    line: number,
    body: string,
  ): Promise<void>;
}
