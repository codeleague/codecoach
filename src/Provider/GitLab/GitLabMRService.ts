import { Diff } from '../../Git/@types/PatchTypes';
import { getPatch } from '../../Git/utils/patchProcessor';
import { IGitLabMRService } from './IGitLabMRService';
import {
  MergeRequestNoteSchema,
  MergeRequestDiffVersionsSchema,
  DiscussionNotePositionOptions,
} from '@gitbeaker/core';
import * as Resources from '@gitbeaker/core';
import { Gitlab } from '@gitbeaker/rest';

import { configs } from '../../Config';
import { Log } from '../../Logger';

export class GitLabMRService implements IGitLabMRService {
  private readonly projectId: number;
  private readonly mrIid: number;
  private readonly api: Resources.Gitlab;

  constructor() {
    this.projectId = configs.gitlabProjectId;
    this.mrIid = configs.gitlabMrIid;

    this.api = new Gitlab({
      host: configs.gitlabHost,
      token: configs.gitlabToken,
    });
  }

  // https://docs.gitlab.com/ee/api/discussions.html#create-new-merge-request-thread
  async createMRDiscussion(
    latestVersion: MergeRequestDiffVersionsSchema,
    file: string,
    line: number,
    body: string,
  ): Promise<void> {
    const position: DiscussionNotePositionOptions = {
      positionType: 'text',
      baseSha: latestVersion.base_commit_sha,
      startSha: latestVersion.start_commit_sha,
      headSha: latestVersion.head_commit_sha,
      oldPath: file,
      newPath: file,
      newLine: line.toString(),
    };

    await this.api.MergeRequestDiscussions.create(this.projectId, this.mrIid, body, {
      position,
    });
  }

  async getCurrentUserId(): Promise<number> {
    const user = await this.api.Users.showCurrentUser();
    return user.id;
  }

  async listAllNotes(): Promise<MergeRequestNoteSchema[]> {
    return await this.api.MergeRequestNotes.all(this.projectId, this.mrIid);
  }

  async deleteNote(noteId: number): Promise<void> {
    await this.deleteNoteWithErrorHandling(noteId);
  }

  private async deleteNoteWithErrorHandling(noteId: number): Promise<void> {
    try {
      await this.api.MergeRequestNotes.remove(this.projectId, this.mrIid, noteId);
    } catch (error: unknown) {
      const errorObj = error as { message?: string; status?: number };
      if (errorObj.message === 'Not Found' || errorObj.status === 404) {
        Log.warn(`Note ${noteId} not found, skipping deletion`);
        return;
      }
      Log.error(`Failed to delete note ${noteId}`, { error: errorObj.message });
      throw error;
    }
  }

  async listAllDiscussions(): Promise<
    Array<{
      id: string;
      notes?: Array<{ id: number; author: { id: number }; body: string }>;
    }>
  > {
    return await this.api.MergeRequestDiscussions.all(this.projectId, this.mrIid);
  }

  async deleteDiscussion(discussionId: string): Promise<void> {
    try {
      const discussion = await this.getDiscussion(discussionId);
      await this.deleteDiscussionNotes(discussion, discussionId);
    } catch (error: unknown) {
      this.handleDiscussionDeletionError(error, discussionId);
    }
  }

  private async getDiscussion(
    discussionId: string,
  ): Promise<{ notes?: Array<{ id: number }> }> {
    return await this.api.MergeRequestDiscussions.show(
      this.projectId,
      this.mrIid,
      discussionId,
    );
  }

  private async deleteDiscussionNotes(
    discussion: { notes?: Array<{ id: number }> },
    discussionId: string,
  ): Promise<void> {
    if (!discussion.notes || discussion.notes.length === 0) {
      return;
    }

    const deletePromises = discussion.notes.map(async (note: { id: number }) => {
      try {
        await this.deleteNoteWithErrorHandling(note.id);
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    });

    const results = await Promise.all(deletePromises);
    this.logDeletionResults(results, discussion.notes.length, discussionId);
  }

  private logDeletionResults(
    results: Array<{ success: boolean }>,
    totalNotes: number,
    discussionId: string,
  ): void {
    const failed = results.filter((r) => !r.success).length;
    if (failed > 0) {
      Log.warn(
        `Failed to delete ${failed}/${totalNotes} notes in discussion ${discussionId}`,
      );
    }
  }

  private handleDiscussionDeletionError(error: unknown, discussionId: string): void {
    const errorObj = error as { message?: string; status?: number };

    if (errorObj.message === 'Not Found' || errorObj.status === 404) {
      Log.warn(`Discussion ${discussionId} not found, skipping deletion`);
      return;
    }

    Log.error(`Failed to delete discussion ${discussionId}`, {
      error: errorObj.message || String(error),
    });
    throw error;
  }

  // github can do someone fancy shit here we cant
  async createNote(note: string): Promise<void> {
    await this.api.MergeRequestNotes.create(this.projectId, this.mrIid, note);
  }

  async diff(): Promise<Diff[]> {
    const changes = await this.api.MergeRequests.allDiffs(this.projectId, this.mrIid);

    if (!changes) {
      return [];
    } else {
      return changes.map((d: { new_path: string; diff: string }) => ({
        file: d.new_path,
        patch: getPatch(d.diff),
      }));
    }
  }

  async getLatestVersion(): Promise<MergeRequestDiffVersionsSchema> {
    const versions = await this.api.MergeRequests.allDiffVersions(
      this.projectId,
      this.mrIid,
    );
    const collected = versions.filter((v: { state: string }) => v.state === 'collected');

    if (collected.length === 0) {
      Log.warn(
        'No collected version in this MR, will use SHA from the latest commit instead.',
      );
      return versions[0];
    }

    return collected[0];
  }
}
