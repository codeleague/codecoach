import { Diff } from '../@types/PatchTypes';
import { getPatch } from '../utils/patchProcessor';
import { IGitLabMRService } from './IGitLabMRService';
import { CommitSchema, MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';
import { Commits, MergeRequestNotes, MergeRequests, Users } from '@gitbeaker/node';
import { configs } from '../../Config';

export class GitLabMRService implements IGitLabMRService {
  private readonly projectId: number;
  private readonly token: string;
  private readonly host: string;
  private readonly mr: number;

  constructor() {
    this.host = configs.gitlabHost;
    this.token = configs.gitlabToken;
    this.projectId = configs.gitlabProjectId;
    this.mr = configs.gitlabMr;
  }

  async getCurrentUserId(): Promise<number> {
    const users = new Users({
      host: this.host,
      token: this.token,
    });
    const user = await users.current();
    return user.id;
  }

  async listAllNotes(): Promise<MergeRequestNoteSchema[]> {
    const mergeRequestNotes = new MergeRequestNotes({
      host: this.host,
      token: this.token,
    });

    return await mergeRequestNotes.all(this.projectId, this.mr);
  }

  async getLatestCommitSha(): Promise<string> {
    const mergeRequests = new MergeRequests({
      host: this.host,
      token: this.token,
    });

    const commits = await mergeRequests.commits(this.projectId, this.mr);
    const sortedCommits = commits.sort((a: CommitSchema, b: CommitSchema) => {
      return a.created_at.getTime() - b.created_at.getTime();
    });

    return sortedCommits[0].id;
  }

  async deleteNote(noteId: number): Promise<void> {
    const mergeRequestNotes = new MergeRequestNotes({
      host: this.host,
      token: this.token,
    });

    mergeRequestNotes.remove(this.projectId, this.mr, noteId);
  }

  // github can do someone fancy shit here we cant
  async createNote(note: string): Promise<void> {
    const mergeRequestNotes = new MergeRequestNotes({
      host: this.host,
      token: this.token,
    });

    mergeRequestNotes.create(this.projectId, this.mr, note);
  }

  async createReviewComment(
    commitId: string,
    note: string,
    file: string,
    line: number,
  ): Promise<void> {
    const commit = new Commits({
      host: this.host,
      token: this.token,
    });

    commit.createComment(this.projectId, commitId, note, { path: file, line: line });
  }

  async diff(): Promise<Diff[]> {
    const mergeRequests = new MergeRequests({
      host: this.host,
      token: this.token,
    });

    const changes = (await mergeRequests.changes(this.projectId, this.mr)).changes;

    if (!changes) {
      return [];
    } else {
      return changes?.map((d) => ({ file: d.new_path, patch: getPatch(d.diff) }));
    }
  }
}
