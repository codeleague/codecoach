import { Diff } from '../../Git/@types/PatchTypes';
import { getPatch } from '../../Git/utils/patchProcessor';
import { IGitLabMRService } from './IGitLabMRService';
import {
  MergeRequestNoteSchema,
  DiffSchema,
  DiscussionNotePosition,
} from '@gitbeaker/core/dist/types/types';
import * as Resource from '@gitbeaker/core/dist/types/resources';
import { Gitlab } from '@gitbeaker/node';

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
    const user = await this.api.Users.current();
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
    const changes = (
      await this.api.MergeRequests.changes(this.gitlabProjectId, this.gitlabMrIid)
    ).changes;

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
    const versions = await this.api.MergeRequests.versions(
      this.gitlabProjectId,
      this.gitlabMrIid,
    );
    const collected = versions.filter((v) => v.state === 'collected');

    if (collected.length === 0) throw new Error('No collected version in MR');

    return collected[0];
  }
}
