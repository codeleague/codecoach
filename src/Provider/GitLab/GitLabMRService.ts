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

export class GitLabMRService implements IGitLabMRService {
  private readonly gitlabHost: string;
  private readonly gitlabProjectId: number;
  private readonly gitlabMrIid: number;
  private readonly gitlabToken: string;
  private readonly api: Resource.Gitlab;

  constructor(
    gitlabHost: string,
    gitlabProjectId: number,
    gitlabMrIid: number,
    gitlabToken: string,
  ) {
    this.gitlabHost = gitlabHost;
    this.gitlabProjectId = gitlabProjectId;
    this.gitlabMrIid = gitlabMrIid;
    this.gitlabToken = gitlabToken;

    this.api = new Gitlab({
      host: this.gitlabHost,
      token: this.gitlabToken,
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

    await this.api.MergeRequestDiscussions.create(
      this.gitlabProjectId,
      this.gitlabMrIid,
      body,
      {
        position,
      },
    );
  }

  async getCurrentUserId(): Promise<number> {
    const user = await this.api.Users.showCurrentUser();
    return user.id;
  }

  async listAllNotes(): Promise<MergeRequestNoteSchema[]> {
    return await this.api.MergeRequestNotes.all(this.gitlabProjectId, this.gitlabMrIid);
  }

  async deleteNote(noteId: number): Promise<void> {
    await this.api.MergeRequestNotes.remove(
      this.gitlabProjectId,
      this.gitlabMrIid,
      noteId,
    );
  }

  // github can do someone fancy shit here we cant
  async createNote(note: string): Promise<void> {
    await this.api.MergeRequestNotes.create(this.gitlabProjectId, this.gitlabMrIid, note);
  }

  async diff(): Promise<Diff[]> {
    const changes = await this.api.MergeRequests.allDiffs(this.gitlabProjectId, this.gitlabMrIid);

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
      this.gitlabProjectId,
      this.gitlabMrIid,
    );
    const collected = versions.filter((v) => v.state === 'collected');

    if (collected.length === 0) throw new Error('No collected version in MR');

    return collected[0];
  }
}
