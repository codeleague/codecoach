import { Octokit } from '@octokit/rest';
import { ResponseHeaders } from '@octokit/types';
import { URL } from 'url';

import { GITHUB_COM_API } from '../../app.constants';
import { TIME_ZONE, USER_AGENT } from '../../Config/constants/defaults';
import { Log } from '../../Logger';
import { Diff } from '../@types/PatchTypes';
import { API_PAGE_SIZE_LIMIT } from '../constants/github.provider.constant';
import { getPatch } from '../utils/patchProcessor';
import { CommitStatus } from '../GitHub/CommitStatus';
import { IGitlabMRService } from './IGitlabMRService';
import { CommitSchema, MergeRequestNoteSchema } from '@gitbeaker/core/dist/types/types';
import { Gitlab } from '@gitbeaker/core';
import { Commits, MergeRequestNotes } from '@gitbeaker/node';

type MrRequestBase = {
  owner: string;
  repo: string;
};

export class GitlabMRService implements IGitlabMRService {
  private readonly requestBase: MrRequestBase;
  private readonly adapter: Gitlab;
  private readonly token: string;
  private readonly host: string;

  constructor(token: string, repoUrl: string, private readonly pr: number) {
    const repoUrlObj = new URL(repoUrl);
    this.host = 'https://gitlab.agodadev.io';
    this.token = token;
    const [, owner, repo] = repoUrlObj.pathname.replace(/\.git$/gi, '').split('/');
    this.requestBase = { owner, repo };
  }

  async getCurrentUserId(): Promise<number> {
    const user = await this.adapter.Users.current();
    return user.id;
  }

  async listAllNotes(): Promise<MergeRequestNoteSchema[]>{
    const mergeRequestNotes = new MergeRequestNotes({
      host: this.host,
      token: this.token
    });

    return mergeRequestNotes.all(12, 12); // todo: replace the place holder projectId and MergeRequest Id
  }

  async getLatestCommitSha(): Promise<string> {
    const commits = new Commits({
      host: this.host,
      token: this.token
    });

    const allCommits =  await commits.all(12); // todo: replace the place holder projectId 
    return allCommits[0].id;
  }

  async diff(): Promise<CommitDiffSchema> {
    
  }

}

  
