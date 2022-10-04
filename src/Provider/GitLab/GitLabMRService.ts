import { Diff } from '../@types/PatchTypes';
import { getPatch } from '../utils/patchProcessor';
import { IGitLabMRService } from './IGitLabMRService';
import {
  MergeRequestNoteSchema,
  DiffSchema,
  DiscussionNotePosition,
} from '@gitbeaker/core/dist/types/types';
import * as Resource from '@gitbeaker/core/dist/types/resources';
import { Gitlab } from '@gitbeaker/node';

import { configs } from '../../Config';

export class GitLabMRService implements IGitLabMRService {
  private readonly projectId: number;
  private readonly mrIid: number;
  private readonly api: Resource.Gitlab;

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
    latestVersion: DiffSchema,
    file: string,
    line: number,
    body: string,
  ): Promise<void> {
    const position: Partial<DiscussionNotePosition> = {
      position_type: 'text',
      base_sha: latestVersion.base_commit_sha,
      start_sha: latestVersion.start_commit_sha,
      head_sha: latestVersion.head_commit_sha,
      old_path: file,
      new_path: file,
      new_line: line,
    };

    await this.api.MergeRequestDiscussions.create(this.projectId, this.mrIid, body, {
      position,
    });
  }

  async getCurrentUserId(): Promise<number> {
    const user = await this.api.Users.current();
    return user.id;
  }

  async listAllNotes(): Promise<MergeRequestNoteSchema[]> {
    return await this.api.MergeRequestNotes.all(this.projectId, this.mrIid);
  }

  async deleteNote(noteId: number): Promise<void> {
    await this.api.MergeRequestNotes.remove(this.projectId, this.mrIid, noteId);
  }

  // github can do someone fancy shit here we cant
  async createNote(note: string): Promise<void> {
    await this.api.MergeRequestNotes.create(this.projectId, this.mrIid, note);
  }

  async diff(): Promise<Diff[]> {
    const changes = (await this.api.MergeRequests.changes(this.projectId, this.mrIid))
      .changes;

    if (!changes) {
      return [];
    } else {
      return changes?.map((d) => ({
        file: d.new_path,
        patch: getPatch(d.diff),
      }));
    }
  }

  async getLatestVersion(): Promise<DiffSchema> {
    const versions = await this.api.MergeRequests.versions(this.projectId, this.mrIid);
    const collected = versions.filter((v) => v.state === 'collected');

    if (collected.length === 0) throw new Error('No collected version in MR');

    return collected[0];
  }
}
