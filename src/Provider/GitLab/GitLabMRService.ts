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
    await this.api.MergeRequestNotes.remove(this.projectId, this.mrIid, noteId);
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
      return changes.map((d) => ({
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
    const collected = versions.filter((v) => v.state === 'collected');

    if (collected.length === 0) throw new Error('No collected version in MR');

    return collected[0];
  }
}
